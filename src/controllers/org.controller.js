const Organization = require('../models/Organization');
const Admin = require('../models/Admin');
const { createOrgCollection, deleteOrgCollection } = require('../config/database');
const mongoose = require('mongoose');

const generateCollectionName = (orgName) => {
  return `org_${orgName.toLowerCase().replace(/\s+/g, '_')}`;
};

const createOrganization = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const { organization_name, email, password } = req.body;
        if (!organization_name || !email || !password) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Please provide organization_name, email, and password',
            });
        }
        if (password.length < 6) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long',
            });
        }
        const existingOrg = await Organization.findOne({ organization_name });
        if (existingOrg) {
            await session.abortTransaction();
            return res.status(409).json({
                success: false,
                message: 'Organization with this name already exists',
            });
        }
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            await session.abortTransaction();
            return res.status(409).json({
                success: false,
                message: 'Admin with this email already exists',
            });
        }
        const collectionName = generateCollectionName(organization_name);
        const organization = new Organization({
            organization_name,
            collection_name: collectionName,
            admin_id: new mongoose.Types.ObjectId(),
        });
        await organization.save({ session });
        const admin = new Admin({
            email,
            password,
            organization_id: organization._id,
        });
        await admin.save({ session });
        organization.admin_id = admin._id;
        await organization.save({ session });
        await createOrgCollection(collectionName);
        await session.commitTransaction();
        res.status(201).json({
            success: true,
            message: 'Organization created successfully',
            data: {
                organization_id: organization._id,
                organization_name: organization.organization_name,
                collection_name: organization.collection_name,
                admin_email: admin.email,
                created_at: organization.created_at,
            },
        });
    }
    catch(error){
        await session.abortTransaction();
        console.error('Create Organization Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating organization',
            error: error.message,
        });
    }
    finally {
        session.endSession();
    }
};

const getOrganization = async (req, res) => {
    try{
        const { organization_name } = req.query;
        if (!organization_name) {
            return res.status(400).json({
                success: false,
                message: 'Please provide organization_name',
            });
        }
        const organization = await Organization.findOne({ organization_name }).populate(
            'admin_id',
            'email created_at'
        );
        if (!organization) {
            return res.status(404).json({
                success: false,
                message: 'Organization not found',
            });
        }
        res.status(200).json({
            success: true,
            data: {
                organization_id: organization._id,
                organization_name: organization.organization_name,
                collection_name: organization.collection_name,
                admin: {
                email: organization.admin_id.email,
                created_at: organization.admin_id.created_at,
                },
                created_at: organization.created_at,
                updated_at: organization.updated_at,
            },
        });
    }
    catch (error) {
        console.error('Get Organization Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching organization',
            error: error.message,
        });
    }
};

const updateOrganization = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try{
        const { organization_name, email, password } = req.body;
        if (!organization_name || !email || !password) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Please provide organization name, email, and password',
            });
        }
        const organization = await Organization.findOne({ organization_name });
        if (!organization) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Organization not found',
            });
        }
        const admin = await Admin.findById(organization.admin_id);
        if (!admin) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Admin not found',
            });
        }
        admin.email = email;
        admin.password = password;
        await admin.save({ session });
        organization.updated_at = Date.now();
        await organization.save({ session });
        await session.commitTransaction();
        res.status(200).json({
            success: true,
            message: 'Organization updated successfully',
            data: {
                organization_id: organization._id,
                organization_name: organization.organization_name,
                admin_email: admin.email,
                updated_at: organization.updated_at,
            },
        });
    }
    catch(error){
        await session.abortTransaction();
        console.error('Update Organization Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating organization',
            error: error.message,
        });
    }
    finally {
        session.endSession();
    }
};

const deleteOrganization = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();
    try{
        const { organization_name } = req.body;
        if (!organization_name) {
            await session.abortTransaction();
            return res.status(400).json({
                success: false,
                message: 'Please provide organization_name',
            });
        }
        const organization = await Organization.findOne({ organization_name });
        if (!organization) {
            await session.abortTransaction();
            return res.status(404).json({
                success: false,
                message: 'Organization not found',
            });
        }
        if (req.admin.organizationId.toString() !== organization._id.toString()) {
        await session.abortTransaction();
            return res.status(403).json({
                success: false,
                message: 'You are not authorized to delete this organization',
            });
        }
        await deleteOrgCollection(organization.collection_name);
        await Admin.findByIdAndDelete(organization.admin_id, { session });
        await Organization.findByIdAndDelete(organization._id, { session });
        await session.commitTransaction();
        res.status(200).json({
            success: true,
            message: 'Organization deleted successfully',
        });
    }
    catch (error) {
        await session.abortTransaction();
        console.error('Delete Organization Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting organization',
            error: error.message,
        });
    } 
    finally {
        session.endSession();
    }
};

module.exports = {
  createOrganization,
  getOrganization,
  updateOrganization,
  deleteOrganization,
};
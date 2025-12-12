const Admin = require('../models/Admin');
const jwt = require('jsonwebtoken');

const adminLogin = async (req, res) => {
    try{
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }
        const admin = await Admin.findOne({ email }).populate('organization_id');

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }
        const isPasswordValid = await admin.comparePassword(password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials',
            });
        }
        const token = jwt.sign(
            {
                adminId: admin._id,
                organizationId: admin.organization_id._id,
                email: admin.email,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRE || '7d',
            }
        );
        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                token,
                admin: {
                    id: admin._id,
                    email: admin.email,
                    organization: {
                        id: admin.organization_id._id,
                        name: admin.organization_id.organization_name,
                        collection_name: admin.organization_id.collection_name,
                    },
                },
            },
        });
    }
    catch (error) {
        console.error('Admin Login Error:', error);
        res.status(500).json({
            success: false,
            message: 'Error during login',
            error: error.message,
        });
    }
};

module.exports = {
  adminLogin,
};
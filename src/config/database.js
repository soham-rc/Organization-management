const mongoose = require('mongoose');
let masterConnection = null;

const connectMasterDB = async () => {
  try {
    if (masterConnection) {
      return masterConnection;
    }
    masterConnection = await mongoose.connect(process.env.MONGODB_URI);

    console.log('Master Database Connected Successfully');
    return masterConnection;
  } catch (error) {
    console.error('Master Database Connection Error:', error.message);
    process.exit(1);
  }
};

const getMasterConnection = () => {
  if (!masterConnection) {
    throw new Error('Master database not connected');
  }
  return mongoose.connection;
};

const createOrgCollection = async (collectionName) => {
  try {
    const db = mongoose.connection.db;
    const collections = await db.listCollections({ name: collectionName }).toArray();
    
    if (collections.length > 0) {
      console.log(`Collection ${collectionName} already exists`);
      return;
    }
    await db.createCollection(collectionName);
    console.log(`Created collection: ${collectionName}`);

  } catch (error) {
    console.error('Error creating collection:', error.message);
    throw error;
  }
};

const deleteOrgCollection = async (collectionName) => {
  try {
    const db = mongoose.connection.db;
    await db.dropCollection(collectionName);
    console.log(`Deleted collection: ${collectionName}`);
  } catch (error) {
    if (error.message.includes('ns not found')) {
      console.log(`Collection ${collectionName} does not exist`);
      return;
    }
    console.error('Error deleting collection:', error.message);
    throw error;
  }
};

module.exports = {
  connectMasterDB,
  getMasterConnection,
  createOrgCollection,
  deleteOrgCollection,
};
const mongoose = require('mongoose');

const organizationSchema = new mongoose.Schema(
  {
    organization_name: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    collection_name: {
      type: String,
      required: true,
      unique: true,
    },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
    },
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Organization = mongoose.model('Organization', organizationSchema);
module.exports = Organization;
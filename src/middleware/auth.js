const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');

const authenticate = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided. Authentication required.',
            });
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const admin = await Admin.findById(decoded.adminId);
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token. Admin not found.',
            });
        }
        req.admin = {
            id: decoded.adminId,
            organizationId: decoded.organizationId,
            email: admin.email,
        };
        next();
    }
    catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token.',
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token expired.',
            });
        }
         return res.status(500).json({
            success: false,
            message: 'Authentication error.',
            error: error.message,
        });
    }
};

module.exports = authenticate;
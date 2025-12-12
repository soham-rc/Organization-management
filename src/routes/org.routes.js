const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/auth');
const {createOrganization,getOrganization,updateOrganization,deleteOrganization} = require('../controllers/org.controller');

router.post('/create', createOrganization);
router.get('/get', getOrganization);

router.put('/update', authenticate, updateOrganization);
router.delete('/delete', authenticate, deleteOrganization);

module.exports = router;
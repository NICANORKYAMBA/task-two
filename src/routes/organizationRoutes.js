const express = require('express');
const {
    createOrganization,
    getUserOrganizations,
    getOrganization,
    addUserToOrganization
} = require('../controllers/organizationController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', authMiddleware, createOrganization);
router.get('/', authMiddleware, getUserOrganizations);
router.get('/:orgId', authMiddleware, getOrganization);
router.post('/:orgId/users', authMiddleware, addUserToOrganization);

module.exports = router;
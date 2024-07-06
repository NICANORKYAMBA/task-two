const {
    createNewOrganization,
    getAllUserOrganizations,
    getOrganizationById,
    addUserToOrg
} = require('../services/organizationService');

const createOrganization = async (req, res) => {
    const { name, description } = req.body;
    const { userId } = req.user;

    try {
        const response = await createNewOrganization({
            userId,
            name,
            description
        });

        res.status(201).json(response);
    } catch (error) {
        res.status(400).json({
            status: 'Bad Request',
            message: 'Client error',
            statusCode: 400
        });
    }
}

const getUserOrganizations = async (req, res) => {
    const { userId } = req.user;

    try {
        const response = await getAllUserOrganizations(userId);
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({
            status: 'Bad Request',
            message: 'Client error',
            statusCode: 400
        });
    }
}

const getOrganization = async (req, res) => {
    const { orgId } = req.params;

    try {
        const response = await getOrganizationById(orgId);
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json({
            status: 'Bad Request',
            message: 'Client error',
            statusCode: 400
        });
    }
}

const addUserToOrganization = async (req, res) => {
    const { orgId } = req.params;
    const { userId } = req.body;

    try {
        const response = await addUserToOrg({ orgId, userId });
        res.status(200).json(response);
    } catch (err) {
        res.status(400).json({
            status: 'Bad Request',
            message: 'Client error',
            statusCode: 400
        });
    }
};

module.exports = {
    createOrganization,
    getUserOrganizations,
    getOrganization,
    addUserToOrganization
};
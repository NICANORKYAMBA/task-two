const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const createNewOrganization = async ({ userId, name, description }) => {
    try {
        const organization = await prisma.organization.create({
            data: {
                name,
                description,
                users: {
                    create: {
                        userId
                    }
                }
            }
        });

        if (!organization) {
            throw new Error('Error creating organization');
        }

        return {
            status: 'success',
            message: 'Organization created successfully',
            data: {
                orgId: organization.orgId,
                name: organization.name,
                description: organization.description
            }
        };
    } catch (err) {
        throw new Error('Error creating organization');
    }
}

const getAllUserOrganizations = async (userId) => {
    try {
        const organizations = await prisma.organizationUser.findMany({
            where: { userId },
            include: {
                organization: true
            }
        });

        if (!organizations || organizations.length === 0) {
            return {
                status: 'success',
                message: 'User has no organizations',
                data: { organizations: [] }
            };
        }

        const orgs = organizations.map(org => ({
            orgId: org.organization.orgId,
            name: org.organization.name,
            description: org.organization.description
        }));

        return {
            status: 'success',
            message: 'User organizations retrieved successfully',
            data: { organizations: orgs }
        };
    } catch (err) {
        throw new Error('Error retrieving user organizations');
    }
}

const getOrganizationById = async (orgId) => {
    try {
        const organization = await prisma.organization.findUnique({
            where: { orgId }
        });

        if (!organization) {
            throw new Error('Organization not found');
        }

        return {
            status: 'success',
            message: 'Organization retrieved successfully',
            data: {
                orgId: organization.orgId,
                name: organization.name,
                description: organization.description
            }
        };
    } catch (err) {
        throw new Error('Error retrieving organization');
    }
}

const addUserToOrg = async ({ orgId, userId }) => {
    try {
        const organization = await prisma.organization.findUnique({
            where: { orgId }
        });

        if (!organization) {
            throw new Error('Organization not found');
        }

        const user = await prisma.user.findUnique({
            where: { userId }
        });

        if (!user) {
            throw new Error('User not found');
        }

        const orgUser = await prisma.organizationUser.create({
            data: {
                userId,
                orgId
            }
        });

        if (!orgUser) {
            throw new Error('Error adding user to organization');
        }

        return {
            status: 'success',
            message: 'User added to organization successfully',
            data: {
                orgId: organization.orgId,
                userId: user.userId,
                name: organization.name,
                description: organization.description
            }
        };
    } catch (err) {
        throw new Error('Error adding user to organization');
    }
}

module.exports = {
    createNewOrganization,
    getAllUserOrganizations,
    getOrganizationById,
    addUserToOrg
}
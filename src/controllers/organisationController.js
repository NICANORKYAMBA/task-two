const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const createOrganisation = async (req, res, next) => {
    const { name, description } = req.body;
    const { userId } = req.user;

    try {
        const organisation = await prisma.organisation.create({
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

        res.status(201).json({
            status: 'success',
            message: 'Organisation created successfully',
            data: {
                orgId: organisation.orgId,
                name: organisation.name,
                description: organisation.description
            }
        });
    } catch (error) {
        next(error);
    }
}

const getUserOrganisations = async (req, res, next) => {
    const { userId } = req.user;

    try {
        const user = await prisma.user.findUnique({
            where: {
                userId
            },
            include: {
                organisations: true
            }
        });

        res.status(200).json({
            status: 'success',
            message: 'User organisations retrieved successfully',
            data: user.organisations
        });
    } catch (error) {
        next(error);
    }
}

const getOrganisation = async (req, res, next) => {
    const { orgId } = req.params;

    try {
        const organisation = await prisma.organisation.findUnique({
            where: {
                orgId
            }
        });

        res.status(200).json({
            status: 'success',
            message: 'Organisation retrieved successfully',
            data: organisation
        });
    } catch (error) {
        next(error);
    }
}

const addUserToOrganisation = async (req, res, next) => {
    const { orgId } = req.params;
    const { userId } = req.body;

    try {
        const organisation = await prisma.organisation.findUnique({
            where: {
                orgId
            }
        });

        if (!organisation) {
            return res.status(404).json({ message: 'Organisation not found' });
        }

        const user = await prisma.user.findUnique({
            where: {
                userId
            }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const userOrg = await prisma.userOrganisation.create({
            data: {
                userId,
                orgId
            }
        });

        res.status(201).json({
            status: 'success',
            message: 'User added to organisation successfully',
            data: userOrg
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createOrganisation,
    getUserOrganisations,
    getOrganisation,
    addUserToOrganisation
};
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getUserById = async ({ id, userId }) => {
    // Check if the requested user is the logged-in user
    if (id === userId) {
        const user = await prisma.user.findUnique({
            where: {
                userId: id,
            },
        });

        if (!user) {
            throw new Error('User not found');
        }

        return {
            userId: user.userId,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            phone: user.phone,
        };
    }

    // Check if they belong to the same organization
    const userInSameOrganization = await prisma.organizationUser.findFirst({
        where: {
            userId: id,
            orgId: {
                in: await prisma.organizationUser.findMany({
                    where: {
                        userId: userId,
                    },
                    select: {
                        orgId: true,
                    },
                }).then(orgs => orgs.map(org => org.orgId)),
            },
        },
    });

    if (!userInSameOrganization) {
        throw new Error('User not found in the same organization');
    }

    const user = await prisma.user.findUnique({
        where: {
            userId: id,
        },
    });

    if (!user) {
        throw new Error('User not found');
    }

    return {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
    };
};

module.exports = {
    getUserById,
};

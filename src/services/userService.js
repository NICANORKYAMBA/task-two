const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getUserById = async ({ id, userId }) => {
    // Check if the requested user is the logged-in user
    let user = await prisma.user.findUnique({
        where: {
            userId: id,
        },
    });

    // If not, check if they belong to the same organization
    if (!user) {
        user = await prisma.user.findFirst({
            where: {
                userId: id,
                organizations: {
                    some: { userId },
                },
            },
        });
    }

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
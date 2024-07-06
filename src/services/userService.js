const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getUserById = async ({ id, userId }) => {
    const user = await prisma.user.findFirst({
        where: {
            userId: id,
            organisations: {
                some: { userId }
            }
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    return {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone
    };
};

module.exports = {
    getUserById
};
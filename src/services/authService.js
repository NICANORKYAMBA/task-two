const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const generateToken = require('../utils/generateToken');

const prisma = new PrismaClient();

const registerUser = async ({
    firstName,
    lastName,
    email,
    password,
    phone
}) => {
    const existingUser = await prisma.user.findUnique({
        where: { email }
    });

    if (existingUser) {
        throw new Error('Email already in use');
    }

    const hashedPassword = await hashPassword(password);

    const result = await prisma.$transaction(async (prisma) => {
        const user = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                phone
            }
        });

        const orgName = `${firstName}'s Organization`;

        await prisma.organization.create({
            data: {
                name: orgName,
                users: {
                    create: {
                        userId: user.userId,
                    }
                }
            }
        });

        return user;
    });

    const token = generateToken(result.userId);

    return {
        status: 'success',
        message: 'Registration successful',
        data: {
            accessToken: token,
            user: {
                userId: result.userId,
                firstName: result.firstName,
                lastName: result.lastName,
                email: result.email,
                phone: result.phone,
            },
        }
    };
};

const loginUser = async ({ email, password }) => {
    const user = await prisma.user.findUnique({
        where: { email },
    });

    if (!user) {
        throw new Error('Invalid email or password');
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
        throw new Error('Authentication failed');
    }

    const token = generateToken(user.userId);

    return {
        status: 'success',
        message: 'Login successful',
        data: {
            accessToken: token,
            user: {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
            },
        }
    };
};

module.exports = {
    registerUser,
    loginUser,
}
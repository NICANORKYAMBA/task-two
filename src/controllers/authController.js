const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { hashPassword, comparePassword } = require('../utils/hashPassword');
const generateToken = require('../utils/generateToken');

const register = async (req, res, next) => {
    const { firstName, lastName, email, password, phone } = req.body;

    try {
        const hashedPassword = await hashPassword(password);
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

        const organization = await prisma.organization.create({
            data: {
                name: orgName,
                users: {
                    create: {
                        userId: user.userId
                    }
                }
            }
        });

        const token = generateToken(user.userId);

        res.status(201).json({
            status: 'success',
            message: 'Registration successful',
            data: {
                userId: user.userId,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                phone: user.phone,
            }
        });
    } catch (error) {
        next(error);
    }
}

const login = async (req, res, next) => {
    const { email, password } = req.body;

    try {
        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const isMatch = await comparePassword(password, user.password);

        if (!isMatch) {
            return res.status(401).json({
                status: 'Bad request',
                message: 'Authentication failed',
                statusCode: 401
            })
        }

        const token = generateToken(user.userId);

        res.status(200).json({
            status: 'success',
            message: 'Login successful',
            data: {
                token,
                data: {
                    userId: user.userId,
                    firstName: user.firstName,
                    lastName: user.lastName,
                    email: user.email,
                    phone: user.phone
                }
            }
        });
    } catch (error) {
        next(error);
    }
}

module.exports = {
    register,
    login
};
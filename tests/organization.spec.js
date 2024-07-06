const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { expect } = require('chai');
const { getAllUserOrganizations } = require('../src/services/organizationService');
const uuid = require('uuid');

describe('Organization Service', () => {
    beforeEach(async () => {
        await prisma.organizationUser.deleteMany({});
        await prisma.organization.deleteMany({});
        await prisma.user.deleteMany({});
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    it('should not allow users to see data from organizations they do not belong to', async () => {
        const userId = uuid.v4();
        const otherUserId = uuid.v4();

        const user = await prisma.user.create({
            data: {
                userId,
                firstName: 'John',
                lastName: 'Doe',
                email: `johndoe-${uuid.v4()}@example.com`,
                password: 'password123',
                phone: '1234567890',
            }
        });

        const otherUser = await prisma.user.create({
            data: {
                userId: otherUserId,
                firstName: 'Jane',
                lastName: 'Smith',
                email: `janesmith-${uuid.v4()}@example.com`,
                password: 'password123',
                phone: '9876543210',
            }
        });

        const organization = await prisma.organization.create({
            data: {
                name: 'Test Organization',
                description: 'A test organization',
                users: {
                    create: {
                        userId
                    }
                }
            }
        });

        const response = await getAllUserOrganizations(otherUserId);

        expect(response).to.have.property('status', 'success');
        expect(response).to.have.property('message', 'User has no organizations');
    });
});
const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../src/app');
const uuid = require('uuid');
const jwt = require('jsonwebtoken');
const generateToken = require('../src/utils/generateToken');

const prisma = new PrismaClient();

beforeAll(async () => {
    await prisma.$connect();
});

afterAll(async () => {
    await prisma.$disconnect();
});

beforeEach(async () => {
    await cleanDatabase();
});

afterEach(async () => {
    await cleanDatabase();
});

const cleanDatabase = async () => {
    await prisma.organizationUser.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.organization.deleteMany({});
};

describe('Token Generation', () => {
    it('should generate a valid token', () => {
        const userId = uuid.v4();
        const token = generateToken(userId);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        expect(decoded).toHaveProperty('userId', userId);
    });

    it('should expire at the correct time', () => {
        const userId = uuid.v4();
        const token = generateToken(userId);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const expirationTime = new Date(decoded.exp * 1000);
        const currentTime = new Date();

        expect(expirationTime.getTime()).toBeGreaterThan(currentTime.getTime());
    });
});

// Helper function to create a user with organizations
const createUserWithOrganizations = async () => {
    const userId = uuid.v4();

    await prisma.user.create({
        data: {
            userId,
            firstName: 'John',
            lastName: 'Doe',
            email: `johndoe-${uuid.v4()}@example.com`,
            password: 'password12345',
            phone: '1234567890',
        }
    });

    const org1 = await prisma.organization.create({
        data: {
            name: 'Test Organization 1',
            description: 'A test organization',
            users: {
                create: {
                    userId
                }
            }
        }
    });

    const org2 = await prisma.organization.create({
        data: {
            name: 'Test Organization 2',
            description: 'Another test organization',
            users: {
                create: {
                    userId
                }
            }
        }
    });

    return { userId, org1, org2 };
};

describe('Organization Access', () => {
    beforeAll(async () => {
        await prisma.$connect();
    });

    afterAll(async () => {
        await prisma.$disconnect();
    });

    beforeEach(async () => {
        await prisma.organizationUser.deleteMany({});
        await prisma.organization.deleteMany({});
        await prisma.user.deleteMany({});
    });

    afterEach(async () => {
        await prisma.organizationUser.deleteMany({});
        await prisma.organization.deleteMany({});
        await prisma.user.deleteMany({});
    });

    it('should return organizations for a user with access', async () => {
        const { userId, org1 } = await createUserWithOrganizations();
        const token = generateToken(userId);

        const response = await request(app)
            .get('/api/organizations')
            .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('organizations');
        expect(response.body.organizations).toHaveLength(1);
        expect(response.body.organizations[0].name).toBe(org1.name);
    }, 10000);

    it('should return 404 if user has no organizations', async () => {
        const userId = uuid.v4();
        const token = generateToken(userId);

        const response = await request(app)
            .get('/api/organizations')
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(404);
        expect(response.body).toHaveProperty('message', 'User has no organizations');
    });
});

// describe('Organization Access', () => {
//     it('should restrict access to organizations the user does not belong to', async () => {
//         const userId = uuid.v4();
//         const otherUserId = uuid.v4();

//         const user = await prisma.user.create({
//             data: {
//                 userId,
//                 firstName: 'John',
//                 lastName: 'Doe',
//                 email: 'johndoe-${uuid.v4()}@example.com`',
//                 password: 'password1234',
//                 phone: '1234567890',
//             }
//         });

//         const organization = await prisma.organization.create({
//             data: {
//                 name: 'Test Organization',
//                 description: 'A test organization',
//                 users: {
//                     create: {
//                         userId
//                     }
//                 }
//             }
//         });

//         const response = await request(app)
//             .get(`/organizations/${organization.id}`)
//             .set('Authorization', `Bearer ${generateToken(otherUserId)}`);

//         expect(response.status).toBe(403);
//         expect(response.body).toHaveProperty('message', 'Forbidden');
//     });
// });

// describe('End-to-End Tests for /auth/register', () => {
//     it('should register a new user successfully with default organization', async () => {
//         const response = await request(app)
//             .post('/auth/register')
//             .send({
//                 firstName: 'John',
//                 lastName: 'Doe',
//                 email: `johndoe-${uuid.v4()}@example.com`,
//                 password: 'password123',
//                 phone: '1234567890',
//             });

//         expect(response.status).toBe(201);
//         expect(response.body).toHaveProperty('status', 'success');
//         expect(response.body).toHaveProperty('message', 'User registered successfully');
//         expect(response.body).toHaveProperty('data');
//         expect(response.body.data).toHaveProperty('accessToken');
//         expect(response.body.data).toHaveProperty('user');
//         expect(response.body.data.user).toHaveProperty('userId');
//         expect(response.body.data.user).toHaveProperty('firstName', 'John');
//         // Add more assertions as needed for user details and default organization name
//     });

//     it('should fail if required fields are missing', async () => {
//         const response = await request(app)
//             .post('/auth/register')
//             .send({
//                 firstName: 'John',
//                 lastName: 'Doe',
//                 phone: '1234567890',
//             });

//         expect(response.status).toBe(422);
//         expect(response.body).toHaveProperty('message', 'Validation error');
//         expect(response.body).toHaveProperty('data');
//         expect(response.body.data).toHaveProperty('errors');
//         // Add more specific assertions for missing fields
//     });

//     it('should fail if email already in use', async () => {
//         const email = `johndoe-${uuid.v4()}@example.com`;

//         // Register first user
//         await request(app)
//             .post('/auth/register')
//             .send({
//                 firstName: 'John',
//                 lastName: 'Doe',
//                 email,
//                 password: 'password123',
//                 phone: '1234567890',
//             });

//         // Attempt to register with the same email
//         const response = await request(app)
//             .post('/auth/register')
//             .send({
//                 firstName: 'Jane',
//                 lastName: 'Smith',
//                 email,
//                 password: 'password456',
//                 phone: '9876543210',
//             });

//         expect(response.status).toBe(422);
//         expect(response.body).toHaveProperty('message', 'Validation error');
//         expect(response.body).toHaveProperty('data');
//         expect(response.body.data).toHaveProperty('errors');
//         // Add more specific assertions for duplicate email error
//     });
// });
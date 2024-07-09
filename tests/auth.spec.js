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
    const phone = `123456{Math.floor(Math.random() * 10000)}`;

    await prisma.user.create({
        data: {
            userId,
            firstName: 'John',
            lastName: 'Doe',
            email: `johndoe-${uuid.v4()}@example.com`,
            password: 'password12345',
            phone,
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

const createUserWithoutOrganizations = async () => {
    const userId = uuid.v4();
    const phone = `123759{Math.floor(Math.random() * 10000)}`;

    await prisma.user.create({
        data: {
            userId,
            firstName: 'John',
            lastName: 'Doe',
            email: `johndoe-${uuid.v4()}@example.com`,
            password: 'password12345',
            phone,
        }
    });

    return { userId };
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
            .get('/api/organisations')
            .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('organizations');
        expect(response.body.data.organizations).toHaveLength(2);
        expect(response.body.data.organizations[0].name).toBe(org1.name);
    }, 100000);

    it('should return 404 if user has no organizations', async () => {
        const { userId } = await createUserWithoutOrganizations();
        const token = generateToken(userId);

        const response = await request(app)
            .get('/api/organisations')
            .set('Authorization', `Bearer ${token}`);
        
        expect(response.status).toBe(200);
        expect(response.body.data).toHaveProperty('organizations');
        expect(response.body.data.organizations).toHaveLength(0);
    }, 100000);
});

describe('End-to-End Tests for /auth/register', () => {
    it('should register a new user successfully with default organization', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                email: `johndoe-${uuid.v4()}@example.com`,
                password: 'password12345',
                phone: '1234567890',
            });

        expect(response.status).toBe(201);
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('message', 'Registration successful');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('accessToken');
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data.user).toHaveProperty('userId');
        expect(response.body.data.user).toHaveProperty('firstName', 'John');
    }, 100000);

    it('should fail if required fields are missing', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                phone: '1234567890',
            });
        
        expect(response.status).toBe(422);
        expect(response.body).toEqual({
            errors: [
                { message: 'Invalid email' },
                { message: 'Email is required' },
                { message: 'Password must be at least 5 characters long' },
                { message: 'Password is required' }
            ]
        });
    }, 100000);


    it('should fail if email already in use', async () => {
        const email = `johndoe-${uuid.v4()}@example.com`;

        // Register first user
        await request(app)
            .post('/auth/register')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                email,
                password: 'password12345',
                phone: '1234567890',
            });

        // Attempt to register with the same email
        const response = await request(app)
            .post('/auth/register')
            .send({
                firstName: 'Jane',
                lastName: 'Smith',
                email,
                password: 'password4567',
                phone: '9876543210',
            });

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('message', 'Registration unsuccessful');
        expect(response.body).toHaveProperty('status', 'Bad Request');
        expect(response.body.data).toBeUndefined();
    });
});

describe('End-to-End Tests for /auth/login', () => {
    it('should login a user successfully', async () => {
        const email = `johndoe-${uuid.v4()}@example.com`;

        // Register user
        await request(app)
            .post('/auth/register')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                email,
                password: 'password12345',
                phone: '1234567890',
            });

        // Login user
        const response = await request(app)
            .post('/auth/login')
            .send({
                email,
                password: 'password12345',
            });

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('message', 'Login successful');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('accessToken');
        expect(response.body.data).toHaveProperty('user');
        expect(response.body.data.user).toHaveProperty('userId');
        expect(response.body.data.user).toHaveProperty('firstName', 'John');
    }, 100000);

    it('should fail if email or password is incorrect', async () => {
        const email = `johndoe-${uuid.v4()}@example.com`;

        // Register user
        await request(app)
            .post('/auth/register')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                email,
                password: 'password12345',
                phone: '1234567890',
            });

        // Login user with incorrect password
        let response = await request(app)
            .post('/auth/login')
            .send({
                email,
                password: 'password1234567',
            });

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('status', 'Bad Request');
        expect(response.body).toHaveProperty('message', 'Authentication failed');
        expect(response.body).toHaveProperty('statusCode', 401);
        expect(response.body.data).toBeUndefined();

        // Login user with incorrect email
        response = await request(app)
            .post('/auth/login')
            .send({
                email: 'user@example.com',
                password: 'password12345',
            });
        
        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('status', 'Bad Request');
        expect(response.body).toHaveProperty('message', 'Authentication failed');
        expect(response.body).toHaveProperty('statusCode', 401);
        expect(response.body.data).toBeUndefined();

    }, 100000);
});

describe('User API', () => {
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

    it('should retrieve the logged-in user\'s data', async () => {
        const { userId } = await createUserWithOrganizations();
        const token = generateToken(userId);

        const response = await request(app)
            .get(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('message', 'User retrieved successfully');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('userId', userId);
        expect(response.body.data).toHaveProperty('firstName', 'John');
        expect(response.body.data).toHaveProperty('lastName', 'Doe');
        expect(response.body.data).toHaveProperty('email');
        expect(response.body.data).toHaveProperty('phone');
    }, 100000);

    it('should retrieve data of another user in the same organization', async () => {
        const { userId: userId1, org1 } = await createUserWithOrganizations();
        const { userId: userId2 } = await createUserWithoutOrganizations();

        // Add user2 to org1
        await prisma.organizationUser.create({
            data: {
                orgId: org1.orgId,
                userId: userId2
            }
        });

        const token = generateToken(userId1);

        const response = await request(app)
            .get(`/api/users/${userId2}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(200);
        expect(response.body).toHaveProperty('status', 'success');
        expect(response.body).toHaveProperty('message', 'User retrieved successfully');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('userId', userId2);
        expect(response.body.data).toHaveProperty('firstName', 'John');
        expect(response.body.data).toHaveProperty('lastName', 'Doe');
        expect(response.body.data).toHaveProperty('email');
        expect(response.body.data).toHaveProperty('phone');
    }, 100000);

    it('should return 400 if user is not found', async () => {
        const { userId } = await createUserWithOrganizations();
        const token = generateToken(userId);
        const nonExistentUserId = 'non-existent-user-id';

        const response = await request(app)
            .get(`/api/users/${nonExistentUserId}`)
            .set('Authorization', `Bearer ${token}`);

        expect(response.status).toBe(400);
        expect(response.body).toHaveProperty('status', 'Bad Request');
        expect(response.body).toHaveProperty('message', 'User not found');
    }, 100000);

    it('should return 401 if no token is provided', async () => {
        const { userId } = await createUserWithOrganizations();

        const response = await request(app)
            .get(`/api/users/${userId}`);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Authorization denied');
    }, 100000);

    it('should return 401 if an invalid token is provided', async () => {
        const { userId } = await createUserWithOrganizations();
        const invalidToken = 'invalid-token';

        const response = await request(app)
            .get(`/api/users/${userId}`)
            .set('Authorization', `Bearer ${invalidToken}`);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty('message', 'Invalid token');
    });
});
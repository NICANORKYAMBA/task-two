const request = require('supertest');
const app = require('../src/app');
import * as chai from 'chai';
import chaiHttp from 'chai-http';
const { PrismaClient } = require('@prisma/client');
const uuid = require('uuid');

// Use chaiHttp
chai.use(chaiHttp);
const { expect } = chai;

const prisma = new PrismaClient();

// Helper function to clean the database
const cleanDatabase = async () => {
    await prisma.organizationUser.deleteMany({});
    await prisma.user.deleteMany({});
    await prisma.organization.deleteMany({});
};

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

describe('AuthController', () => {
    it('should register a new user', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                email: `johndoe-${uuid.v4()}@example.com`,
                password: 'password123',
                phone: '1234567890',
            });

        expect(response).to.have.status(201);
        expect(response.body).to.have.property('status', 'success');
        expect(response.body).to.have.property('message', 'User registered successfully');
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('accessToken');
    });
    it('should return a validation error for missing required fields', async () => {
        const response = await request(app)
            .post('/auth/register')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                email: `johndoe-${uuid.v4()}@example.com`,
                phone: '1234567890',
            });

        expect(response.status).toBe(422);
        expect(response.body).toHaveProperty('message', 'Validation error');
        expect(response.body).toHaveProperty('data');
        expect(response.body.data).toHaveProperty('errors');
        // Check if 'password' error exists in the errors array
        const passwordError = response.body.data.errors.find(error => error.message === 'Password is required');
        expect(passwordError).toBeTruthy();
    });


    it('should log the user in successfully', async () => {
        const response = await request(app)
            .post('/auth/login')
            .send({
                email: `johndoe-${uuid.v4()}@example.com`,
                password: 'password123',
            });
        
        expect(response).to.have.status(200);
        expect(response.body).to.have.property('status', 'success');
        expect(response.body).to.have.property('message', 'User logged in successfully');
        expect(response.body).to.have.property('data');
        expect(response.body.data).to.have.property('accessToken');
        expect(response.body.data).to.have.property('userId');
        expect(response.body.data).to.have.property('firstName');
        expect(response.body.data).to.have.property('lastName');
        expect(response.body.data).to.have.property('email');
        expect(response.body.data).to.have.property('phone');
    });

    it('should return bad request if the email already in use', async () => {
        await request(app)
            .post('/auth/register')
            .send({
                firstName: 'John',
                lastName: 'Doe',
                email: 'john@gmail.com',
                password: 'password123',
                phone: '1234567890',
            });
        
        const response = await request(app)
            .post('/auth/register')
            .send({
                firstName: 'Jane',
                lastName: 'Smith',
                email: 'john@gmail.com',
                password: 'password123',
                phone: '9876543210',
            });
        
        expect(response).to.have.status(422);
        // expect(response.body).to.have.property('status', 'Bad Request');
        // expect(response.body).to.have.property('message', 'Registration unsuccessful');
    });
});
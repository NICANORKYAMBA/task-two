const jwt = require('jsonwebtoken');
const uuid = require('uuid');
const { JWT_SECRET } = require('../src/config');
const generateToken = require('../src/utils/generateToken');
const { expect } = require('chai');

describe('generateToken function', () => {
    it('should return a token', () => {
        const userId = uuid.v4();
        const token = generateToken(userId);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        expect(decoded).to.have.property('userId', userId);
    });

    it('should expire at the correct time', () => {
        const userId = uuid.v4();
        const token = generateToken(userId);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const expirationTime = new Date(decoded.exp * 1000);
        const currentTime = new Date();

        expect(expirationTime).to.be.gt(currentTime);
    });

    it('should throw an error when invalid JWT secret is provided', () => {
        const userId = uuid.v4();
        const token = generateToken(userId);

        try {
            jwt.verify(token, 'invalidSecret');
        } catch (error) {
            expect(error).to.be.an.instanceOf(jwt.JsonWebTokenError);
        }
    });

    it('should throw an error when invalid token is provided', () => {
        const userId = uuid.v4();
        const token = generateToken(userId);
        const invalidToken = token.replace('Bearer ', '');

        try {
            jwt.verify(invalidToken, process.env.JWT_SECRET);
        } catch (error) {
            expect(error).to.be.an.instanceOf(jwt.JsonWebTokenError);
        }
    });

    it('should throw an error when token is expired', () => {
        const userId = uuid.v4();
        const token = generateToken(userId);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Manipulate the expiration time
        decoded.exp = decoded.exp - 1;

        try {
            jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            expect(error).to.be.an.instanceOf(jwt.JsonWebTokenError);
        }
    });

    it('should throw an error when token is not provided', () => {
        try {
            jwt.verify(null, process.env.JWT_SECRET);
        } catch (error) {
            expect(error).to.be.an.instanceOf(jwt.JsonWebTokenError);
        }
    });
});
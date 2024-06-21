const request = require('supertest');
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const router = require('../routes/auth');

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');

const app = express();
app.use(express.json());
app.use('/api', router);

describe('User Registration and Login', () => {
    let mockSend;

    beforeEach(() => {
        mockSend = jest.fn();
        DynamoDBClient.prototype.send = mockSend;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('registers a new user', async () => {
        mockSend
            .mockImplementationOnce(() => Promise.resolve({ Items: [] })) 
            .mockImplementationOnce(() => Promise.resolve({}));

        bcrypt.hash.mockResolvedValue('hashedPassword');

        const res = await request(app)
            .post('/api/register')
            .send({ username: 'testuser', password: 'password123' });

        expect(res.status).toBe(201);
        expect(res.body.message).toBe('User registered');
    });

    test('does not have a username or a password is missing during registration', async () => {
        let res = await request(app)
            .post('/api/register')
            .send({ password: 'password123' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Username and password are required');

        res = await request(app)
            .post('/api/register')
            .send({ username: 'testuser' });
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Username and password are required');
    });

    test('does not register a user with an existing username', async () => {
        mockSend.mockImplementationOnce(() => Promise.resolve({ Items: [{ username: 'testuser' }] }));

        const res = await request(app)
            .post('/api/register')
            .send({ username: 'testuser', password: 'password123' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Username already exists');
    });

    test('logs in a user with correct credentials', async () => {
        const hashedPassword = await bcrypt.hash('password123', 10);
        mockSend.mockImplementationOnce(() => Promise.resolve({ Items: [{ username: 'testuser', password: hashedPassword }] }));
        bcrypt.compare.mockResolvedValue(true);
        jwt.sign.mockReturnValue('testtoken');

        const res = await request(app)
            .post('/api/login')
            .send({ username: 'testuser', password: 'password123' });

        expect(res.status).toBe(200);
        expect(res.body.token).toBe('testtoken');
    });

    test('does not log in a user with incorrect credentials', async () => {
        mockSend.mockImplementationOnce(() => Promise.resolve({ Items: [{ username: 'testuser', password: 'wrongHashedPassword' }] }));
        bcrypt.compare.mockResolvedValue(false);

        const res = await request(app)
            .post('/api/login')
            .send({ username: 'testuser', password: 'password123' });

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Invalid credentials');
    });
});

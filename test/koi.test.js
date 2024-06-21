const request = require('supertest');
const express = require('express');
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const { PutCommand, UpdateCommand, DeleteCommand } = require('@aws-sdk/lib-dynamodb');
const { getKOLs, createKOL,updateKOL, deleteKOL } = require('../controllers/kol');
const sanitizeHtml = require('sanitize-html');

// Mock the required modules
jest.mock('uuid', () => ({
    v4: jest.fn()
}));
jest.mock('@aws-sdk/client-dynamodb');
jest.mock('@aws-sdk/lib-dynamodb');
jest.mock('sanitize-html');

const app = express();
app.use(express.json());
app.get('/api/kol', getKOLs);
app.post('/api/kol', createKOL);
app.put('/api/kol/:id', updateKOL);
app.delete('/api/kol/:id', deleteKOL);

describe('getKOLs', () => {
    let mockSend;
    const mockUuid = require('uuid');

    beforeEach(() => {
        mockSend = jest.fn();
        DynamoDBClient.prototype.send = mockSend;
        mockUuid.v4.mockReturnValue('mocked-uuid');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('returns a list of KOLs', async () => {
        const mockData = {
            Items: [
                {
                    ID: '1',
                    Name: 'John Doe',
                    Platform: 'YouTube',
                    Sex: 'Male',
                    Categories: ['Technology'],
                    Tel: '1234567890',
                    Link: 'https://www.youtube.com/johndoe',
                    Followers: '1000',
                    'Photo Cost / Kols': 500,
                    'VDO Cost / Kols': 1000,
                    'ER%': '5.0',
                },
            ],
        };

        mockSend.mockResolvedValue(mockData);

        const res = await request(app).get('/api/kol');

        expect(res.status).toBe(200);
        expect(res.body).toEqual(mockData.Items);
    });

});

describe('createKOL', () => {
    let mockSend;
    const mockUuid = require('uuid');

    beforeEach(() => {
        mockSend = jest.fn();
        DynamoDBClient.prototype.send = mockSend;
        mockUuid.v4.mockReturnValue('mocked-uuid');
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('creates a new KOL', async () => {
        const kol = {
            Name: 'John Doe',
            Platform: 'YouTube',
            Sex: 'Male',
            Categories: ['Technology'],
            Tel: '1234567890',
            Link: 'https://www.youtube.com/johndoe',
            Followers: '1000',
            'Photo Cost / Kols': 500,
            'VDO Cost / Kols': 1000,
            'ER%': '5.0',
        };

        mockSend.mockResolvedValue({});

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(201);
        expect(res.text).toBe('KOL created');
        expect(mockSend).toHaveBeenCalledWith(expect.any(PutCommand));
    });

    test('returns a 400 error if "Name" is missing', async () => {
        const kol = {
            Platform: 'YouTube',
            Sex: 'Male',
            Categories: ['Technology'],
            Tel: '1234567890',
            Link: 'https://www.youtube.com/johndoe',
            Followers: '1000',
            'Photo Cost / Kols': 500,
            'VDO Cost / Kols': 1000,
            'ER%': '5.0',
        };

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('"Name" is required');
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns a 400 error if "Name" is not a string', async () => {
        const kol = {
            Name: 123,
            Platform: 'YouTube',
            Sex: 'Male',
            Categories: ['Technology'],
            Tel: '1234567890',
            Link: 'https://www.youtube.com/johndoe',
            Followers: '1000',
            'Photo Cost / Kols': 500,
            'VDO Cost / Kols': 1000,
            'ER%': '5.0',
        };

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('"Name" must be a string');
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns a 400 error if "Platform" is missing', async () => {
        const kol = {
            Name: 'John Doe',
            Sex: 'Male',
            Categories: ['Technology'],
            Tel: '1234567890',
            Link: 'https://www.youtube.com/johndoe',
            Followers: '1000',
            'Photo Cost / Kols': 500,
            'VDO Cost / Kols': 1000,
            'ER%': '5.0',
        };

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('"Platform" is required');
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns a 400 error if "Sex" is missing', async () => {
        const kol = {
            Name: 'John Doe',
            Platform: 'YouTube',
            Categories: ['Technology'],
            Tel: '1234567890',
            Link: 'https://www.youtube.com/johndoe',
            Followers: '1000',
            'Photo Cost / Kols': 500,
            'VDO Cost / Kols': 1000,
            'ER%': '5.0',
        };

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('"Sex" is required');
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns a 400 error if "Categories" is missing', async () => {
        const kol = {
            Name: 'John Doe',
            Platform: 'YouTube',
            Sex: 'Male',
            Tel: '1234567890',
            Link: 'https://www.youtube.com/johndoe',
            Followers: '1000',
            'Photo Cost / Kols': 500,
            'VDO Cost / Kols': 1000,
            'ER%': '5.0',
        };

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('"Categories" is required');
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns a 400 error if "Categories" is not an array', async () => {
        const kol = {
            Name: 'John Doe',
            Platform: 'YouTube',
            Sex: 'Male',
            Categories: 'Technology',
            Tel: '1234567890',
            Link: 'https://www.youtube.com/johndoe',
            Followers: '1000',
            'Photo Cost / Kols': 500,
            'VDO Cost / Kols': 1000,
            'ER%': '5.0',
        };

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('"Categories" must be an array');
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns a 400 error if "Tel" is missing', async () => {
        const kol = {
            Name: 'John Doe',
            Platform: 'YouTube',
            Sex: 'Male',
            Categories: ['Technology'],
            Link: 'https://www.youtube.com/johndoe',
            Followers: '1000',
            'Photo Cost / Kols': 500,
            'VDO Cost / Kols': 1000,
            'ER%': '5.0',
        };

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('"Tel" is required');
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns a 400 error if "Tel" is not a number', async () => {
        const kol = {
            Name: 'John Doe',
            Platform: 'YouTube',
            Sex: 'Male',
            Categories: ['Technology'],
            Tel: 'abcd1234',
            Link: 'https://www.youtube.com/johndoe',
            Followers: '1000',
            'Photo Cost / Kols': 500,
            'VDO Cost / Kols': 1000,
            'ER%': '5.0',
        };

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('"Tel" with value "abcd1234" fails to match the required pattern: /^[0-9]+$/');
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns a 400 error if "Link" is missing', async () => {
        const kol = {
            Name: 'John Doe',
            Platform: 'YouTube',
            Sex: 'Male',
            Categories: ['Technology'],
            Tel: '1234567890',
            Followers: '1000',
            'Photo Cost / Kols': 500,
            'VDO Cost / Kols': 1000,
            'ER%': '5.0',
        };

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('"Link" is required');
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns a 400 error if "Link" is not a valid URL', async () => {
        const kol = {
            Name: 'John Doe',
            Platform: 'YouTube',
            Sex: 'Male',
            Categories: ['Technology'],
            Tel: '1234567890',
            Link: 'invalid-url',
            Followers: '1000',
            'Photo Cost / Kols': 500,
            'VDO Cost / Kols': 1000,
            'ER%': '5.0',
        };

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('"Link" must be a valid uri');
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns a 400 error if "Followers" is missing', async () => {
        const kol = {
            Name: 'John Doe',
            Platform: 'YouTube',
            Sex: 'Male',
            Categories: ['Technology'],
            Tel: '1234567890',
            Link: 'https://www.youtube.com/johndoe',
            'Photo Cost / Kols': 500,
            'VDO Cost / Kols': 1000,
            'ER%': '5.0',
        };

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('"Followers" is required');
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns a 400 error if "Followers" is not a number', async () => {
        const kol = {
            Name: 'John Doe',
            Platform: 'YouTube',
            Sex: 'Male',
            Categories: ['Technology'],
            Tel: '1234567890',
            Link: 'https://www.youtube.com/johndoe',
            Followers: 'abcd',
            'Photo Cost / Kols': 500,
            'VDO Cost / Kols': 1000,
            'ER%': '5.0',
        };

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('"Followers" with value "abcd" fails to match the required pattern: /^[0-9]+$/');
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns a 400 error if "Photo Cost / Kols" is missing', async () => {
        const kol = {
            Name: 'John Doe',
            Platform: 'YouTube',
            Sex: 'Male',
            Categories: ['Technology'],
            Tel: '1234567890',
            Link: 'https://www.youtube.com/johndoe',
            Followers: '1000',
            'VDO Cost / Kols': 1000,
            'ER%': '5.0',
        };

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('"Photo Cost / Kols" is required');
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns a 400 error if "Photo Cost / Kols" is not a number', async () => {
        const kol = {
            Name: 'John Doe',
            Platform: 'YouTube',
            Sex: 'Male',
            Categories: ['Technology'],
            Tel: '1234567890',
            Link: 'https://www.youtube.com/johndoe',
            Followers: '1000',
            'Photo Cost / Kols': 'abc',
            'VDO Cost / Kols': 1000,
            'ER%': '5.0',
        };

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('"Photo Cost / Kols" must be a number');
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns a 400 error if "VDO Cost / Kols" is missing', async () => {
        const kol = {
            Name: 'John Doe',
            Platform: 'YouTube',
            Sex: 'Male',
            Categories: ['Technology'],
            Tel: '1234567890',
            Link: 'https://www.youtube.com/johndoe',
            Followers: '1000',
            'Photo Cost / Kols': 500,
            'ER%': '5.0',
        };

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('"VDO Cost / Kols" is required');
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns a 400 error if "VDO Cost / Kols" is not a number', async () => {
        const kol = {
            Name: 'John Doe',
            Platform: 'YouTube',
            Sex: 'Male',
            Categories: ['Technology'],
            Tel: '1234567890',
            Link: 'https://www.youtube.com/johndoe',
            Followers: '1000',
            'Photo Cost / Kols': 500,
            'VDO Cost / Kols': 'abc',
            'ER%': '5.0',
        };

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('"VDO Cost / Kols" must be a number');
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns a 400 error if "ER%" is missing', async () => {
        const kol = {
            Name: 'John Doe',
            Platform: 'YouTube',
            Sex: 'Male',
            Categories: ['Technology'],
            Tel: '1234567890',
            Link: 'https://www.youtube.com/johndoe',
            Followers: '1000',
            'Photo Cost / Kols': 500,
            'VDO Cost / Kols': 1000,
        };

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('"ER%" is required');
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns a 400 error if "ER%" is not a valid pattern', async () => {
        const kol = {
            Name: 'John Doe',
            Platform: 'YouTube',
            Sex: 'Male',
            Categories: ['Technology'],
            Tel: '1234567890',
            Link: 'https://www.youtube.com/johndoe',
            Followers: '1000',
            'Photo Cost / Kols': 500,
            'VDO Cost / Kols': 1000,
            'ER%': 'abc',
        };

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(400);
        expect(res.body.error).toBe('"ER%" with value "abc" fails to match the required pattern: /^[0-9.]+$/');
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns a 500 error if DynamoDB fails', async () => {
        const kol = {
            Name: 'John Doe',
            Platform: 'YouTube',
            Sex: 'Male',
            Categories: ['Technology'],
            Tel: '1234567890',
            Link: 'https://www.youtube.com/johndoe',
            Followers: '1000',
            'Photo Cost / Kols': 500,
            'VDO Cost / Kols': 1000,
            'ER%': '5.0',
        };

        mockSend.mockRejectedValue(new Error('DynamoDB error'));

        const res = await request(app)
            .post('/api/kol')
            .send(kol);

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Error creating KOL');
    });
});

describe('updateKOL', () => {
    let mockSend;
    const mockUuid = require('uuid');

    beforeEach(() => {
        mockSend = jest.fn();
        DynamoDBClient.prototype.send = mockSend;
        mockUuid.v4.mockReturnValue('mocked-uuid');
        sanitizeHtml.mockImplementation((str) => str);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('updates a KOL successfully', async () => {
        const kolData = {
            Name: 'Jane Doe',
            Platform: 'Instagram',
            Sex: 'Female',
            Categories: ['Lifestyle', 'Fashion'],
            Tel: '0987654321',
            Link: 'https://www.instagram.com/janedoe',
            Followers: "1500",
            'Photo Cost / Kols': 600,
            'VDO Cost / Kols': 1200,
            'ER%': '4.5'
        };

        mockSend.mockResolvedValue({ Attributes: kolData });

        const res = await request(app)
            .put('/api/kol/123e4567-e89b-12d3-a456-426614174000')
            .send(kolData);

        expect(res.status).toBe(200);
        expect(res.body).toEqual(kolData);
        expect(mockSend).toHaveBeenCalledWith(expect.any(UpdateCommand));
    });

    test('returns 400 if no data provided', async () => {
        const res = await request(app)
            .put('/api/kol/123e4567-e89b-12d3-a456-426614174000')
            .send({});

        expect(res.status).toBe(400);
        expect(res.body).toEqual({ error: 'No data provided for update' });
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns 500 if validation fails', async () => {
        const kolData = {
            Name: 'Jane Doe',
            Platform: 'Instagram',
            Sex: 'Female',
            Categories: ['Lifestyle', 'Fashion'],
            Tel: '0987654321',
            Link: 'https://www.instagram.com/janedoe',
            Followers: 'invalid number',
            'Photo Cost / Kols': 600,
            'VDO Cost / Kols': 1200,
            'ER%': '4.5%'
        };

        const res = await request(app)
            .put('/api/kol/123e4567-e89b-12d3-a456-426614174000')
            .send(kolData);

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: expect.stringContaining('Invalid data for Followers') });
        expect(mockSend).not.toHaveBeenCalled();
    });

    test('returns 500 if an error occurs during update', async () => {
        const kolData = {
            Name: 'Jane Doe',
            Platform: 'Instagram',
            Sex: 'Female',
            Categories: ['Lifestyle', 'Fashion'],
            Tel: '0987654321',
            Link: 'https://www.instagram.com/janedoe',
            Followers: 1500,
            'Photo Cost / Kols': 600,
            'VDO Cost / Kols': 1200,
            'ER%': '4.5%'
        };

        mockSend.mockRejectedValue(new Error('Mocked error'));

        const res = await request(app)
            .put('/api/kol/123e4567-e89b-12d3-a456-426614174000')
            .send(kolData);

        expect(res.status).toBe(500);
        expect(res.body).toEqual({ error: "Invalid data for Followers: \"value\" must be a string" });
    });
});

describe('deleteKOL', () => {
    let mockSend;

    beforeEach(() => {
        mockSend = jest.fn();
        DynamoDBClient.prototype.send = mockSend;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('deletes a KOL by ID', async () => {
        mockSend.mockResolvedValue({});

        const res = await request(app)
            .delete('/api/kol/123e4567-e89b-12d3-a456-426614174000');

        expect(res.status).toBe(200);
        expect(res.text).toBe('KOL deleted');
        expect(mockSend).toHaveBeenCalledWith(expect.any(DeleteCommand));
    });

    test('returns a 500 error if DynamoDB fails', async () => {
        mockSend.mockRejectedValue(new Error('DynamoDB error'));

        const res = await request(app)
            .delete('/api/kol/123e4567-e89b-12d3-a456-426614174000');

        expect(res.status).toBe(500);
        expect(res.body.error).toBe('Error deleting KOL');
    });
});

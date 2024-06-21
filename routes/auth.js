const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { ScanCommand, PutCommand  } = require("@aws-sdk/lib-dynamodb");

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

const client = new DynamoDBClient({
    region: process.env.AWS_REGION || 'ap-southeast-1',
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// User registration endpoint
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
          return res
            .status(400)
            .json({ error: "Username and password are required" });
        }

        // User registration endpoint
        const scanParams = {
            TableName: 'Users',
            FilterExpression: 'username = :username',
            ExpressionAttributeValues: { ':username': username }
        };
        const existingUser = await client.send(new ScanCommand(scanParams));
        if (existingUser.Items && existingUser.Items.length > 0) {
            return res.status(400).json({ error: 'Username already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const params = {
            TableName: 'Users',
            Item: { username, password: hashedPassword }
        };

        await client.send(new PutCommand(params));
        res.status(201).json({ message: 'User registered' });
    } catch (err) {
        console.error('Error in registration process:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});


// User login endpoint
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Username and password are required' });
        }

        // Retrieve user by username
        const scanParams = {
            TableName: 'Users',
            FilterExpression: 'username = :username',
            ExpressionAttributeValues: { ':username': username }
        };

        const data = await client.send(new ScanCommand(scanParams));

        if (!data.Items || data.Items.length === 0) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const user = data.Items[0];
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(400).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '1h' });
        res.status(200).json({ token });
    } catch (err) {
        console.error('Error in login process:', err.message);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports = router;

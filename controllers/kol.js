const { DynamoDBClient } = require("@aws-sdk/client-dynamodb");
const { ScanCommand, PutCommand, UpdateCommand, DeleteCommand } = require("@aws-sdk/lib-dynamodb");
const Joi = require('joi');
const sanitizeHtml = require('sanitize-html');
const { v4: uuidv4 } = require('uuid');

const client = new DynamoDBClient({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// Schema for input validation
const kolSchema = Joi.object({
    Name: Joi.string().trim().required(),
    Platform: Joi.string().trim().required(),
    Sex: Joi.string().trim().required(),
    Categories: Joi.array().items(Joi.string().trim()).required(),
    Tel: Joi.string().trim().pattern(/^[0-9]+$/).required(),
    Link: Joi.string().trim().uri().required(),
    Followers: Joi.string().trim().pattern(/^[0-9]+$/).required(),
    'Photo Cost / Kols': Joi.number().required(),
    'VDO Cost / Kols': Joi.number().required(),
    'ER%': Joi.string().trim().pattern(/^[0-9.]+$/).required()
});

exports.getKOLs = async (req, res) => {
    try {
        const params = { TableName: 'KOLs' };
        const data = await client.send(new ScanCommand(params));
        res.status(200).json(data.Items);
    } catch (err) {
        console.error('Error fetching data:', err); 
        res.status(500).json({ error: 'Error fetching data' });
    }
};

exports.createKOL = async (req, res) => {
    try {
        const kol = req.body;
        
        const { error } = kolSchema.validate(kol);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }
        
        // Sanitizing inputs to prevent injection attacks
        Object.keys(kol).forEach(key => {
            if (typeof kol[key] === 'string') {
                kol[key] = sanitizeHtml(kol[key]);
            }
        });

        kol.ID = uuidv4();

        const params = {
            TableName: 'KOLs',
            Item: kol
        };
        await client.send(new PutCommand(params));
        res.status(201).send('KOL created');
    } catch (err) {
        console.error('Error creating KOL:', err);
        res.status(500).json({ error: 'Error creating KOL' });
    }
};

exports.updateKOL = async (req, res) => {
    try {
        const { id } = req.params;
        const kolData = req.body;

        if (Object.keys(kolData).length === 0) {
            return res.status(400).json({ error: 'No data provided for update' });
        }

        const updateExpression = [];
        const expressionAttributeNames = {};
        const expressionAttributeValues = {};

        Object.keys(kolData).forEach((key) => {
            const value = kolData[key];

            const { error } = kolSchema.extract(key).validate(value);
            if (error) {
                throw new Error(`Invalid data for ${key}: ${error.details[0].message}`);
            }

            // Sanitize the input if it's a string
            const sanitizedValue = typeof value === 'string' ? sanitizeHtml(value) : value;

            const sanitizedKey = key.replace(/ /g, '').replace(/\//g, '').replace(/%/g, '');
            updateExpression.push(`#${sanitizedKey} = :${sanitizedKey}`);
            expressionAttributeNames[`#${sanitizedKey}`] = key;
            expressionAttributeValues[`:${sanitizedKey}`] = sanitizedValue;
        });

        const updateParams = {
            TableName: 'KOLs',
            Key: { ID: id },
            UpdateExpression: `set ${updateExpression.join(', ')}`,
            ExpressionAttributeNames: expressionAttributeNames,
            ExpressionAttributeValues: expressionAttributeValues,
            ReturnValues: 'UPDATED_NEW'
        };

        const data = await client.send(new UpdateCommand(updateParams));
        res.status(200).json(data.Attributes);
    } catch (err) {
        console.error('Error updating KOL:', err.message);
        res.status(500).json({ error: err.message || 'Error updating KOL' });
    }
};


exports.deleteKOL = async (req, res) => {
    try {
        const { id } = req.params;
        
        const { error } = Joi.string().trim().required().validate(id);
        if (error) {
            return res.status(400).json({ error: error.details[0].message });
        }

        const params = {
            TableName: 'KOLs',
            Key: { ID: id }
        };
        await client.send(new DeleteCommand(params));
        res.status(200).send('KOL deleted');
    } catch (err) {
        console.error('Error deleting KOL:', err); 
        res.status(500).json({ error: 'Error deleting KOL' });
    }
};

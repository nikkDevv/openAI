require('dotenv').config();
const OpenAI = require('openai');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000; // You can choose any port

const openai = new OpenAI({ apiKey: process.env.API_KEY });
let conversationHistory = [];

// Function to interact with OpenAI
async function askGPT(question) {
    try {
        conversationHistory.push({ "role": "user", "content": question });

        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4-1106-preview", 
            messages: conversationHistory
        });

        const aiResponse = chatCompletion.choices[0].message.content;
        conversationHistory.push({ "role": "system", "content": aiResponse });

        return aiResponse;
    } catch (error) {
        console.error('Error in askGPT:', error);
        return null;
    }
}

// Express server setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public')); // Serve static files from 'public' folder

// Endpoint to handle chat requests
app.post('/ask', async (req, res) => {
    try {
        const userQuestion = req.body.question;
        const aiResponse = await askGPT(userQuestion);
        res.json({ answer: aiResponse });
    } catch (error) {
        console.error('Error in /ask endpoint:', error);
        res.status(500).send('Error processing your request');
    }
});

// Endpoint to reset conversation
app.post('/reset', (req, res) => {
    conversationHistory = [];
    res.send('Conversation reset');
});

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

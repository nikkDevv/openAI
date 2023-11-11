require('dotenv').config();
const OpenAI = require('openai');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = 3000;

const openai = new OpenAI({
  apiKey: process.env.API_KEY
});

const assistantId = 'asst_pqAvzW9n3XHlsLEl9dkxrzfV';
let conversationHistory = [];

async function askGPT(question) {
    try {
        conversationHistory.push({"role": "user", "content": question});
        // Retrieve the Assistant
        const myAssistant = await openai.beta.assistants.retrieve(assistantId);
        console.log(myAssistant); // For debugging

        // Create a new thread for each conversation
        const threadResponse = await openai.beta.threads.create();

        // Add a message to the thread with the user's question
        await openai.beta.threads.messages.create(threadResponse.id ,{
            role: "user",
            content: question
        });

        // Run the assistant to get a response
        const run = await openai.beta.threads.runs.create(
            threadResponse.id,
            { assistant_id:  assistantId }
          );
        
        let runStatus = await openai.beta.threads.runs.retrieve(
            threadResponse.id,
            run.id
          );

        // Polling for run completion
        while (runStatus.status !== 'completed') {
            await new Promise(resolve => setTimeout(resolve, 1000)); // Wait for 1 second
            runStatus = await openai.beta.threads.runs.retrieve(threadResponse.id, run.id);
        }

        // Retrieve the messages after the assistant run is complete
        const messagesResponse = await openai.beta.threads.messages.list(threadResponse.id);
        
        const aiMessages = messagesResponse.data.filter(msg => msg.role === 'assistant');

        // Assuming the last message is the assistant's response
        return aiMessages[aiMessages.length - 1].content[0].text.value;
    } catch (error) {
        console.error('Error in askGPT:', error.response ? error.response.data : error);
        return 'An error occurred while processing your request.'; // Placeholder response
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

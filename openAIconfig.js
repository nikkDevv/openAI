require('dotenv').config();
const OpenAI = require('openai');
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const session = require('express-session');
const app = express();
const port = 3000;

const openai = new OpenAI({
  apiKey: process.env.API_KEY
});

const assistantId = 'asst_pqAvzW9n3XHlsLEl9dkxrzfV';

// In-memory session store
app.use(session({
  secret: 'secret-key',
  resave: false,
  saveUninitialized: true
}));

async function askGPT(session, question) {
    try {
        if (!session.conversationHistory) {
            session.conversationHistory = [];
            session.currentThreadId = null;
        }

        session.conversationHistory.push({"role": "user", "content": question});

        if (!session.currentThreadId) {
            const thread = await openai.beta.threads.create();
            session.currentThreadId = thread.id;
        }

        await openai.beta.threads.messages.create(session.currentThreadId, {
            role: "user",
            content: question
        });

        const run = await openai.beta.threads.runs.create(
            session.currentThreadId,
            { assistant_id:  assistantId }
        );

        let runStatus = await openai.beta.threads.runs.retrieve(
            session.currentThreadId,
            run.id
        );

        let funcName = null;

        while (runStatus.status !== 'completed') {
            if (runStatus.status === 'requires_action') {
                console.log("Requires Action");
                const requiredActions = runStatus.required_action.submit_tool_outputs.tool_calls;
                console.log(requiredActions);
                // Handle the required actions
                let toolsOutput = [];
                for (const action of requiredActions) {
                    funcName = action.function.name;
                        if (funcName === "startTolstoyWidget") {
                            const output = "say that the widget is opened";
                            toolsOutput.push({
                                tool_call_id: action.id,
                                output: output
                            });
                        } else if (funcName === "openTolstoy"){
                            const output = "this will open the tolstoy app";
                            toolsOutput.push({
                                tool_call_id: action.id,
                                output: output
                            });
                        }
                         else {
                            console.log("Unknown function");
                        }
                    }
                await openai.beta.threads.runs.submitToolOutputs(session.currentThreadId, run.id, {tool_outputs: toolsOutput});
            }

            await new Promise(resolve => setTimeout(resolve, 1000));
            runStatus = await openai.beta.threads.runs.retrieve(session.currentThreadId, run.id);
        }

        const messagesResponse = await openai.beta.threads.messages.list(session.currentThreadId);
        const aiMessages = messagesResponse.data.filter((msg) => msg.run_id === run.id && msg.role === "assistant");
        return {
            aiResponse: aiMessages[aiMessages.length - 1].content[0].text.value,
            funcName: funcName
        }
    } catch (error) {
        console.error('Error in askGPT:', error.response ? error.response.data : error);
        return 'An error occurred while processing your request.';
    }
}

// Express server setup
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('public'));


app.post('/ask', async (req, res) => {
    try {
        const userQuestion = req.body.question;
        const result = await askGPT(req.session, userQuestion);
        res.json({ answer: result.aiResponse, functionName: result.funcName });
    } catch (error) {
        console.error('Error in /ask endpoint:', error);
        res.status(500).send('Error processing your request');
    }
});

app.post('/reset', (req, res) => {
    req.session.conversationHistory = [];
    req.session.currentThreadId = null;
    res.send('Conversation reset');
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});

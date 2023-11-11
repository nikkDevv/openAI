require('dotenv').config();
const OpenAI = require('openai');

const openai = new OpenAI({ apiKey: process.env.API_KEY });

async function askGPT(question) {
    try {
        const chatCompletion = await openai.chat.completions.create({
            model: "gpt-4-1106-preview",
            messages: [{ "role": "user", "content": question }]
        });

        return chatCompletion.choices[0].message.content;
    } catch (error) {
        console.error('Error in askGPT:', error);
        return null;
    }
}

const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout
});

async function runExample() {
    readline.question('Ask a question: ', async (userQuestion) => {
        const aiResponse = await askGPT(userQuestion);
        console.log("AI Response:", aiResponse);
        readline.close();
    });
}

runExample();
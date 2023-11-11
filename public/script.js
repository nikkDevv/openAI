document.getElementById('send-button').addEventListener('click', sendQuestion);
document.getElementById('new-thread-button').addEventListener('click', newThread);

function sendQuestion() {
    const userInput = document.getElementById('user-input').value;
    const chatOutput = document.getElementById('chat-output');

    // Add user input to chat
    if (userInput.trim() !== '') {
        chatOutput.innerHTML += `<div>User: ${userInput}</div>`;

        // Send data to Node.js server
        fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: userInput }),
        })
        .then(response => response.json())
        .then(data => {
            // Display AI response
            chatOutput.innerHTML += `<div>AI: ${data.answer}</div>`;
            // Scroll to the bottom of the chat
            chatOutput.scrollTop = chatOutput.scrollHeight;
        })
        .catch((error) => {
            console.error('Error:', error);
        });

        // Clear input field
        document.getElementById('user-input').value = '';
    }
}

function newThread() {
    // Clear chat history in the UI
    document.getElementById('chat-output').innerHTML = '';

    // Send a request to the server to reset the conversation history
    fetch('/reset', { method: 'POST' })
    .catch((error) => {
        console.error('Error resetting conversation:', error);
    });
}

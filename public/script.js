document.getElementById('open-modal').addEventListener('click', function() {
    document.getElementById('chat-modal').style.display = 'flex';
});

document.getElementById('close-modal').addEventListener('click', function() {
    document.getElementById('chat-modal').style.display = 'none';
});

document.getElementById('send-button').addEventListener('click', sendQuestion);
document.getElementById('new-thread-button').addEventListener('click', newThread);

function sendQuestion() {
    const userInput = document.getElementById('user-input').value;
    const chatOutput = document.getElementById('chat-output');
    const loadingMessage = document.getElementById('loading-message');

    if (userInput.trim() !== '') {
        chatOutput.innerHTML += `<div class="user">${userInput}</div>`;
        loadingMessage.style.display = 'block';

        fetch('/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ question: userInput }),
        })
        .then(response => response.json())
        .then(data => {
            loadingMessage.style.display = 'none';
            chatOutput.innerHTML += `<div class="ai">${data.answer}</div>`;
            chatOutput.scrollTop = chatOutput.scrollHeight;
        })
        .catch((error) => {
            console.error('Error:', error);
            loadingMessage.style.display = 'none';
        });

        document.getElementById('user-input').value = '';
    }
}

function newThread() {
    document.getElementById('chat-output').innerHTML = '';
    fetch('/reset', { method: 'POST' })
    .catch((error) => {
        console.error('Error resetting conversation:', error);
    });
}

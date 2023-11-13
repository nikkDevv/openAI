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
            const formattedResponse = formatResponse(data.answer);
            chatOutput.innerHTML += `<div class="ai">${formattedResponse}</div>`;
            chatOutput.scrollTop = chatOutput.scrollHeight;
        })
        .catch((error) => {
            console.error('Error:', error);
            loadingMessage.style.display = 'none';
        });

        document.getElementById('user-input').value = '';
    }
}

function formatResponse(response) {
    // Check for numbered lists
    if (/^\d+\./m.test(response)) {
        // Split by lines and filter out empty lines
        const lines = response.split('\n').filter(line => line.trim() !== '');
        // Convert lines into list items, checking for numbered list format
        const listItems = lines.map((line) => {
            if (/^\d+\./.test(line.trim())) {
                return `<li>${line.trim().substring(line.indexOf(' ') + 1)}</li>`;
            } else {
                return line; // Return line as-is if it doesn't match the list format
            }
        }).join('');
        // Wrap in <ol> tag if any list item is detected
        if (listItems.includes('<li>')) {
            return `<ol>${listItems}</ol>`;
        }
    }

    // Check for bullet points
    if (response.includes('\n- ')) {
        const items = response.split('\n- ').slice(1); // Split and remove the first empty element
        const listItems = items.map(item => `<li>${item.trim()}</li>`).join('');
        return `<ul>${listItems}</ul>`;
    }
    
    // Return the response as-is if no list patterns are detected
    return response;
}

function newThread() {
    document.getElementById('chat-output').innerHTML = '';
    fetch('/reset', { method: 'POST' })
    .catch((error) => {
        console.error('Error resetting conversation:', error);
    });
}

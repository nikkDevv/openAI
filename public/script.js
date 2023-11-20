window.tolstoyWidgetId='917283t9u2fqa'; var s =
  document.createElement('script'); s.type = 'text/javascript'; s.async = true;
  s.src = 'https://widget.gotolstoy.com/widget/widget.js';
  document.head.appendChild(s);


// EVENT LISTENERS
document.getElementById('open-modal').addEventListener('click', function() {
    document.getElementById('chat-modal').style.display = 'flex';
});

document.getElementById('close-modal').addEventListener('click', function() {
    document.getElementById('chat-modal').style.display = 'none';
});

document.getElementById('send-button').addEventListener('click', sendQuestion);
document.getElementById('new-thread-button').addEventListener('click', newThread);

document.querySelectorAll('.chat-prompt').forEach(item => {
    item.addEventListener('click', event => {
        sendPresetQuestion(event.target.dataset.message);
        document.querySelector('.chat-prompts').classList.add('hidden'); // Hide prompts after click
    });
});


// GLOBAL FUNCTIONS
function startTolstoyWidget() {
    window.tolstoyWidget.start();
    console.log('Widget opened');
}

function closeChatModal() {
    var modal = document.getElementById('chat-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function tolstoyLink() {
    const url = "https://app.gotolstoy.com/onsite/all";
    window.open(url, '_blank');
}


function sendPresetQuestion(message) {
    document.getElementById('user-input').value = message; 
    sendQuestion();
}

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
            if (data.functionName === "startTolstoyWidget")
            {
                startTolstoyWidget();
            } else if (data.functionName === "openTolstoy"){
                tolstoyLink();
            }
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
        document.querySelector('.chat-prompts').classList.add('hidden'); // Hide prompts after click
    }
}

function formatResponse(response) {
    // First, format the lists
    // Check for numbered lists
    if (/^\d+\./m.test(response)) {
        const lines = response.split('\n').filter(line => line.trim() !== '');
        const listItems = lines.map(line => {
            return /^\d+\./.test(line.trim()) ?
                `<li>${line.trim().substring(line.indexOf(' ') + 1)}</li>` :
                line;
        }).join('');
        if (listItems.includes('<li>')) {
            response = `<ol>${listItems}</ol>`;
        }
    }

    // Check for bullet points
    if (response.includes('\n- ')) {
        const items = response.split('\n- ').slice(1);
        const listItems = items.map(item => `<li>${item.trim()}</li>`).join('');
        response = `<ul>${listItems}</ul>`;
    }

    // Then, hyperlink and shorten URLs
    // Regular expression to identify URLs
    const urlRegex = /(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;

    // Replace URLs with anchor tags and shortened text
    return response.replace(urlRegex, function(url) {
        const urlText = extractMainPartOfUrl(url);
        return `<a href="${url}" target="_blank">${urlText}</a>`;
    });
}

function extractMainPartOfUrl(url) {
    try {
        const urlObj = new URL(url);
        return urlObj.hostname;
    } catch (e) {
        return url;
    }
}

function newThread() {
    document.getElementById('chat-output').innerHTML = '';
    document.querySelector('.chat-prompts').classList.remove('hidden');
    fetch('/reset', { method: 'POST' })
    .catch((error) => {
        console.error('Error resetting conversation:', error);
    });
}

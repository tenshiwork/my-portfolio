// Chat functionality
const chatContainer = document.getElementById('chatContainer');
const chatInput = document.getElementById('chatInput');
const chatSendBtn = document.getElementById('chatSendBtn');

let isProcessing = false;

function addMessage(text, isUser = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${isUser ? 'user' : 'llm'}`;
    messageDiv.textContent = text;
    chatContainer.appendChild(messageDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function sendMessage(message) {
    if (isProcessing || !message.trim()) return;
    isProcessing = true;

    // Add user message
    addMessage(message, true);
    chatInput.value = '';

    try {
        // Simulate LLM response (replace with actual API call)
        await new Promise(resolve => setTimeout(resolve, 1000));
        const response = "Je suis désolé, je suis temporairement hors service. Veuillez réessayer plus tard.";
        addMessage(response, false);
    } catch (error) {
        console.error('Chat error:', error);
        addMessage("Désolé, une erreur s'est produite.", false);
    } finally {
        isProcessing = false;
    }
}

// Event listeners
chatSendBtn.addEventListener('click', () => {
    sendMessage(chatInput.value);
});

chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage(chatInput.value);
    }
});

// Add welcome message
addMessage("Bonjour! Comment puis-je vous aider aujourd'hui?", false);

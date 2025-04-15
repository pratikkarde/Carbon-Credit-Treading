document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const chatbotToggle = document.getElementById('chatbot-toggle');
    const chatbotWindow = document.getElementById('chatbot-window');
    const chatbotClose = document.getElementById('chatbot-close');
    const chatbotInput = document.getElementById('chatbot-input');
    const chatbotSend = document.getElementById('chatbot-send');
    const chatbotMessages = document.getElementById('chatbot-messages');

    // Toggle chatbot window
    chatbotToggle.addEventListener('click', () => {
        chatbotWindow.classList.add('active');
    });

    chatbotClose.addEventListener('click', () => {
        chatbotWindow.classList.remove('active');
    });

    // Send message on button click or Enter key
    chatbotSend.addEventListener('click', sendMessage);
    chatbotInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });

    // Function to send a message
    function sendMessage() {
        const message = chatbotInput.value.trim();
        if (message) {
            // Add user message to chat
            addMessage(message, 'user');
            
            // Clear input
            chatbotInput.value = '';
            
            // Process the message and get response
            const response = processMessage(message);
            
            // Add bot response to chat with a slight delay for natural feel
            setTimeout(() => {
                addMessage(response, 'bot');
            }, 500);
        }
    }

    // Function to add a message to the chat
    function addMessage(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chatbot-message', sender);
        
        const messageContent = document.createElement('div');
        messageContent.classList.add('message-content');
        messageContent.textContent = text;
        
        messageDiv.appendChild(messageContent);
        chatbotMessages.appendChild(messageDiv);
        
        // Scroll to bottom
        chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
    }

    // Function to process user message and generate response
    function processMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        // Price related queries
        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('worth')) {
            return getPriceResponse();
        }
        
        // Trading time related queries
        if (lowerMessage.includes('when') && (lowerMessage.includes('sell') || lowerMessage.includes('trade'))) {
            return getTradingTimeResponse();
        }
        
        // Project related queries
        if (lowerMessage.includes('project') || lowerMessage.includes('type')) {
            return getProjectResponse();
        }
        
        // Carbon credit related queries
        if (lowerMessage.includes('carbon credit') || lowerMessage.includes('what is')) {
            return getCarbonCreditInfo();
        }
        
        // Default response
        return "I'm not sure I understand. You can ask me about carbon credit prices, trading times, project types, or general information about carbon credits.";
    }

    // Response functions
    function getPriceResponse() {
        const currentPrice = (Math.random() * 10 + 20).toFixed(2); // Random price between $20-$30
        return `The current average price of carbon credits is $${currentPrice} per credit. Prices can vary based on project type, location, and certification standards. You can view real-time prices on our trading dashboard.`;
    }

    function getTradingTimeResponse() {
        return "You can trade carbon credits 24/7 on our platform. The market is most active during business hours (9 AM - 5 PM EST). For the best prices, consider trading during these peak hours. You can also set limit orders to execute trades at your preferred price.";
    }

    function getProjectResponse() {
        return "We offer various types of carbon credit projects including:\n\n" +
               "• Forest Conservation\n" +
               "• Renewable Energy\n" +
               "• Industrial Efficiency\n" +
               "• Agricultural Practices\n\n" +
               "Each project type has different environmental impacts and pricing. You can browse all projects on our Projects page.";
    }

    function getCarbonCreditInfo() {
        return "Carbon credits are tradable certificates that represent one metric ton of carbon dioxide (or equivalent greenhouse gas) that has been reduced, avoided, or sequestered. They're used to offset emissions and fund environmental projects. On our platform, you can buy, sell, and trade these credits to support climate action.";
    }
}); 
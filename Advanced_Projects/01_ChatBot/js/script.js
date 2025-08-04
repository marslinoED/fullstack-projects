var title = "";
var chat = []
var summary = [];
var lastBotMessage = "";
var lastUserMessage = "";
var currentBotMessage = "";
var currentOption1 = "";
var currentOption2 = "";
var isLoading = false;

function init() {
    // Show the modal popup for title input
    showTitleModal();
    
    // Add touch event listeners for better mobile experience
    addTouchListeners();
    
    // Add keyboard shortcuts
    addKeyboardShortcuts();
}

function addTouchListeners() {
    // Add touch feedback for buttons
    const buttons = document.querySelectorAll('.choice-btn, .tree-btn, .modal-buttons button');
    buttons.forEach(button => {
        button.addEventListener('touchstart', function() {
            this.style.transform = 'scale(0.98)';
        });
        
        button.addEventListener('touchend', function() {
            this.style.transform = '';
        });
    });
}

function addKeyboardShortcuts() {
    document.addEventListener('keydown', function(e) {
        // Escape key to close modal
        if (e.key === 'Escape' && !document.getElementById('titleModal').classList.contains('hidden')) {
            // Don't close modal, just clear input
            const input = document.getElementById('titleInput');
            input.value = '';
            input.focus();
        }
        
        // Number keys for choices (1 and 2)
        if (e.key === '1' && !isLoading && !document.getElementById('titleModal').classList.contains('hidden')) {
            e.preventDefault();
            startChatWithTitle();
        }
        
        if (e.key === '1' && !isLoading && document.getElementById('titleModal').classList.contains('hidden')) {
            e.preventDefault();
            makeChoice(1);
        }
        
        if (e.key === '2' && !isLoading && document.getElementById('titleModal').classList.contains('hidden')) {
            e.preventDefault();
            makeChoice(2);
        }
        
        // T key for tree
        if (e.key === 't' && !isLoading && document.getElementById('titleModal').classList.contains('hidden')) {
            e.preventDefault();
            generateTree();
        }
    });
}

function showTitleModal() {
    const modal = document.getElementById('titleModal');
    const input = document.getElementById('titleInput');
    
    // Focus on input and add enter key listener
    input.focus();
    input.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            startChatWithTitle();
        }
    });
    
    // Add input validation
    input.addEventListener('input', function() {
        this.style.borderColor = '';
        this.placeholder = 'e.g., Space, Cooking, Movies...';
    });
}

function startChatWithTitle() {
    const input = document.getElementById('titleInput');
    const modal = document.getElementById('titleModal');
    
    title = input.value.trim();
    
    if (title !== "") {
        // Hide modal and start chat
        modal.classList.add('hidden');
        startChat();
    } else {
        // Show error or keep modal open
        input.style.borderColor = '#ef4444';
        input.placeholder = 'Please enter a topic!';
        input.focus();
        
        // Add shake animation
        input.style.animation = 'shake 0.5s ease-in-out';
        setTimeout(() => {
            input.style.animation = '';
        }, 500);
    }
}

async function startChat() {
    disableButtons();
    showLoadingState();
    
    try {
        const result = await response(chat);
        hideLoadingState();
        addMessage(result.reply, 'bot');
        updateChoiceButtons(result.option1, result.option2);
        // Store current bot message and options for later saving
        currentBotMessage = result.reply;
        currentOption1 = result.option1;
        currentOption2 = result.option2;
        enableButtons();
    } catch (error) {
        console.error('Error starting chat:', error);
        hideLoadingState();
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        enableButtons();
    }
}

function showLoadingState() {
    isLoading = true;
    const chatMessages = document.getElementById('chatMessages');
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'message bot-message';
    loadingDiv.id = 'loadingMessage';
    loadingDiv.innerHTML = '<div class="loading"></div> Thinking...';
    chatMessages.appendChild(loadingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideLoadingState() {
    isLoading = false;
    const loadingMessage = document.getElementById('loadingMessage');
    if (loadingMessage) {
        loadingMessage.remove();
    }
}

function disableButtons() {
    document.getElementById('choice1').disabled = true;
    document.getElementById('choice2').disabled = true;
    document.getElementById('generateTreeBtn').disabled = true;
}

function enableButtons() {
    document.getElementById('choice1').disabled = false;
    document.getElementById('choice2').disabled = false;
    document.getElementById('generateTreeBtn').disabled = false;
}

function addMessage(text, sender) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `message ${sender}-message`;
    messageDiv.textContent = text;
    chatMessages.appendChild(messageDiv);
    
    // Ensure scroll to bottom with a small delay to account for rendering
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 10);
    
    // Update last message variables (but don't save to chat array yet)
    if (sender === 'bot') {
        lastBotMessage = text;
    } else {
        lastUserMessage = text;
    }
}

function updateChoiceButtons(option1, option2) {
    const choice1 = document.getElementById('choice1');
    const choice2 = document.getElementById('choice2');
    
    choice1.textContent = option1;
    choice2.textContent = option2;
    
    // Add fade-in animation
    choice1.style.opacity = '0';
    choice2.style.opacity = '0';
    
    setTimeout(() => {
        choice1.style.transition = 'opacity 0.3s ease';
        choice2.style.transition = 'opacity 0.3s ease';
        choice1.style.opacity = '1';
        choice2.style.opacity = '1';
    }, 100);
}

async function makeChoice(choiceNumber) {
    if (isLoading) return;
    
    disableButtons();
    showLoadingState();
    
    const button = document.getElementById(`choice${choiceNumber}`);
    const userText = button.textContent;
    
    // Add user message to chat display
    addMessage(userText, 'user');
    
    // Save the complete message object to chat array
    const messageObject = {
        "Message": {
            "bot": currentBotMessage,
            "userChoice": userText,
            "otherChoice": choiceNumber === 1 ? currentOption2 : currentOption1
        }
    };
    chat.push(messageObject);
    
    // Create summary of bot and user messages
    try {
        const summaryResult = await summarize(currentBotMessage, userText);
        const summaryObject = {
            "bot": summaryResult.botSummary,
            "user": summaryResult.userSummary
        };
        
        // Add to summary array
        summary.push(summaryObject);
        
        // Keep only the last 5 summaries
        if (summary.length > 5) {
            summary.shift(); // Remove the oldest summary
        }
        console.log(`${`Recent conversation: ${summary.map(s => `Bot: ${s.bot}, User: ${s.user}`).join(' | ')}`}`);
    } catch (error) {
        console.error('Error creating summary:', error);
    }
    
    try {
        const result = await response(chat);
        hideLoadingState();
        addMessage(result.reply, 'bot');
        updateChoiceButtons(result.option1, result.option2);
        // Store current bot message and options for next choice
        currentBotMessage = result.reply;
        currentOption1 = result.option1;
        currentOption2 = result.option2;
        enableButtons();
    } catch (error) {
        console.error('Error making choice:', error);
        hideLoadingState();
        addMessage('Sorry, I encountered an error. Please try again.', 'bot');
        enableButtons();
    }
}

function generateTree() {
    if (chat.length === 0) {
        showNotification('No chat data available to generate tree. Please have a conversation first!', 'warning');
        return;
    }
    
    // Create a new window with tree.html
    const treeWindow = window.open('pages/tree.html', '_blank');
    
    // Function to send data to tree window
    function sendDataToTree() {
        try {
            const messageData = {
                type: 'CHAT_DATA',
                chat: chat,
                title: title
            };
            treeWindow.postMessage(messageData, '*');
        } catch (error) {
            console.error('Error sending data to tree window:', error);
        }
    }
    
    // Try multiple approaches to ensure the message is sent
    if (treeWindow) {
        // Method 1: Try immediately
        setTimeout(sendDataToTree, 100);
        
        // Method 2: Try after a longer delay
        setTimeout(sendDataToTree, 500);
        
        // Method 3: Try when window loads
        treeWindow.onload = sendDataToTree;
        
        // Method 4: Listen for ready message from tree window
        window.addEventListener('message', function(event) {
            if (event.data.type === 'TREE_READY') {
                sendDataToTree();
            }
        });
    }
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 12px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    
    // Set background color based on type
    switch(type) {
        case 'warning':
            notification.style.background = 'var(--accent-warning)';
            break;
        case 'error':
            notification.style.background = 'var(--accent-danger)';
            break;
        default:
            notification.style.background = 'var(--accent-primary)';
    }
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

async function response(chat) {
  const response = await fetch('https://openrouter-api-phi.vercel.app/api/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "model": "anthropic/claude-3-haiku",
      "temperature": 0.6,
      "messages": [
        {
          "role": "user",

          content: chat.length === 0
            ?
            `Start a chat about "${title}" using clear, simple English. Say one interesting fact.

          Respond as JSON:
          {
            "Reply": "<bot reply, max 20 words>",
            "Option1": "<from the user that goes deeper into the same topic., max 10 words>",
            "Option2": "<from the user that shifts to a completely new topic unrelated to the chat summary, max 10 words>"
          }`
            :
            `Chat title: "${title}"
            
          ${`Recent conversation: ${summary.map(s => `Bot: ${s.bot}, User: ${s.user}`).join(' | ')}`}
          
          Respond as JSON:
          {
            "Reply": "<bot reply that fits the whole chat and answers the last user message. Max 20 words>",
            "Option1": "<from the user that goes deeper into the same topic., max 10 words>",
            "Option2": "<from the user that shifts to a completely new topic unrelated to the chat summary, max 10 words>"
          }`
        }
      ]
    })
  });

  const data = await response.json();
  const json = JSON.parse(data.choices[0].message.content);
  const reply = json.Reply;
  const option1 = json.Option1;
  const option2 = json.Option2;
  return { reply, option1, option2 };
}

async function summarize(bot, user) {
  const response = await fetch('https://openrouter-api-phi.vercel.app/api/proxy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      "model": "anthropic/claude-3-haiku",
      "temperature": 0.6,
      "messages": [
        {
          "role": "user",

          "content": "Summarize the following two sentences. Each summary must be exactly 3 words, preserve meaning and sentence type (question marks stays).. Return the result as a JSON object with two fields: \"bot\" and \"user\".\nBot: " + bot + "\nUser: " + user
        }
      ]
    })
  });

  const data = await response.json();
  const json = JSON.parse(data.choices[0].message.content);
  const botSummary = json.bot;
  const userSummary = json.user;
  return { botSummary, userSummary };
}
// var bot = "Fishing is the act of catching fish. It is a popular activity for many people.";
// var user = "What is fishing? I love fishing, it's so relaxing and fun!";
// summarize(bot, user);
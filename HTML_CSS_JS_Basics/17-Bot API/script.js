var Chat = [];

function renderChat() {
  const chatContainer = document.getElementById("chatContainer");
  if (!chatContainer) {
    console.error("chatContainer element not found");
    return;
  }
  chatContainer.innerHTML = '';
  Chat.forEach(msg => {
    const userDiv = document.createElement('div');
    userDiv.textContent = 'User: ' + msg.user;
    userDiv.style.fontWeight = 'bold';
    chatContainer.appendChild(userDiv);
    if (msg.bot) {
      const botDiv = document.createElement('div');
      botDiv.textContent = 'Bot: ' + msg.bot;
      botDiv.style.marginBottom = '10px';
      chatContainer.appendChild(botDiv);
    }
  });
  chatContainer.scrollTop = chatContainer.scrollHeight;
}

async function generate() {
  var prompt = document.getElementById("textInputField").value;
  if (!prompt.trim()) return;
  document.getElementById("textInputField").disabled = true;
  document.getElementById("submitButton").disabled = true;
  Chat.push({ user: prompt });
  renderChat();

  const API_URL = 'https://chatbot-api-dun.vercel.app/api/proxy'; 

  const payload = {
    model: 'google/gemma-3n-e4b-it', 
    temperature: 0.6,
    max_tokens: 60,
    messages: [
      {
        role: 'user',
        content: `Generate a response doesnt excesed 50 word, based on the following prompt: "${prompt}" based on the context of a conversation: "${Chat.map(message => message.user).join(' ')}"`
      }
    ]
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    const responseMessage = data.choices?.[0]?.message?.content;
    Chat[Chat.length-1].bot = responseMessage;
    renderChat();
    document.getElementById("textInputField").value = '';
  } catch (error) {
    console.error('Error:', error);
    if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      Chat[Chat.length-1].bot = "Error: CORS issue - API not accessible from this domain. Please check the API configuration.";
    } else {
      Chat[Chat.length-1].bot = "Error: Could not get response. " + error.message;
    }
    renderChat();
  } finally {
    document.getElementById("textInputField").disabled = false;
    document.getElementById("submitButton").disabled = false;
    document.getElementById("textInputField").focus();
  }
}

// Wait for DOM to be ready before initializing
document.addEventListener('DOMContentLoaded', function() {
  // Optional: allow Enter key to send
  const input = document.getElementById("textInputField");
  if (input) {
    input.addEventListener("keydown", function(e) {
      if (e.key === "Enter" && !input.disabled) {
        generate();
      }
    });
  }

  // Initial render
  renderChat();
});


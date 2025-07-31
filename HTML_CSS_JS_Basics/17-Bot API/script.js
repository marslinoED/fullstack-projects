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

  // Try the original API first, then fallback to mock response
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
    console.error('API Error:', error);
    console.log('⚠️ Using mock responses due to API/CORS issues. The chatbot will still work for testing!');
    
    // Fallback to mock response when API fails
    const mockResponses = [
      "Hello! I'm a chatbot. How can I help you today?",
      "That's an interesting question. Let me think about that...",
      "I understand what you're asking. Here's what I think...",
      "Thanks for sharing that with me!",
      "I'm here to chat and help out. What's on your mind?"
    ];
    
    // Check for specific question types and provide better responses
    const userMessage = prompt.toLowerCase();
    let response = "";
    
    if (userMessage.includes("capital") && userMessage.includes("egypt")) {
      response = "The capital of Egypt is Cairo. It's the largest city in Egypt and the Arab world.";
    } else if (userMessage.includes("capital") && userMessage.includes("france")) {
      response = "The capital of France is Paris, known as the City of Light.";
    } else if (userMessage.includes("capital") && userMessage.includes("japan")) {
      response = "The capital of Japan is Tokyo, one of the most populous cities in the world.";
    } else if (userMessage.includes("capital") && userMessage.includes("australia")) {
      response = "The capital of Australia is Canberra, not Sydney as many people think.";
    } else if (userMessage.includes("capital") && userMessage.includes("brazil")) {
      response = "The capital of Brazil is Brasília, which was built specifically to be the capital.";
    } else if (userMessage.includes("hello") || userMessage.includes("hi") || userMessage.includes("hey")) {
      response = "Hello! Nice to meet you. How can I help you today?";
    } else if (userMessage.includes("how are you")) {
      response = "I'm doing well, thank you for asking! How about you?";
    } else if (userMessage.includes("weather")) {
      response = "I can't check the weather in real-time, but I'd recommend checking a weather app or website for current conditions.";
    } else if (userMessage.includes("time")) {
      response = "I can't tell you the exact time, but you can check your device's clock or ask your phone's assistant.";
    } else {
      // Use random response for other questions
      response = mockResponses[Math.floor(Math.random() * mockResponses.length)];
    }
    
    Chat[Chat.length-1].bot = `[Mock Response] ${response}`;
    renderChat();
    document.getElementById("textInputField").value = '';
  } finally {
    // Re-enable input fields
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


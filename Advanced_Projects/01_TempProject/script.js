var title = "";
var chat = []
var summary = [];
var lastBotMessage = "";
var lastUserMessage = "";

function init() {
    // Show the modal popup for title input
    showTitleModal();
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
        input.style.borderColor = '#ff4444';
        input.placeholder = 'Please enter a topic!';
        input.focus();
    }
}

async function startChat() {
    disableButtons();
    try {
        const result = await response(chat);
        addMessage(result.reply, 'bot');
        updateChoiceButtons(result.option1, result.option2);
        enableButtons();
    } catch (error) {
        console.error('Error starting chat:', error);
        enableButtons();
    }
}

function disableButtons() {
    document.getElementById('choice1').disabled = true;
    document.getElementById('choice2').disabled = true;
}

function enableButtons() {
    document.getElementById('choice1').disabled = false;
    document.getElementById('choice2').disabled = false;
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
    
    // Add to chat array and update last message variables
    if (sender === 'bot') {
        chat.push({ bot: text });
        lastBotMessage = text;
    } else {
        chat.push({ user: text });
        lastUserMessage = text;
    }
}

function updateChoiceButtons(option1, option2) {
    document.getElementById('choice1').textContent = option1;
    document.getElementById('choice2').textContent = option2;
}

async function makeChoice(choiceNumber) {
    disableButtons();
    
    const button = document.getElementById(`choice${choiceNumber}`);
    const userText = button.textContent;
    
    // Add user message to chat
    addMessage(userText, 'user');
    
    try {
        const result = await response(chat);
        addMessage(result.reply, 'bot');
        updateChoiceButtons(result.option1, result.option2);
        enableButtons();
    } catch (error) {
        console.error('Error making choice:', error);
        enableButtons();
    }
}


async function response(chat) {
  const response = await fetch('https://openrouter-api-pi.vercel.app/api/proxy', {
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
            "Option2": "<from the user that shifts to a exactly different topic, max 10 words>"
          }`
            :
            `Chat title: "${title}"

          Continue this chat using clear and simple English:
          ${lastBotMessage ? `Bot: ${lastBotMessage}` : ''}
          ${lastUserMessage ? `User: ${lastUserMessage}` : ''}
          
          Respond as JSON:
          {
            "Reply": "<bot reply, max 20 words>",
            "Option1": "<from the user that goes deeper into the same topic., max 10 words>",
            "Option2": "<from the user that shifts to a exactly different topic, max 10 words>"
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
  console.log(reply);
  console.log(option1);
  console.log(option2);
  return { reply, option1, option2 };
}

async function summarize(bot, user) {
  const response = await fetch('https://openrouter-api-pi.vercel.app/api/proxy', {
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
  console.log(botSummary);
  console.log(userSummary);
  return { botSummary, userSummary };
}
// var bot = "Fishing is the act of catching fish. It is a popular activity for many people.";
// var user = "What is fishing? I love fishing, it's so relaxing and fun!";
// summarize(bot, user);
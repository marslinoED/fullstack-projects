# Bot API Project

A simple chat bot application using OpenRouter API.

## Security Notice

⚠️ **IMPORTANT**: This project has been updated to handle API keys securely. The previous API key was exposed and has been disabled.

## Setup Instructions

### 1. Get a New API Key
1. Go to [OpenRouter Keys](https://openrouter.ai/keys)
2. Generate a new API key
3. Copy the new key

### 2. Configure Your API Key
1. Open the `config.js` file
2. Replace `'your_new_api_key_here'` with your actual API key:
   ```javascript
   OPENROUTER_API_KEY: 'sk-or-v1-your-actual-api-key-here'
   ```

### 3. Security Best Practices
- The `config.js` file is now included in `.gitignore` to prevent it from being committed to version control
- Never commit API keys to public repositories
- Keep your API keys private and secure

## Usage
1. Open `index.html` in your browser
2. Type your message in the input field
3. Click "Submit" or press Enter to send your message
4. The bot will respond using the OpenRouter API

## Files Structure
- `index.html` - Main HTML file
- `script.js` - JavaScript logic for the chat bot
- `style.css` - Styling for the application
- `config.js` - Configuration file for API keys (not committed to git)
- `.gitignore` - Prevents sensitive files from being committed

## API Configuration
The application uses the Google Gemma 3N model with the following settings:
- Temperature: 0.6
- Max tokens: 60
- Response limit: 50 words 
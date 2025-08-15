const fs = require('fs');

// Load the JSON file
const data = fs.readFileSync('words.json', 'utf-8');
const wordBank = JSON.parse(data).words;

function generateRealisticText(length) {
    let result = '';
    let sentenceLength;

    while (result.length < length) {
        sentenceLength = Math.floor(Math.random() * 9) + 4;
        let sentence = '';
        for (let i = 0; i < sentenceLength; i++) {
            const word = wordBank[Math.floor(Math.random() * wordBank.length)];
            sentence += (i === 0 ? word.charAt(0).toUpperCase() + word.slice(1) : word) + (i < sentenceLength - 1 ? ' ' : '');
        }
        sentence += '. ';
        if (result.length + sentence.length > length) break;
        result += sentence;
    }

    return result.trim();
}

// Example
console.log(generateRealisticText(200));

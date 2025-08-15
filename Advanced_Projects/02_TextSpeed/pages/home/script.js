// Remove Node.js fs usage and use a static word bank for browser compatibility
const wordBank = [
    "the", "be", "to", "of", "and", "a", "in", "that", "have", "I", "it", "for", "not", "on", "with", "he", "as", "you", "do", "at",
    "this", "but", "his", "by", "from", "they", "we", "say", "her", "she", "or", "an", "will", "my", "one", "all", "would", "there", "their", "what",
    "so", "up", "out", "if", "about", "who", "get", "which", "go", "me", "when", "make", "can", "like", "time", "no", "just", "him", "know", "take",
    "people", "into", "year", "your", "good", "some", "could", "them", "see", "other", "than", "then", "now", "look", "only", "come", "its", "over", "think", "also",
    "back", "after", "use", "two", "how", "our", "work", "first", "well", "way", "even", "new", "want", "because", "any", "these", "give", "day", "most", "us"
];

function handleLocalStorage(action, key, value) {
    if (action === "get") return JSON.parse(localStorage.getItem(key));
    if (action === "set") localStorage.setItem(key, JSON.stringify(value));
    if (action === "remove") localStorage.removeItem(key);
}

// Helper: update user stats in Firestore
function updateUserStat(field) {
    const uid = localStorage.getItem('uid');
    if (!uid) return;
    fetch('https://text-speed-test.vercel.app/api/proxy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            state: 'update',
            token: uid,
            changedData: field
        })
    });
}
const userStr = localStorage.getItem("user");
const user = JSON.parse(userStr);
function init() {
    // Set user image if available
    if (userStr) {
        try {
            if (user.img) {
                const userImg = document.getElementById("userImg");
                if (userImg) {
                    userImg.src = user.img;
                }
            }
        } catch (e) { }
    }

    // Typing test logic
    const typingTest = document.getElementById('typingTest');
    const typingInput = document.getElementById('typingInput');
    const startBtn = document.getElementById('startBtn');
    const sentenceLengthInput = document.getElementById('sentenceLength');
    let started = false;
    let timer = null;
    let startTime = null;
    let elapsed = 0;
    let sampleText = '';
    let useRealistic = false;

    const realisticToggle = document.getElementById('realisticToggle');
    realisticToggle.addEventListener('click', function() {
        useRealistic = !useRealistic;
        realisticToggle.classList.toggle('active', useRealistic);
        realisticToggle.textContent = 'Realistic: ' + (useRealistic ? 'On' : 'Off');
        resetTest();
        typingInput.value = '';
        typingInput.disabled = true;
    });

    function renderText() {
        typingTest.innerHTML = '';
        for (let i = 0; i < sampleText.length; i++) {
            const span = document.createElement('span');
            if (sampleText[i] === ' ') {
                span.innerHTML = '&nbsp;';
                span.className = 'letter';
            } else {
                span.textContent = sampleText[i];
                span.className = 'letter';
            }
            typingTest.appendChild(span);
        }
    }

    function resetTest() {
        typingInput.value = '';
        typingInput.disabled = false;
        started = false;
        const length = parseInt(sentenceLengthInput.value) || 20;
        sampleText = useRealistic ? generateRealisticText(length * 5) : generateSentence(length);
        renderText();
        clearInterval(timer);
        timer = null;
        startTime = null;
        elapsed = 0;
        startBtn.textContent = 'Start';
        startBtn.classList.remove('finished');
        startBtn.disabled = false;
        // Hide WPM label
        const wpmLabel = document.getElementById('wpmLabel');
        if (wpmLabel) wpmLabel.style.display = 'none';
    }

    function updateTimer() {
        if (started && startTime) {
            elapsed = Math.floor((Date.now() - startTime) / 1000);
            startBtn.textContent = `⏱ ${elapsed}s`;
        }
    }

    function startTest() {
        typingInput.value = typingInput.value; // keep current value
        typingInput.disabled = false;
        typingInput.focus();
        started = true;
        startTime = Date.now();
        elapsed = 0;
        startBtn.textContent = `⏱ 0s`;
        if (timer) clearInterval(timer);
        timer = setInterval(updateTimer, 1000);
        startBtn.disabled = true;
        startBtn.classList.remove('finished');
        updateUserStat({ 'tests_created': user.tests_created + 1 });
        user.tests_created += 1;
        handleLocalStorage("set", "user", user);
    }

    function finishTest() {
        started = false;
        typingInput.disabled = true;
        clearInterval(timer);
        timer = null;
        startBtn.classList.add('finished');
        startBtn.disabled = false;
        // Calculate and show WPM
        let wpm = 0;
        const length = parseInt(sentenceLengthInput.value) || 20;
        if (elapsed > 0) {
            wpm = Math.floor(length / (elapsed / 60));
        }
        const wpmLabel = document.getElementById('wpmLabel');
        if (wpmLabel) {
            wpmLabel.textContent = `Speed: ${wpm} WPM`;
            wpmLabel.style.display = 'inline-block';
        }
        updateUserStat({ 'tests_done': user.tests_done + 1, 'speed': parseInt((user.speed + wpm) / 2) });
        user.tests_done += 1;
        user.speed = parseInt((user.speed + wpm) / 2);
        handleLocalStorage("set", "user", user);


    }

    typingInput.addEventListener('input', function () {
        // Auto-grow textarea
        typingInput.style.height = 'auto';
        typingInput.style.height = typingInput.scrollHeight + 'px';
        const value = typingInput.value;
        // Start test if not started and first letter is correct
        if (!started && value.length > 0 && value[0] === sampleText[0]) {
            startTest();
        }
        const spans = typingTest.querySelectorAll('.letter');
        let allCorrect = true;
        for (let i = 0; i < spans.length; i++) {
            if (value[i] == null) {
                spans[i].className = 'letter';
                allCorrect = false;
            } else if (value[i] === sampleText[i]) {
                spans[i].className = 'letter correct';
            } else {
                spans[i].className = 'letter incorrect';
                allCorrect = false;
            }
        }
        if (value.length === sampleText.length && allCorrect) {
            finishTest();
        }
    });

    startBtn.addEventListener('click', function () {
        if (!started) {
            typingInput.disabled = false;
            typingInput.focus();
            // Do NOT regenerate sampleText here
            // Do NOT call renderText here
            startTest();
        }
    });

    // Reset button event
    const resetBtn = document.getElementById('resetBtn');
    resetBtn.addEventListener('click', function () {
        resetTest();
        typingInput.value = '';
        typingInput.disabled = true;
    });

    // Sentence length change event
    sentenceLengthInput.addEventListener('change', function () {
        resetTest();
        typingInput.value = '';
        typingInput.disabled = true;
    });

    // Populate sentence length select options
    for (let i = 5; i <= 100; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = i + ' words';
        if (i === 20) opt.selected = true;
        sentenceLengthInput.appendChild(opt);
    }

    // Initial render
    const initialLen = parseInt(sentenceLengthInput.value) || 20;
    sampleText = useRealistic ? generateRealisticText(initialLen * 5) : generateSentence(initialLen);
    renderText();
    typingInput.disabled = true;
    startBtn.disabled = false;
    startBtn.classList.remove('finished');
    startBtn.textContent = 'Start';

    // Listen for the correct first letter keydown to start the test
    document.addEventListener('keydown', function(e) {
        if (!started && typingInput.disabled && sampleText && e.key === sampleText[0]) {
            typingInput.disabled = false;
            typingInput.focus();
            typingInput.value = e.key;
            startTest();
            // Move cursor to end
            setTimeout(() => typingInput.setSelectionRange(typingInput.value.length, typingInput.value.length), 0);
            e.preventDefault();
        }
    });
}

function generateWord() {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const wordLength = Math.floor(Math.random() * 6) + 3; // Random length between 3 and 8
    let randomWord = '';
    for (let i = 0; i < wordLength; i++) {
        const randomIndex = Math.floor(Math.random() * letters.length);
        randomWord += letters[randomIndex];
    }
    return randomWord;
}

function generateSentence(sentenceLength) {
    let randomSentence = '';
    for (let i = 0; i < sentenceLength; i++) {
        randomSentence += generateWord() + ' ';
    }
    return randomSentence.trim() + '.';
}

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


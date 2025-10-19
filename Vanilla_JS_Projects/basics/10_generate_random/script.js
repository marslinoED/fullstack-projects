function init() {
    createParticles();
}

// Array to store all generated random numbers
var generatedNumbers = [];

var minRange = 0;
function updateMinRangeValue() {
    var range = document.getElementById("minRangeInput");
    var valueSpan = document.getElementById("minRangeValue");
    var maxRangeInput = document.getElementById("maxRangeInput");
    valueSpan.textContent = range.value;
    minRange = parseInt(range.value, 10);
    if (minRange > maxRange) {
        maxRange = minRange;
        maxRangeInput.value = minRange;
        document.getElementById("maxRangeValue").textContent = minRange;
    }
}

var maxRange = 100;
function updateMaxRangeValue() {
    var range = document.getElementById("maxRangeInput");
    var valueSpan = document.getElementById("maxRangeValue");
    var minRangeInput = document.getElementById("minRangeInput");
    valueSpan.textContent = range.value;
    maxRange = parseInt(range.value, 10);
    if (maxRange < minRange) {
        minRange = maxRange;
        minRangeInput.value = maxRange;
        document.getElementById("minRangeValue").textContent = maxRange;
    }
}

function showAlert() {
    var num = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
    var randomNumberElement = document.getElementById("RandomNumberP");
    
    // Add animation class
    randomNumberElement.classList.add("generated");
    randomNumberElement.innerHTML = num;

    // Add the generated number to the list
    generatedNumbers.push(num);

    // Display the list of generated numbers
    displayGeneratedNumbers();
    
    // Remove animation class after animation completes
    setTimeout(() => {
        randomNumberElement.classList.remove("generated");
    }, 500);
}

function displayGeneratedNumbers() {
    var numbersTextarea = document.getElementById("generatedNumbersTextarea");
    numbersTextarea.value = generatedNumbers.join("\n");
    numbersTextarea.scrollTop = numbersTextarea.scrollHeight;
}

function createParticles() {
    const particlesContainer = document.getElementById("particles");
    const particleCount = 20;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement("div");
        particle.className = "particle";
        
        // Random positioning and animation delay
        particle.style.left = Math.random() * 100 + "%";
        particle.style.animationDelay = Math.random() * 6 + "s";
        particle.style.animationDuration = (Math.random() * 3 + 4) + "s";
        
        particlesContainer.appendChild(particle);
    }
}

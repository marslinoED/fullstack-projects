var randomNumber;
var guesses = [];

function init() {
    randomNumber = Math.round(Math.random() * 100);
}

function checkGuess() {
    var input = document.getElementById("guessInput").value;
    if (input === "" || isNaN(input)) {
        document.getElementById("result").textContent = "Please enter a valid number.";
        return;
    }
    if (guesses.length >= 10) {
        guesses.shift();
    }
    if (input == randomNumber) {
        guesses.push(input);
        document.getElementById("result").textContent = 
        "Congratulations! You guessed the number. It was " + randomNumber + ".";
        document.getElementById("guessInput").disabled = true;
        document.getElementById("guessButton").textContent = "Replay?";
        document.getElementById("guessButton").onclick = function () {
            location.reload();
        };

    } else if (input < randomNumber) {
        guesses.push(">" + input);
        document.getElementById("result").textContent = "Too low! Try again.";
    } else {
        guesses.push("<" + input);
        document.getElementById("result").textContent = "Too High! Try again.";
    }

    document.getElementById("attempts").textContent = guesses.join("\n");
}
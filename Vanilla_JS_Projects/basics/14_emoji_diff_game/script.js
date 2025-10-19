emojiCount = 2;
level = 1;
emojiPath = 'assets/Happy_emojii.png';


function init() {
    document.getElementById("Level").textContent = "Level: " + level

    const leftSideDiv = document.querySelector('.leftSide');
    const rightSideDiv = document.querySelector('.rightSide');
    intializing_left_side(leftSideDiv);
    intializing_right_side(rightSideDiv, leftSideDiv);
}

function intializing_left_side(leftSideDiv) {
    leftSideDiv.innerHTML = "";
    leftSideDiv.style.position = 'relative';
    leftSideDiv.style.overflow = 'hidden';

    // Spawn emojis at random locations
    for (let i = 0; i < emojiCount; i++) {
        spawnEmoji(leftSideDiv, "normalImg");
    }
}
function intializing_right_side(rightSideDiv, leftSideDiv) {
    rightSideDiv.innerHTML = "";
    rightSideDiv.innerHTML = leftSideDiv.innerHTML;
    spawnEmoji(leftSideDiv, "amongUs")
}
function spawnEmoji(container, id) {
    const emoji = document.createElement('img');
    emoji.src = emojiPath
    emoji.alt = 'Happy Emoji';
    emoji.style.position = 'absolute';
    emoji.style.width = '50px';
    emoji.style.height = '50px';
    emoji.style.cursor = 'pointer';

    // Generate random position within the container bounds
    const maxX = container.clientWidth - 50; // Subtract emoji width
    const maxY = container.clientHeight - 50; // Subtract emoji height

    const randomX = Math.random() * maxX;
    const randomY = Math.random() * maxY;

    emoji.style.left = randomX + 'px';
    emoji.style.top = randomY + 'px';

    // Add click event to respawn emoji at new random location
    emoji.addEventListener('click', function () {
        if (id == "normalImg")
            losing();
        else if (id == "amongUs")
            nextLvl();
    });

    container.appendChild(emoji);
}

function nextLvl() {
    emojiCount += 4;
    level += 1;
    init();
}

function losing() {
    showGameOverPopup();
}
function showGameOverPopup() {
    // Create popup overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    overlay.style.display = 'flex';
    overlay.style.justifyContent = 'center';
    overlay.style.alignItems = 'center';
    overlay.style.zIndex = '1000';

    // Create popup content
    const popup = document.createElement('div');
    popup.style.backgroundColor = 'white';
    popup.style.padding = '40px';
    popup.style.borderRadius = '10px';
    popup.style.textAlign = 'center';
    popup.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.3)';
    popup.style.maxWidth = '400px';
    popup.style.width = '90%';

    // Create game over text
    const gameOverText = document.createElement('h2');
    gameOverText.textContent = 'GAME OVER';
    gameOverText.style.color = '#e74c3c';
    gameOverText.style.margin = '0 0 20px 0';
    gameOverText.style.fontSize = '2.5em';
    gameOverText.style.fontWeight = 'bold';

    // Create restart button
    const restartButton = document.createElement('button');
    restartButton.textContent = 'Play Again';
    restartButton.style.backgroundColor = '#3498db';
    restartButton.style.color = 'white';
    restartButton.style.border = 'none';
    restartButton.style.padding = '12px 24px';
    restartButton.style.borderRadius = '5px';
    restartButton.style.fontSize = '1.1em';
    restartButton.style.cursor = 'pointer';
    restartButton.style.marginTop = '20px';

    // Add hover effect
    restartButton.addEventListener('mouseenter', function () {
        this.style.backgroundColor = '#2980b9';
    });

    restartButton.addEventListener('mouseleave', function () {
        this.style.backgroundColor = '#3498db';
    });

    // Add click event to restart game
    restartButton.addEventListener('click', function () {
        document.body.removeChild(overlay);
        level = 1;
        emojiCount = 2;
        init();
    });

    // Assemble popup
    popup.appendChild(gameOverText);
    popup.appendChild(restartButton);
    overlay.appendChild(popup);

    // Add to page
    document.body.appendChild(overlay);
}


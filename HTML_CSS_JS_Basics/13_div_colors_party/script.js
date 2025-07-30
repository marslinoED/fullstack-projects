function getRandomColor() {
    return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
}

function init() {
    generateParty();
    startPartyInterval();
}

function generateParty(){
    const party = document.getElementById('the_party');
    let size = 10;
    for (let i = 0; i < 10; i++) {
        const div = generateDiv(size, i);
        party.appendChild(div);
        size += 8;
    }
}
function generateDiv(size, i) {
    var div = document.createElement('div');
    div.style.position = 'absolute';
    div.style.left = '50%';
    div.style.top = '50%';
    div.style.transform = 'translate(-50%, -50%)';
    div.style.width = size + '%';
    div.style.height = size + '%';
    div.style.background = getRandomColor();
    div.style.zIndex = 10 - i; // Ensure correct stacking order
    div.style.borderRadius = '10px';
    return div;
}

function startPartyInterval() {
    const party = document.getElementById('the_party');
    setInterval(() => {
        if (party.children.length >= 10) {
            party.removeChild(party.lastElementChild);
        }
        // Add new div at the top
        const size = 10 + 10 * 0; // Always start with the smallest size for new div
        const newDiv = generateDiv(size, 0);
        party.insertBefore(newDiv, party.firstChild);
        // Update sizes and zIndex for all divs
        let currentSize = 10;
        for (let i = 0; i < party.children.length; i++) {
            const div = party.children[i];
            div.style.width = currentSize + '%';
            div.style.height = currentSize + '%';
            div.style.zIndex = 10 - i;
            currentSize += 10;
        }
    }, 1000);
}
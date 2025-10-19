function init() {
}

function Fruit(name, price) {
    this.name = name;
    this.price = price;
}

var fruits = []
function addCar() {
    var name = document.getElementById('nameInputField').value;
    var price = document.getElementById('priceInputField').value;
    if (!name || !price) {
        alert('Please fill in all fields.');
        return;
    }

    var newFruit = new Fruit(name, price);
    fruits.push(newFruit);
    displayFruits();
}

function displayFruits() {
    var fruitList = document.getElementById('fruitList');
    fruitList.innerHTML = '';
    fruits.forEach(function (fruit, index) {
        var listItem = document.createElement('li');
        listItem.textContent = `${fruit.name} (${fruit.price})`;
        fruitList.appendChild(listItem);
    });
}

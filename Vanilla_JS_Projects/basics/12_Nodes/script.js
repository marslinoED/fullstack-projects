function init() {
}
var list = [
    ["something1", "something2", "something3"],
    ["something4", "something5", "something6"],
    ["something7", "something8", "something9"]
];
function insert(index) {
    var ul = document.getElementById("ol" + index);
    var isOpen = ul.children.length > 0;
    if (isOpen) {
        // Fade out and remove each li with staggered delay
        Array.from(ul.children).forEach(function(li, idx) {
            li.classList.add("fade-out");
            li.style.animationDelay = (idx * 0.1) + "s";
            li.addEventListener("animationend", function handler() {
                li.removeEventListener("animationend", handler);
                li.remove();
            });
        });
    } else {
        list[index].forEach(function(item, i) {
            var li = document.createElement("li");
            li.textContent = item;
            li.className = "fade-in";
            li.style.animationDelay = (i * 0.1) + "s";
            ul.appendChild(li);
            li.addEventListener("animationend", function handler() {
                li.removeEventListener("animationend", handler);
                li.className = "";
                li.style.animationDelay = "";
            });
        });
    }
}
function init() {

    const uid = handleLocalStorage("get", "uid");
    // const uid = null;
    if (!uid) {
        window.location.href = 'pages/login/';
    } else {
        window.location.href = 'pages/home/';
    }
    console.log("Current User UID:", uid);
}
function handleLocalStorage(action, key, value) {
    if (action === "get") return localStorage.getItem(key);
    if (action === "set") localStorage.setItem(key, JSON.stringify(value));
    if (action === "remove") localStorage.removeItem(key);
}
window.onload = init;

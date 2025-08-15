function goHome() {
  window.location.href = '../home/';
}
// Define helper first
function handleLocalStorage(action, key, value) {
  if (action === "get") return JSON.parse(localStorage.getItem(key));
  if (action === "set") localStorage.setItem(key, JSON.stringify(value));
  if (action === "remove") localStorage.removeItem(key);
}



function init() {
  const user = handleLocalStorage("get", "user");
  if (!user) {
    console.error("No user found in localStorage");
    return;
  }
  document.getElementById("user-info").innerHTML = `
    <img src="${user.img}" width="100" alt="User image"/>
    <h3>${user.name}</h3>
    <p><b>Email:</b> ${user.email}</p>
    <p><b>Tests Created:</b> ${user.tests_created}</p>
    <p><b>Tests Done:</b> ${user.tests_done}</p>
    <p><b>Speed (WPM):</b> ${user.speed}</p>
  `;
}

function logout() {
  handleLocalStorage('remove', 'user');
  handleLocalStorage('remove', 'uid');
  window.location.href = '../login/';
}
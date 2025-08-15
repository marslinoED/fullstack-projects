function init() {
}



function handleCredentialResponse(response) {
  const id_token = response.credential;
  const payload = JSON.parse(atob(id_token.split('.')[1]));

  fetch("https://text-speed-test.vercel.app/api/proxy", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      state: "addUser",
      name: payload.name,
      email: payload.email,
      img: payload.picture
    })
  })
    .then(res => res.json())
    .then(data => {
      console.log("Token:", data.token);
      console.log("User:", data.user);
      localStorage.setItem("uid", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      window.location.href = '../home/';
    });
}

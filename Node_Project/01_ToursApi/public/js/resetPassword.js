const form = document.getElementById("reset-form");
const submitBtn = document.getElementById("submit-btn");
const statusDiv = document.getElementById("status");

// token من الـ URL
const token = window.location.pathname.split("/").pop();
  console.log(token);
  
submitBtn.addEventListener("click", async () => {
  if (!form.reportValidity()) return;

  const password = form.password.value;
  const passwordConfirm = form.passwordConfirm.value;

  submitBtn.disabled = true;
  submitBtn.textContent = "Updating...";

  try {
    if (password !== passwordConfirm) {
      throw new Error("Passwords do not match");
    }
    const res = await fetch(`/api/v1/users/resetPassword/${token}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, passwordConfirm }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    statusDiv.textContent = "✅ Password updated successfully";
  } catch (err) {
    statusDiv.textContent = err.message || "Something went wrong";
    submitBtn.disabled = false;
    submitBtn.textContent = "Update Password";
  }
});

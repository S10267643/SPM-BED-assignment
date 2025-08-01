document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  // reCAPTCHA token
  const captcha = grecaptcha.getResponse();
  if (!captcha) {
    alert("Please complete the CAPTCHA.");
    return;
  }

  const user = {
    name,
    email,
    password,
    role,
    captcha // include in body to send to backend
  };

  try {
    const res = await fetch("/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(user)
    });

    const data = await res.json();

    if (res.ok) {
      alert("Registration successful!");
      window.location.href = "login.html";
    } else {
      alert("Error: " + data.error);
    }
  } catch (err) {
    console.error("Registration error:", err);
    alert("Something went wrong.");
  }
});

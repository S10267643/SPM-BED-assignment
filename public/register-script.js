


document.getElementById("registerForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const name = document.getElementById("name").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const role = document.getElementById("role").value;

  const user = {
    name,
    email,
    password,
    role
  };

  try {
    console.log(JSON.stringify(user));
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
      console.log("Server response:", data);
      alert("Error: " + data.error);
    }
  } catch (err) {
    alert("Something went wrong.");
    console.error(err);
  }
});

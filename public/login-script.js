document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch("/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Verify we got a user ID
      if (!data.userId) {
        throw new Error("Server didn't return user ID");
      }
      // Save token to localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem('userId', String(data.userId)); 

      alert("Login successful!");
      window.location.href = "index.html";
    } else {
      alert(data.error || "Login failed");
    }
  } catch (error) {
    console.error("Login error:", error);
    alert("Something went wrong while logging in.");
  }
});

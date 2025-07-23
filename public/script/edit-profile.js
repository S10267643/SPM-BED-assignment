document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");
  const userId = getUserIdFromToken();

  if (!token || !userId) {
    alert("You're not logged in.");
    window.location.href = "login.html"; // or your login page
    return;
  }

  try {
    // 🔄 Fetch current user data
const response = await fetch(`http://localhost:3000/users/${userId}`, {
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

if (!response.ok) {
  const errorText = await response.text(); // Read as text to see what went wrong
  console.error("Bad response (not JSON):", errorText);
  throw new Error("Failed to fetch user profile.");
}

const user = await response.json(); // Only do this after .ok check


    // ✅ Pre-fill the form
    document.getElementById("name").value = user.name || "";
    document.getElementById("email").value = user.email || "";
    document.getElementById("phone").value = user.phone || "";

    // 🔄 Submit updated data
    document.getElementById("editProfileForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      const updatedUser = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
      };

      const password = document.getElementById("password").value.trim();
      if (password) updatedUser.password = password;

      // ✅ Optional phone validation
      if (!/^[89]\d{7}$/.test(updatedUser.phone)) {
        alert("Phone number must be 8 digits and start with 8 or 9.");
        return;
      }

      const updateRes = await fetch(`http://localhost:3000/users/${userId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updatedUser),
      });

      if (!updateRes.ok) {
        const err = await updateRes.json();
        throw new Error(err.error || "Update failed");
      }

      alert("Profile updated successfully!");
      window.location.href = "caregiverHomeScreen.html"; // ✅ Go back
    });

  } catch (err) {
    console.error("Profile load/update error:", err);
    alert("Something went wrong loading or updating your profile.");
  }
});

// 🔒 Decode JWT to get user ID
function getUserIdFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.id || null;
  } catch (e) {
    console.error("Invalid JWT:", e);
    return null;
  }
}

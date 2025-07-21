const step1Div = document.getElementById("step1");
const step2Div = document.getElementById("step2");
const step3Div = document.getElementById("step3");
const messageDiv = document.getElementById("message");

document.getElementById("sendOtpBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  messageDiv.textContent = "";
  if (!email) {
    messageDiv.textContent = "Please enter your email.";
    messageDiv.style.color = "red";
    return;
  }

  try {
    const res = await fetch("/users/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();

    if (res.ok) {
      messageDiv.textContent = "OTP sent to your email.";
      messageDiv.style.color = "green";
      step1Div.style.display = "none";
      step2Div.style.display = "block";
    } else {
      messageDiv.textContent = data.error || "Failed to send OTP.";
      messageDiv.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    messageDiv.textContent = "Error sending OTP.";
    messageDiv.style.color = "red";
  }
});

document.getElementById("verifyOtpBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const otp = document.getElementById("otp").value.trim();
  messageDiv.textContent = "";

  if (!otp || otp.length !== 6) {
    messageDiv.textContent = "Please enter a valid 6-digit OTP.";
    messageDiv.style.color = "red";
    return;
  }

  try {
    const res = await fetch("/users/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();

    if (res.ok) {
      messageDiv.textContent = "OTP verified! Please enter your new password.";
      messageDiv.style.color = "green";
      step2Div.style.display = "none";
      step3Div.style.display = "block";
    } else {
      messageDiv.textContent = data.error || "OTP verification failed.";
      messageDiv.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    messageDiv.textContent = "Error verifying OTP.";
    messageDiv.style.color = "red";
  }
});

document.getElementById("resetPasswordBtn").addEventListener("click", async () => {
  const email = document.getElementById("email").value.trim();
  const newPassword = document.getElementById("newPassword").value.trim();
  messageDiv.textContent = "";

  if (!newPassword || newPassword.length < 8) {
    messageDiv.textContent = "Password must be at least 8 characters.";
    messageDiv.style.color = "red";
    return;
  }

  try {
    const res = await fetch("/users/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, newPassword }),
    });
    const data = await res.json();

    if (res.ok) {
      messageDiv.textContent = "Password reset successfully! You can now login.";
      messageDiv.style.color = "green";

      setTimeout(() => {
        window.location.href = "login.html";
      }, 2000);
    } else {
      messageDiv.textContent = data.error || "Failed to reset password.";
      messageDiv.style.color = "red";
    }
  } catch (err) {
    console.error(err);
    messageDiv.textContent = "Error resetting password.";
    messageDiv.style.color = "red";
  }
});

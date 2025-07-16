document.addEventListener("DOMContentLoaded", () => {
  
  const dayElements = document.querySelectorAll(".day");
  const confirmBtn = document.querySelector(".btn.confirm");

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

const userId = getUserIdFromToken();
if (!userId) {
  alert("You must be logged in to access this page.");
  window.location.href = "login.html";
}
  // Toggle selected days
  dayElements.forEach(day => {
    day.addEventListener("click", () => {
      day.classList.toggle("selected");
    });
  });

  // Handle confirm button click
  confirmBtn.addEventListener("click", async () => {
    const medName = document.getElementById("medName").value.trim();
    const dosage = document.getElementById("dosage").value.trim();
    const time = document.getElementById("time").value;


    const selectedDays = Array.from(document.querySelectorAll(".day.selected"))
      .map(day => parseInt(day.id.trim()));
    console.log(selectedDays);
    if (!medName || !dosage || selectedDays.length === 0 || !time) {
      alert("Please fill in all fields.");
      return;
    }

    for (const day of selectedDays) {
      const medicationData = {
        user_id: userId,
        medication_name: medName,
        dosage: dosage,
        medication_time: time,
        day_of_week: day
      };


      try {
        const token = localStorage.getItem("token"); // Get token from localStorage

        const response = await fetch("/api/medications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Include the token here
          },
          body: JSON.stringify(medicationData)
        });

        const data = await response.json();

        if (response.ok) {
          
          alert("Added medication.");
          window.location.href = "caregiverHomeScreen.html";
        }
        else {
          alert("Error: " + data.error);
        }

      } catch (err) {
        console.error("Request failed:", err);
        alert("Something went wrong. Please try again.");
        return;
      }
    }

    
    
  });
});

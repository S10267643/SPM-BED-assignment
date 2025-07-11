document.addEventListener("DOMContentLoaded", () => {
  const dayElements = document.querySelectorAll(".day");
  const confirmBtn = document.querySelector(".btn.confirm");

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

    if (!medName || !dosage || selectedDays.length === 0 || !time) {
      alert("Please fill in all fields.");
      return;
    }

    for (const day of selectedDays) {
      const medicationData = {
        user_id: 1,
        medication_name: medName,
        medication_prescription: dosage,
        medication_time: time,
        day_of_week: day
      };

      try {
        const response = await fetch("http://localhost:3000/api/medications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(medicationData)
        });

        if (!response.ok) {
          const error = await response.json();
          console.error("Request failed:", error);
          alert("Error: " + (error.error || "Could not add medication."));
          return;
        }

      } catch (err) {
        console.error("Request failed:", err);
        alert("Something went wrong. Please try again.");
        return;
      }
    }

    alert("Medication added successfully!");
    window.location.href = "index.html";
  });
});

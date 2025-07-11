
document.addEventListener("DOMContentLoaded", () => {
  const dayElements = document.querySelectorAll(".day");

  dayElements.forEach(day => {
    day.addEventListener("click", () => {
      day.classList.toggle("selected");
    });
  });
});





document.addEventListener("DOMContentLoaded", () => {
  const confirmBtn = document.querySelector(".btn.confirm");

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

    const medicationData = {
      name: medName,
      dosage: dosage,
      time: time,
      days: selectedDays
    };

    try {
      const response = await fetch("http://localhost:3000/api/medications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(medicationData)
      });

      if (response.ok) {
        alert("Medication added successfully!");
        window.location.href = "index.html";
      } else {
      const error = await response.json();
      console.error("Request failed:", error);
      alert("Error: " + (error.error || "Could not add medication."));
      }

    } catch (err) {
      console.error("Request failed:", err);
      alert("Something went wrong. Please try again.");
    }
  });
});

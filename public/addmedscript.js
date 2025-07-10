
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
      .map(day => day.textContent.trim());

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
      const response = await fetch("/api/medications", {
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
        alert("Error: " + (error.message || "Could not add medication."));
      }
    } catch (err) {
      console.error("Request failed:", err);
      alert("Something went wrong. Please try again.");
    }
  });
});

document.addEventListener("DOMContentLoaded", async () => {


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


  const dayElements = document.querySelectorAll(".day");
  const confirmBtn = document.querySelector(".btn.confirm");
  const medNameInput = document.getElementById("medName");
  const dosageInput = document.getElementById("dosage");
  const timeSelect = document.getElementById("time");

  // Get medication ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const medicationId = urlParams.get('id');
  
  let isEditMode = false;

  // If there's an ID, load the existing medication data
  if (medicationId) {
    isEditMode = true;
    await loadMedicationData(medicationId);
  }

  // Toggle selected days
  dayElements.forEach(day => {
    day.addEventListener("click", () => {
      day.classList.toggle("selected");
    });
  });

  // Handle confirm button click
  confirmBtn.addEventListener("click", async () => {
    const medName = medNameInput.value.trim();
    const dosage = dosageInput.value.trim();
    const time = timeSelect.value;

    const selectedDays = Array.from(document.querySelectorAll(".day.selected"))
      .map(day => parseInt(day.id.trim()));
    
    if (!medName || !dosage || selectedDays.length === 0 || !time) {
      alert("Please fill in all fields.");
      return;
    }

    if (isEditMode) {
      // Update existing medication
      await updateMedication(medicationId, {
        medication_name: medName,
        dosage: dosage,
        medication_time: time,
        day_of_week: selectedDays[0] // For now, handle only one day
      });
    } else {
      // Add new medication (this shouldn't happen in edit mode, but keeping for safety)
      await addMedication(medName, dosage, time, selectedDays);
    }
  });

  // Load existing medication data
  async function loadMedicationData(id) {
    try {
      const response = await fetch(`/api/medications/${id}`);
      const data = await response.json();

      if (response.ok) {
        // Populate the form with existing data
        medNameInput.value = data.medication_name;
        dosageInput.value = data.dosage;
        timeSelect.value = data.time;
        
        // Select the appropriate day
        const dayElement = document.getElementById(data.day_of_week.toString());
        if (dayElement) {
          dayElement.classList.add("selected");
        }
        
        // Update button text and header
        confirmBtn.textContent = "Update";
        document.querySelector("h2").textContent = "Edit Medication";
      } else {
        alert("Error loading medication data: " + data.error);
        window.location.href = "deletemedicine.html";
      }
    } catch (err) {
      console.error("Failed to load medication data:", err);
      alert("Something went wrong loading the medication data.");
      window.location.href = "deletemedicine.html";
    }
  }

  // Update medication
  async function updateMedication(id, medicationData) {
    try {
      const response = await fetch(`/api/medications/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(medicationData)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Medication updated successfully.");
        window.location.href = "deletemedicine.html";
      } else {
        alert("Error updating medication: " + data.error);
      }
    } catch (err) {
      console.error("Request failed:", err);
      alert("Something went wrong. Please try again.");
    }
  }

  // Add medication (keeping this for completeness, though it shouldn't be used in edit mode)
  async function addMedication(medName, dosage, time, selectedDays) {
    for (const day of selectedDays) {
      const medicationData = {
        user_id: userId,
        medication_name: medName,
        dosage: dosage,
        medication_time: time,
        day_of_week: day
      };

      try {
        const response = await fetch("/api/medications", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(medicationData)
        });

        const data = await response.json();

        if (response.ok) {
          alert("Added medication.");
          window.location.href = "index.html";
        } else {
          alert("Error: " + data.error);
        }
      } catch (err) {
        console.error("Request failed:", err);
        alert("Something went wrong. Please try again.");
        return;
      }
    }
  }
});
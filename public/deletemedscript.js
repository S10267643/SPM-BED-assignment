document.addEventListener("DOMContentLoaded", async () => {
  let medications = [];
  let selectedMedicationId = null;


  
  // Load medications from the database
  await loadMedications();

  // Add event listeners to buttons
  const deleteBtn = document.querySelector(".btn.delete");
  const editBtn = document.querySelector(".btn.edit");

  deleteBtn.addEventListener("click", handleDelete);
  editBtn.addEventListener("click", handleEdit);

  async function loadMedications() {
    try {
      const response = await fetch("/api/medications");
      medications = await response.json();
      
      if (response.ok) {
        displayMedications();
      } else {
        console.error("Failed to load medications");
      }
    } catch (error) {
      console.error("Error loading medications:", error);
    }
  }

  function displayMedications() {
    const medicationList = document.querySelector(".medication-list");
    medicationList.innerHTML = "";

    if (medications.length === 0) {
      medicationList.innerHTML = "<p>No medications found.</p>";
      return;
    }

    medications.forEach(medication => {
      const medicationItem = document.createElement("div");
      medicationItem.className = "medication-item";
      medicationItem.dataset.id = medication.id;
      
      // Convert time format for display
      const timeDisplay = formatTime(medication.time);
      const dayDisplay = getDayName(medication.day_of_week);
      
      medicationItem.innerHTML = `
        <div class="medication-content">
          <div class="medication-name">${medication.medication_name}</div>
          <div class="medication-time">${timeDisplay} - ${dayDisplay}</div>
          <div class="medication-dosage">${medication.dosage}</div>
        </div>
      `;

      medicationItem.addEventListener("click", () => {
        // Unselect all items
        document.querySelectorAll(".medication-item").forEach(item => {
          item.classList.remove("selected");
        });

        // Select the clicked item
        medicationItem.classList.add("selected");
        selectedMedicationId = medication.id;
      });

      medicationList.appendChild(medicationItem);
    });
  }

  async function handleDelete() {
    if (!selectedMedicationId) {
      alert("Please select a medication to delete.");
      return;
    }

    if (!confirm("Are you sure you want to delete this medication?")) {
      return;
    }

    try {
      const response = await fetch(`/api/medications/${selectedMedicationId}`, {
        method: "DELETE",
      });

      const data = await response.json();

      if (response.ok) {
        alert("Medication deleted successfully!");
        selectedMedicationId = null;
        await loadMedications(); // Reload the list
      } else {
        alert("Error: " + data.error);
      }
    } catch (error) {
      console.error("Error deleting medication:", error);
      alert("Something went wrong. Please try again.");
    }
  }

  function handleEdit() {
    if (!selectedMedicationId) {
      alert("Please select a medication to edit.");
      return;
    }

    // Navigate to edit page with medication ID
    window.location.href = `editmedicine.html?id=${selectedMedicationId}`;
  }

  function formatTime(timeString) {
    // Convert from HH:MM:SS to 12-hour format
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  }

  function getDayName(dayNumber) {
    const days = ['', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    return days[dayNumber] || 'Unknown';
  }
});
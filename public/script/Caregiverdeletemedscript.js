document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("elderlyDropdown");
  const medicationList = document.querySelector(".medication-list");
  const deleteBtn = document.querySelector(".btn.delete");
  const editBtn = document.querySelector(".btn.edit");

  let medications = [];
  let selectedMedicationId = null;

  // 🔹 Load elderly users into dropdown (frontend filter from /api/users)
  function loadElderlyDropdown() {
  const dropdown = document.getElementById("elderlyDropdown");

  fetch("/users?role=elderly")
    .then(response => {
      if (!response.ok) throw new Error("Failed to fetch users");
      return response.json();
    })
    .then(users => {
      // Clear existing options
      dropdown.innerHTML = '<option disabled selected value="">Choose Elderly</option>';

      if (users.length === 0) {
        const noOption = document.createElement("option");
        noOption.textContent = "No elderly users found";
        noOption.disabled = true;
        dropdown.appendChild(noOption);
      } else {
        users.forEach(user => {
          const option = document.createElement("option");
          option.value = user.userId;
          option.textContent = user.name;
          dropdown.appendChild(option);
        });
      }
    })
    .catch(err => {
      console.error("Error loading elderly users:", err);
      dropdown.innerHTML = '<option disabled selected value="">Error loading users</option>';
    });
}


  // 🔹 When elderly is selected, fetch their medications
  dropdown.addEventListener("change", async () => {
    const userId = dropdown.value;
    selectedMedicationId = null;
    await fetchMedications(userId);
  });

  // 🔹 Fetch medication data
  async function fetchMedications(userId) {
    try {
      const res = await fetch(`/api/medications/user/${userId}`);
      if (!res.ok) throw new Error("Failed to load medications");

      medications = await res.json();
      renderMedications();
    } catch (err) {
      console.error("Error loading medications:", err);
      alert("Unable to load medications.");
      medicationList.innerHTML = "<p>Error loading medications.</p>";
    }
  }

  // 🔹 Render medication entries
  function renderMedications() {
    medicationList.innerHTML = "";

    if (!medications.length) {
      medicationList.innerHTML = "<p>No medications found.</p>";
      return;
    }

    medications.forEach(med => {
      const item = document.createElement("div");
      item.className = "medication-item";
      item.dataset.id = med.supplyId;

      item.innerHTML = `
        <div class="medication-content">
          <div class="medication-name">${med.medication_name}</div>
          <div class="medication-time">${med.medication_time || "-"}</div>
          <div class="medication-dosage">${med.dosage}</div>
        </div>
      `;

      item.addEventListener("click", () => {
        document.querySelectorAll(".medication-item").forEach(i => i.classList.remove("selected"));
        item.classList.add("selected");
        selectedMedicationId = med.supplyId;
      });

      medicationList.appendChild(item);
    });
  }

  // 🔹 Handle deletion
  deleteBtn.addEventListener("click", async () => {
    if (!selectedMedicationId) return alert("Select a medication to delete.");

    if (!confirm("Are you sure you want to delete this medication?")) return;

    try {
      const res = await fetch(`/api/medications/${selectedMedicationId}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok) {
        alert("Medication deleted successfully.");
        await fetchMedications(dropdown.value);
      } else {
        alert("Error deleting medication: " + (data.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Failed to delete medication.");
    }
  });

  // 🔹 Handle edit
  editBtn.addEventListener("click", () => {
    if (!selectedMedicationId) return alert("Select a medication to edit.");
    window.location.href = `caregiverEditmedicine.html?id=${selectedMedicationId}`;
  });

  // 🔹 Start-up
  loadElderlyDropdown();
});

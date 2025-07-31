document.addEventListener("DOMContentLoaded", () => {
  const dayElements = document.querySelectorAll(".day");
  const confirmBtn = document.querySelector(".btn.confirm");

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

  // Enhanced token validation with role check
  function validateUserAccess() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You must be logged in to access this page.");
      window.location.href = "login.html";
      return false;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const userRole = payload.role;
      
      // Check if user has Caregiver role
      if (userRole !== "Caregiver") {
        alert("Access denied. Only Caregivers can add medications.");
        window.location.href = "login.html";
        return false;
      }

      console.log("User validated:", { userId: payload.userId || payload.id, role: userRole });
      return true;
    } catch (e) {
      console.error("Invalid JWT:", e);
      alert("Invalid session. Please log in again.");
      window.location.href = "login.html";
      return false;
    }
  }

  // Validate access on page load
  if (!validateUserAccess()) {
    return;
  }

  const userId = getUserIdFromToken();

  // Day selection functionality
  dayElements.forEach(day => {
    day.addEventListener("click", () => {
      day.classList.toggle("selected");
    });
  });

  // Populate Elderly Dropdown
  const dropdown = document.getElementById("elderlyDropdown");
  if (dropdown) {
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

  // Populate Medication Dropdown
  const medDropdown = document.getElementById("medName");
  if (medDropdown) {
    fetch("/api/medications/all")
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.json();
      })
      .then(meds => {
        if (!Array.isArray(meds)) throw new Error("Invalid medication list format");
        
        // Clear existing options except the first one
        medDropdown.innerHTML = '<option disabled selected value="">Choose Medication</option>';
        
        meds.forEach(med => {
          const option = document.createElement("option");
          option.value = med.medId;
          option.textContent = med.medName;
          medDropdown.appendChild(option);
        });
      })
      .catch(err => {
        console.error("Error loading medications:", err);
        medDropdown.innerHTML = '<option disabled selected value="">Error loading medications</option>';
      });
  }

  // Select/Deselect All Days functionality
  const selectAllBtn = document.getElementById("selectAllDays");
  const deselectAllBtn = document.getElementById("deselectAllDays");

  if (selectAllBtn) {
    selectAllBtn.addEventListener("click", () => {
      dayElements.forEach(day => day.classList.add("selected"));
    });
  }

  if (deselectAllBtn) {
    deselectAllBtn.addEventListener("click", () => {
      dayElements.forEach(day => day.classList.remove("selected"));
    });
  }

  // Time Select Logic
  const section = document.getElementById("timeSelectSection");
  const addBtn = document.getElementById("addTimeSelect");

  function createTimeSelectRow() {
    const row = document.createElement("div");
    row.className = "time-select-wrapper";
    row.style.display = "flex";
    row.style.gap = "10px";
    row.style.marginBottom = "10px";
    row.style.alignItems = "center";

    // Hour dropdown
    const hour = document.createElement("select");
    hour.className = "hour-select";
    hour.style.padding = "5px";
    
    for (let i = 1; i <= 12; i++) {
      const opt = document.createElement("option");
      const value = i.toString().padStart(2, '0');
      opt.value = value;
      opt.textContent = value;
      hour.appendChild(opt);
    }

    // Minute dropdown
    const minute = document.createElement("select");
    minute.className = "minute-select";
    minute.style.padding = "5px";
    
    for (let i = 0; i < 60; i += 5) {
      const val = i.toString().padStart(2, '0');
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = val;
      minute.appendChild(opt);
    }

    // AM/PM dropdown
    const ampm = document.createElement("select");
    ampm.className = "ampm-select";
    ampm.style.padding = "5px";
    
    ["AM", "PM"].forEach(val => {
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = val;
      ampm.appendChild(opt);
    });

    // Remove button (only show if more than one time row)
    const removeBtn = document.createElement("button");
    removeBtn.type = "button";
    removeBtn.textContent = "Remove";
    removeBtn.className = "btn cancel";
    removeBtn.style.padding = "5px 10px";
    removeBtn.style.fontSize = "12px";
    
    removeBtn.addEventListener("click", () => {
      if (section.children.length > 1) {
        row.remove();
      }
    });

    row.appendChild(hour);
    row.appendChild(minute);
    row.appendChild(ampm);
    row.appendChild(removeBtn);
    section.appendChild(row);

    // Hide remove button if only one row
    updateRemoveButtons();
  }

  function updateRemoveButtons() {
    const removeButtons = section.querySelectorAll("button");
    removeButtons.forEach(btn => {
      btn.style.display = section.children.length > 1 ? "inline-block" : "none";
    });
  }

  if (addBtn) {
    addBtn.addEventListener("click", () => {
      createTimeSelectRow();
    });
  }

  // Create initial time row
  createTimeSelectRow();

  // Enhanced form submission with proper error handling
  if (confirmBtn) {
    confirmBtn.addEventListener("click", async () => {
      // Validate token again before submission
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Session expired. Please log in again.");
        window.location.href = "login.html";
        return;
      }

      // Get form data
      const elderlyID = document.getElementById("elderlyDropdown").value;
      const selectedMedId = document.getElementById("medName").value;
      const dosage = document.getElementById("dosage").value.trim();
      const refillThreshold = document.getElementById("refillThreshold").value.trim();
      const supplyQuantity = document.getElementById("supplyQuantity").value.trim();
      const selectedDays = Array.from(document.querySelectorAll(".day.selected")).map(day => day.id.trim());

      // Get all medication times
      const timeRows = document.querySelectorAll(".time-select-wrapper");
      const medicationTimes = Array.from(timeRows).map(row => {
        const hour = row.querySelector(".hour-select").value;
        const minute = row.querySelector(".minute-select").value;
        const ampm = row.querySelector(".ampm-select").value;
        return `${hour}:${minute} ${ampm}`;
      });

      // Enhanced validation
      const errors = [];
      
      if (!elderlyID) errors.push("Please select an elderly user");
      if (!selectedMedId) errors.push("Please select a medication");
      if (!dosage) errors.push("Please enter dosage");
      if (!refillThreshold) errors.push("Please enter refill threshold");
      if (!supplyQuantity) errors.push("Please enter supply quantity");
      if (selectedDays.length === 0) errors.push("Please select at least one day");
      if (medicationTimes.length === 0) errors.push("Please add at least one medication time");
      
      // Validate numeric fields
      const refillNum = parseInt(refillThreshold);
      const supplyNum = parseInt(supplyQuantity);
      
      if (isNaN(refillNum) || refillNum < 1) errors.push("Refill threshold must be a positive number");
      if (isNaN(supplyNum) || supplyNum < 1) errors.push("Supply quantity must be a positive number");
      if (refillNum >= supplyNum) errors.push("Refill threshold must be less than supply quantity");

      // Validate time format
      for (let time of medicationTimes) {
        const timePattern = /^([0-1]?[0-9]):([0-5][0-9]) (AM|PM)$/;
        if (!timePattern.test(time)) {
          errors.push(`Invalid time format: ${time}`);
        }
      }

      // Validate days format
      const validDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      for (let day of selectedDays) {
        if (!validDays.includes(day)) {
          errors.push(`Invalid day: ${day}`);
        }
      }

      if (errors.length > 0) {
        alert("Please fix the following errors:\n" + errors.join("\n"));
        return;
      }

      const medicationData = {
        user_id: parseInt(elderlyID),
        medId: parseInt(selectedMedId),
        dosage: dosage,
        supplyQuantity: parseInt(supplyQuantity),
        refillThreshold: parseInt(refillThreshold),
        medication_time: medicationTimes.join(","), // Convert array to comma-separated string
        day_of_week: selectedDays.join(",")         // Convert array to comma-separated string
      };

      // Disable button during submission
      confirmBtn.disabled = true;
      confirmBtn.textContent = "Adding...";

      try {
        console.log("Sending medication data:", medicationData);

        const response = await fetch("/api/medications", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` // Add Authorization header
          },
          body: JSON.stringify(medicationData)
        });

        const data = await response.json();
        
        if (response.ok) {
          alert("Medication added successfully!");
          window.location.href = "caregiverChooseElderly.html";
        } else {
          // Better error handling
          console.error("Server error:", data);
          let errorMessage = "Failed to add medication.";
          
          if (data.details) {
            if (Array.isArray(data.details)) {
              errorMessage += "\n" + data.details.join("\n");
            } else {
              errorMessage += "\n" + data.details;
            }
          } else if (data.error) {
            errorMessage += "\n" + data.error;
          }
          
          // Handle specific error cases
          if (response.status === 401) {
            errorMessage = "Authentication failed. Please log in again.";
            setTimeout(() => {
              window.location.href = "login.html";
            }, 2000);
          } else if (response.status === 403) {
            errorMessage = "Access denied. You don't have permission to perform this action.";
            setTimeout(() => {
              window.location.href = "login.html";
            }, 2000);
          } else if (response.status === 404) {
            errorMessage = "User or medication not found. Please check your selections.";
          } else if (response.status === 409) {
            errorMessage = "This medication is already assigned to the selected user.";
          }
          
          alert(errorMessage);
        }

      } catch (err) {
        console.error("Request failed:", err);
        alert("Network error. Please check your connection and try again.");
      } finally {
        // Re-enable button
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Confirm";
      }
    });
  }
});
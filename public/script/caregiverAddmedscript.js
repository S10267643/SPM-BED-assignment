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

  const userId = getUserIdFromToken();
  if (!userId) {
    alert("You must be logged in to access this page.");
    window.location.href = "login.html";
  }

  dayElements.forEach(day => {
    day.addEventListener("click", () => {
      day.classList.toggle("selected");
    });
  });

  const dropdown = document.getElementById("elderlyDropdown");

  if (dropdown) {
    fetch("/users?role=elderly")
      .then(response => {
        if (!response.ok) throw new Error("Failed to fetch users");
        return response.json();
      })
      .then(users => {
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
        const errorOption = document.createElement("option");
        errorOption.textContent = "Error loading users";
        errorOption.disabled = true;
        dropdown.appendChild(errorOption);
      });
  }





  document.getElementById("selectAllDays").addEventListener("click", () => {
    dayElements.forEach(day => day.classList.add("selected"));
  });

  document.getElementById("deselectAllDays").addEventListener("click", () => {
    dayElements.forEach(day => day.classList.remove("selected"));
  });

  const section = document.getElementById("timeSelectSection");
  const addBtn = document.getElementById("addTimeSelect");

  function createTimeSelectRow() {
    const row = document.createElement("div");
    row.className = "time-select-wrapper";

    const hour = document.createElement("select");
    hour.className = "hour-select";
    for (let i = 1; i <= 12; i++) {
      const opt = document.createElement("option");
      const value = i.toString().padStart(2, '0');
      opt.value = value;
      opt.textContent = value;
      hour.appendChild(opt);
    }

    const minute = document.createElement("select");
    minute.className = "minute-select";
    for (let i = 0; i < 60; i += 5) {
      const val = i.toString().padStart(2, '0');
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = val;
      minute.appendChild(opt);
    }

    const ampm = document.createElement("select");
    ampm.className = "ampm-select";
    ["AM", "PM"].forEach(val => {
      const opt = document.createElement("option");
      opt.value = val;
      opt.textContent = val;
      ampm.appendChild(opt);
    });

    row.appendChild(hour);
    row.appendChild(minute);
    row.appendChild(ampm);
    section.appendChild(row);
  }

  addBtn.addEventListener("click", createTimeSelectRow);
  createTimeSelectRow();

  confirmBtn.addEventListener("click", async () => {
    const medName = document.getElementById("medName").value.trim();
    const dosage = document.getElementById("dosage").value.trim();
    const refillThreshold = document.getElementById("refillThreshold").value.trim();
    const supplyQuantity = document.getElementById("supplyQuantity").value.trim();
    const selectedDays = Array.from(document.querySelectorAll(".day.selected")).map(day => day.id.trim());

    const timeRows = document.querySelectorAll(".time-select-wrapper");
    const medicationTimes = Array.from(timeRows).map(row => {
      const hour = row.querySelector(".hour-select").value;
      const minute = row.querySelector(".minute-select").value;
      const ampm = row.querySelector(".ampm-select").value;
      return `${hour}:${minute} ${ampm}`;
    });

    if (!medName || !dosage || selectedDays.length === 0 || medicationTimes.length === 0) {
      alert("Please fill in all fields.");
      return;
    }

    const medicationData = {
      user_id: elderlyID,
      refillThreshold,
      supplyQuantity, 
      medication_name: medName,
      dosage,
      medication_time: medicationTimes,
      day_of_week: selectedDays
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/medications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(medicationData)
      });

      const data = await response.json();
      if (response.ok) {
        alert("Added medication.");
        window.location.href = "caregiverHomeScreen.html";
      } else {
        alert("Error: " + data.error);
      }

    } catch (err) {
      console.error("Request failed:", err);
      alert("Something went wrong. Please try again.");
    }
  });
});

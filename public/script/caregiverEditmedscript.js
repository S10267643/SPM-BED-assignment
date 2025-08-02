document.addEventListener("DOMContentLoaded", async () => {
  const dayElements = document.querySelectorAll(".day");
  const confirmBtn = document.querySelector(".btn.confirm");
  const section = document.getElementById("timeSelectSection");
  const addBtn = document.getElementById("addTimeSelect");

  const urlParams = new URLSearchParams(window.location.search);
  const supplyId = urlParams.get("id");

  const medDropdown = document.getElementById("medName");
  const dosageInput = document.getElementById("dosage");
  const refillInput = document.getElementById("refillThreshold");
  const supplyInput = document.getElementById("supplyQuantity");
  const elderlyDropdown = document.getElementById("elderlyDropdown");

  // ---------- Helpers ----------

  function parseTimeStringToParts(timeStr) {
    const [time, ampm] = timeStr.trim().split(" ");
    const [hour, minute] = time.split(":");
    return { hour, minute, ampm };
  }

  function createTimeRow(hour = "08", minute = "00", ampm = "AM") {
  // Outer container for each time row
  const rowWrapper = document.createElement("div");
  rowWrapper.className = "time-select-row";
  rowWrapper.style.display = "flex";
  rowWrapper.style.justifyContent = "space-between";
  rowWrapper.style.alignItems = "center";
  rowWrapper.style.marginBottom = "10px";
  rowWrapper.style.width = "100%";
  rowWrapper.style.gap = "20px";

  // Inner container for time dropdowns
  const timeContainer = document.createElement("div");
  timeContainer.className = "time-select-wrapper";
  timeContainer.style.display = "flex";
  timeContainer.style.flex = "1";
  timeContainer.style.gap = "10px";

  // Hour dropdown
  const hourSelect = document.createElement("select");
  hourSelect.className = "hour-select";
  hourSelect.style.width = "80px";
  hourSelect.style.textAlign = "center";
  hourSelect.style.textAlignLast = "center";
  for (let i = 1; i <= 12; i++) {
    const opt = document.createElement("option");
    const val = i.toString().padStart(2, "0");
    opt.value = val;
    opt.textContent = val;
    if (val === hour) opt.selected = true;
    hourSelect.appendChild(opt);
  }

  // Minute dropdown
  const minuteSelect = document.createElement("select");
  minuteSelect.className = "minute-select";
  minuteSelect.style.width = "80px";
  minuteSelect.style.textAlign = "center";
  minuteSelect.style.textAlignLast = "center";
  for (let i = 0; i < 60; i += 5) {
    const val = i.toString().padStart(2, "0");
    const opt = document.createElement("option");
    opt.value = val;
    opt.textContent = val;
    if (val === minute) opt.selected = true;
    minuteSelect.appendChild(opt);
  }

  // AM/PM dropdown
  const ampmSelect = document.createElement("select");
  ampmSelect.className = "ampm-select";
  ampmSelect.style.width = "80px";
  ampmSelect.style.textAlign = "center";
  ampmSelect.style.textAlignLast = "center";
  ["AM", "PM"].forEach(ap => {
    const opt = document.createElement("option");
    opt.value = ap;
    opt.textContent = ap;
    if (ap === ampm) opt.selected = true;
    ampmSelect.appendChild(opt);
  });

  // Remove button beside time section
  const removeBtn = document.createElement("button");
  removeBtn.type = "button";
  removeBtn.textContent = "Remove";
  removeBtn.className = "btn cancel";
  removeBtn.style.padding = "5px 5px";
  removeBtn.style.fontSize = "12px";
  removeBtn.style.width = "80px";
  removeBtn.style.height = "30px";




  removeBtn.addEventListener("click", () => {
    if (section.children.length > 1) {
      rowWrapper.remove();
    }
  });

  // Assemble inner time dropdowns
  timeContainer.appendChild(hourSelect);
  timeContainer.appendChild(minuteSelect);
  timeContainer.appendChild(ampmSelect);

  // Append time + button to row
  rowWrapper.appendChild(timeContainer);
  rowWrapper.appendChild(removeBtn);

  // Append entire row to section
  section.appendChild(rowWrapper);
}


  function getSelectedDays() {
    return Array.from(document.querySelectorAll(".day.selected")).map(d => d.id);
  }

  function setSelectedDays(dayList) {
    const validDays = dayList.map(d => d.trim());
    dayElements.forEach(day => {
      if (validDays.includes(day.id)) day.classList.add("selected");
    });
  }

  function parseMedicationTimes(timesString) {
    return timesString.split(",").map(t => parseTimeStringToParts(t.trim()));
  }

  // ---------- Populate Dropdowns ----------

  async function loadDropdowns() {
    try {
      const userRes = await fetch("/users?role=elderly");
      const users = await userRes.json();
      elderlyDropdown.innerHTML = '<option disabled value="">Choose Elderly</option>';
      users.forEach(u => {
        const opt = document.createElement("option");
        opt.value = u.userId;
        opt.textContent = u.name;
        elderlyDropdown.appendChild(opt);
      });

      const medRes = await fetch("/api/medications/all");
      const meds = await medRes.json();
      medDropdown.innerHTML = '<option disabled value="">Choose Medication</option>';
      meds.forEach(med => {
        const opt = document.createElement("option");
        opt.value = med.medId;
        opt.textContent = med.medName;
        medDropdown.appendChild(opt);
      });
    } catch (err) {
      console.error("Failed to load dropdowns:", err);
    }
  }

  // ---------- Load Existing Data ----------

  async function loadMedication() {
    try {
      const res = await fetch(`/api/medications/${supplyId}`);
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Load failed");

      elderlyDropdown.value = data.userId;
      medDropdown.value = data.medId;
      dosageInput.value = data.dosage;
      refillInput.value = data.refillThreshold;
      supplyInput.value = data.supplyQuantity;

      // Days
      const dayArray = data.medDayOfWeek.split(",");
      setSelectedDays(dayArray);

      // Times
      section.innerHTML = "";
      const timeArray = parseMedicationTimes(data.medTime);
      timeArray.forEach(t => createTimeRow(t.hour, t.minute, t.ampm));
    } catch (err) {
      console.error("Error loading medication:", err);
      alert("Failed to load medication data.");
      window.location.href = "caregiverDeletemedicine.html";
    }
  }

  // ---------- Event Bindings ----------

  addBtn.addEventListener("click", () => {
    createTimeRow();
  });

  dayElements.forEach(day => {
    day.addEventListener("click", () => {
      day.classList.toggle("selected");
    });
  });

  confirmBtn.addEventListener("click", async () => {
    const userId = elderlyDropdown.value;
    const medId = medDropdown.value;
    const dosage = dosageInput.value.trim();
    const refillThreshold = parseInt(refillInput.value.trim());
    const supplyQuantity = parseInt(supplyInput.value.trim());
    const day_of_week = getSelectedDays().join(",");

    const timeRows = section.querySelectorAll(".time-select-wrapper");
    const medication_time = Array.from(timeRows).map(row => {
      const h = row.querySelector(".hour-select").value;
      const m = row.querySelector(".minute-select").value;
      const ampm = row.querySelector(".ampm-select").value;
      return `${h}:${m} ${ampm}`;
    }).join(",");

    const errors = [];
    if (!userId) errors.push("Select an elderly user.");
    if (!medId) errors.push("Select a medication.");
    if (!dosage) errors.push("Enter dosage.");
    if (isNaN(refillThreshold)) errors.push("Enter valid refill threshold.");
    if (isNaN(supplyQuantity)) errors.push("Enter valid supply quantity.");
    if (refillThreshold >= supplyQuantity) errors.push("Refill threshold must be less than supply quantity.");
    if (!day_of_week) errors.push("Select at least one day.");
    if (!medication_time) errors.push("Add at least one medication time.");

    if (errors.length > 0) {
      alert("Fix the following:\n" + errors.join("\n"));
      return;
    }

    try {
      const response = await fetch(`/api/medications/${supplyId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medId: parseInt(medId),
          dosage,
          refillThreshold,
          supplyQuantity,
          medication_time,
          day_of_week
        })
      });

      const result = await response.json();
      if (response.ok) {
        alert("Medication updated!");
        window.location.href = "caregiverDeletemedicine.html";
      } else {
        alert("Update failed: " + (result.error || "Unknown error"));
      }
    } catch (err) {
      console.error("Update failed:", err);
      alert("Could not update medication.");
    }
  });

  // ---------- Init ----------
  await loadDropdowns();
  await loadMedication();
});

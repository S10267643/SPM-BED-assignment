document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("chosenuserID");

  if (!userId) {
    console.error("No chosenuserID found in localStorage");
    return;
  }

  const list = document.querySelector(".medication-list");
  list.innerHTML = "";

  fetch(`/api/medications/user/${userId}`)
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch medications");
      return res.json();
    })
    .then(medications => {
      if (!Array.isArray(medications) || medications.length === 0) {
        list.innerHTML = "<div class='medication-item'>No medications found.</div>";
        return;
      }

      medications.forEach(med => {
        const item = document.createElement("div");
        item.className = "medication-item";

        const content = document.createElement("div");
        content.className = "medication-content";

        const name = document.createElement("div");
        name.className = "medication-name";
        name.textContent = med.medication_name;

        const time = document.createElement("div");
        time.className = "medication-time";
        time.textContent = `Time: ${formatTime24to12(med.medication_time)}`;

        const dosage = document.createElement("div");
        dosage.className = "medication-time";
        dosage.textContent = `Dosage: ${med.dosage}`;

        const days = document.createElement("div");
        days.className = "medication-time";
        days.textContent = `Days: ${formatDays(med.medDayOfWeek)}`;

        content.appendChild(name);
        content.appendChild(time);
        content.appendChild(dosage);
        content.appendChild(days);

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "medication-checkbox";

        const saved = localStorage.getItem(`medication_${med.medication_name}`);
        if (saved === "true") checkbox.checked = true;

        updateMedicationStyle(checkbox);

        checkbox.addEventListener("change", function () {
          saveCheckboxState(this);
          updateMedicationStyle(this);
        });

        item.appendChild(content);
        item.appendChild(checkbox);
        list.appendChild(item);
      });
    })
    .catch(err => {
      console.error("Error loading medications:", err);
      list.innerHTML = "<div class='medication-item'>Failed to load medications.</div>";
    });

  function formatTime24to12(timeStr) {
    const [hour, minute] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minute} ${ampm}`;
  }

  function formatDays(dayString) {
    const dayMap = {
      "1": "Mon", "2": "Tue", "3": "Wed",
      "4": "Thu", "5": "Fri", "6": "Sat", "7": "Sun"
    };
    return dayString
      .split(',')
      .map(d => dayMap[d.trim()])
      .filter(Boolean)
      .join(', ');
  }

  function saveCheckboxState(checkbox) {
    const name = checkbox.parentElement.querySelector(".medication-name").textContent;
    localStorage.setItem(`medication_${name}`, checkbox.checked);
  }

  function updateMedicationStyle(checkbox) {
    if (checkbox.checked) {
      checkbox.classList.add("checked");
    } else {
      checkbox.classList.remove("checked");
    }
  }
});

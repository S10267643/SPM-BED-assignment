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

        // Medication Name
        const name = document.createElement("div");
        name.className = "medication-name";
        name.textContent = med.medication_name;
        content.appendChild(name);

        // Time (from CSV string)
        const time = document.createElement("div");
        time.className = "medication-time";
        const timesArray = med.medication_time.split(',').map(t => t.trim());
        const formattedTimes = timesArray.map(formatTime24to12).join(', ');
        time.textContent = `Time: ${formattedTimes}`;
        content.appendChild(time);

        // Dosages
        const dosage = document.createElement("div");
        dosage.className = "medication-time";
        dosage.textContent = `Dosage: ${med.dosage}`;
        content.appendChild(dosage);
        
        // Days (CSV string like "Mon,Tue")
        const days = document.createElement("div");
        days.className = "medication-time";
        days.textContent = `Days: ${formatDays(med.medDayOfWeek)}`;
        content.appendChild(days);

        item.appendChild(content);
        list.appendChild(item);
      });
    })
    .catch(err => {
      console.error("Error loading medications:", err);
      list.innerHTML = "<div class='medication-item'>Failed to load medications.</div>";
    });

  // Convert 24-hour time to AM/PM unless already in AM/PM format
  function formatTime24to12(timeStr) {
    if (!timeStr || /AM|PM/i.test(timeStr)) return timeStr;
    const [hour, minute] = timeStr.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h % 12 || 12;
    return `${h12}:${minute} ${ampm}`;
  }

  // Format CSV days like "mon,tue" → "Mon, Tue"
  function formatDays(dayString) {
    if (!dayString || typeof dayString !== "string") return "";
    return dayString
      .split(',')
      .map(d => d.trim().charAt(0).toUpperCase() + d.trim().slice(1).toLowerCase())
      .join(', ');
  }
});
  
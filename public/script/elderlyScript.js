const publicVapidKey = "BA4Q6sKGB47yv8RbAPA4IcpElBk-HmxZo-PyNrUHzZWAhsyRkAf-LUeVgJGdBGs6K_7NQUswdlnQE2hzc-IxSjs";

// ---------- Calendar & Date Functions ----------
function formatDate(date) {
  const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

function getCurrentWeek(date) {
  const currentDay = date.getDate();
  const currentWeekDay = date.getDay(); // 0 (Sun) to 6 (Sat)
  const weekStart = new Date(date);
  weekStart.setDate(currentDay - currentWeekDay + (currentWeekDay === 0 ? -6 : 1));

  const weekDates = [];
  for (let i = 0; i < 7; i++) {
    const day = new Date(weekStart);
    day.setDate(weekStart.getDate() + i);
    weekDates.push(day);
  }
  return weekDates;
}

function updateCalendar(date) {
  const weekDates = getCurrentWeek(date);
  document.getElementById('currentDate').textContent = formatDate(date);

  const calendarDays = document.querySelectorAll('.calendar-day:not(:nth-child(-n+7))');
  weekDates.forEach((day, index) => {
    calendarDays[index].textContent = day.getDate();
    if (
      day.getDate() === date.getDate() &&
      day.getMonth() === date.getMonth() &&
      day.getFullYear() === date.getFullYear()
    ) {
      calendarDays[index].classList.add('current-day');
    } else {
      calendarDays[index].classList.remove('current-day');
    }

    if (day.getMonth() !== date.getMonth()) {
      calendarDays[index].classList.add('other-month');
    } else {
      calendarDays[index].classList.remove('other-month');
    }
  });
}

// ---------- Checkbox Style ----------
function updateMedicationStyle(checkbox) {
  const item = checkbox.closest('.medication-item');
  const content = checkbox.previousElementSibling;
  if (!content || !item) return;

  const name = content.querySelector('.medication-name');
  const time = content.querySelector('.medication-time');
  if (!name || !time) return;

  const isChecked = checkbox.checked;
  item.style.backgroundColor = isChecked ? '#00ADB5' : '#f9f9f9';
  name.style.color = isChecked ? '#ffffff' : '#000000';
  time.style.color = isChecked ? '#ffffff' : '#00ADB5';
}

function saveCheckboxState(checkbox) {
  const medName = checkbox.closest(".medication-item").getAttribute("data-name");
  const time = checkbox.closest(".medication-item").getAttribute("data-time");
  const key = `medication_${medName}_${time}`;
  localStorage.setItem(key, checkbox.checked);
}

function loadCheckboxStates() {
  document.querySelectorAll('.medication-checkbox').forEach(checkbox => {
    const item = checkbox.closest(".medication-item");
    const medName = item.getAttribute("data-name");
    const time = item.getAttribute("data-time");
    const key = `medication_${medName}_${time}`;
    const isChecked = localStorage.getItem(key) === "true";
    checkbox.checked = isChecked;
    if (isChecked) updateMedicationStyle(checkbox);
  });
}

// ---------- DOM Ready ----------
document.addEventListener("DOMContentLoaded", function () {

  const userName = localStorage.getItem("userName");
  let preferredLanguage = localStorage.getItem("preferredLanguage") || 
                         localStorage.getItem("language") || 
                         'English'; // Default to English

  // Normalize language value (handle case where backend uses 'Chinese' but frontend expects 'zh')
  if (preferredLanguage === 'Chinese' || preferredLanguage === 'zh') {
    preferredLanguage = 'Chinese';
  }

  if (userName) {
    const welcomeMessage = document.getElementById("welcomeMessage");
    
    if (preferredLanguage === 'Chinese') {
      welcomeMessage.textContent = `你好, ${userName}!`;
    } else {
      welcomeMessage.textContent = `Hello, ${userName}!`;
    }
  }

  const role = localStorage.getItem("role");
  const addPillsNav = document.getElementById("addPillsNav");
  if (role === "Elderly" && addPillsNav) {
    addPillsNav.style.display = "none";
  }

  const today = new Date();
  updateCalendar(today);
  const todayStr = today.toLocaleDateString('en-US', { weekday: 'short' });

  const token = localStorage.getItem("token");
  const userId = localStorage.getItem("userId");

  const list = document.querySelector(".medication-list");
  list.innerHTML = "";

  if (!userId || !token) {
    console.error("Missing userId or token in localStorage");
    list.innerHTML = "<div class='medication-item'>Error: Not logged in.</div>";
    return;
  }

  fetch(`/api/medications/user/${userId}`, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to fetch medications");
      return res.json();
    })
    .then(medications => {
      if (!Array.isArray(medications) || medications.length === 0) {
        list.innerHTML = "<div class='medication-item'>No medications found.</div>";
        return;
      }

      let entries = [];

      medications.forEach(med => {
        const times = med.medication_time.split(',').map(t => t.trim());
        const days = med.medDayOfWeek.split(',').map(d => d.trim());

        if (!days.includes(todayStr)) return;

        times.forEach(time => {
          entries.push({
            medId: med.medId,
            name: med.medication_name,
            time,
            dosage: med.dosage
          });
        });
      });

      if (entries.length === 0) {
        list.innerHTML = "<div class='medication-item'>No medications for today.</div>";
        return;
      }

      entries.sort((a, b) => {
        const parse = t => {
          const [h, m, ampm] = t.match(/(\d+):(\d+) (AM|PM)/).slice(1);
          let hour = parseInt(h, 10);
          const minute = parseInt(m, 10);
          if (ampm === 'PM' && hour !== 12) hour += 12;
          if (ampm === 'AM' && hour === 12) hour = 0;
          return hour * 60 + minute;
        };
        return parse(a.time) - parse(b.time);
      });

      entries.forEach(entry => {
        const item = document.createElement("div");
        item.className = "medication-item";
        item.setAttribute("data-medid", entry.medId);
        item.setAttribute("data-name", entry.name);
        item.setAttribute("data-time", entry.time);

        const content = document.createElement("div");
        content.className = "medication-content";

        const name = document.createElement("div");
        name.className = "medication-name";
        name.textContent = entry.name;
        content.appendChild(name);

        const timeDiv = document.createElement("div");
        timeDiv.className = "medication-time";
        timeDiv.textContent = `Time: ${entry.time}`;
        content.appendChild(timeDiv);

        const dosage = document.createElement("div");
        dosage.className = "medication-time";
        dosage.textContent = `Dosage: ${entry.dosage}`;
        content.appendChild(dosage);

        const checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.className = "medication-checkbox";

        const key = `medication_${entry.name}_${entry.time}`;
        const saved = localStorage.getItem(key);
        if (saved === "true") checkbox.checked = true;

        checkbox.addEventListener("change", function () {
          const medId = item.getAttribute("data-medid");
          const medName = item.getAttribute("data-name");
          const medTime = item.getAttribute("data-time");
          const taken = this.checked;

          console.log({
            userId,
            medId,
            medName,
            time: medTime,
            taken,
            takenAt: new Date().toISOString()
          });

          localStorage.setItem(key, taken);
          updateMedicationStyle(this);
        });

        updateMedicationStyle(checkbox);

        item.appendChild(content);
        item.appendChild(checkbox);
        list.appendChild(item);
      });

      loadCheckboxStates();
    })
    .catch(err => {
      console.error("Error loading medications:", err);
      list.innerHTML = "<div class='medication-item'>Failed to load medications.</div>";
    });

  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function () {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');
    });
  });
});

// ---------- Push Notifications ----------
if ("serviceWorker" in navigator) {
  send().catch(err => console.error(err));
}

async function send() {
  const register = await navigator.serviceWorker.register("./sw.js", {
    scope: "/",
  });

  const subscription = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicVapidKey),
  });

  await fetch("http://localhost:3000/subscribe", {
    method: "POST",
    body: JSON.stringify(subscription),
    headers: {
      "content-type": "application/json",
    },
  });
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}



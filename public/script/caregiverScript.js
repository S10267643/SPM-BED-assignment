document.addEventListener("DOMContentLoaded", () => {
  const userId = localStorage.getItem("chosenuserID");

  if (!userId) {
    console.error("No chosenuserID found in localStorage");
    return;
  }

  


  // Display current day and date
  const currentDateEl = document.getElementById("currentDate");
  if (currentDateEl) {
    const today = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    currentDateEl.textContent = today.toLocaleDateString('en-SG', options);
  }

  function formatDate(date) {
    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Function to get the week containing the current date
function getCurrentWeek(date) {
    const currentDay = date.getDate();
    const currentWeekDay = date.getDay(); // 0 (Sunday) to 6 (Saturday)
    const weekStart = new Date(date);
    weekStart.setDate(currentDay - currentWeekDay + (currentWeekDay === 0 ? -6 : 1)); // Start on Monday
    
    const weekDates = [];
    for (let i = 0; i < 7; i++) {
        const day = new Date(weekStart);
        day.setDate(weekStart.getDate() + i);
        weekDates.push(day);
    }
    
    return weekDates;
}

// Function to update the calendar
function updateCalendar(date) {
    const weekDates = getCurrentWeek(date);
    
    // Update current date display
    document.getElementById('currentDate').textContent = formatDate(date);
    
    // Update calendar days
    const calendarDays = document.querySelectorAll('.calendar-day:not(:nth-child(-n+7))');
    
    weekDates.forEach((day, index) => {
        calendarDays[index].textContent = day.getDate();
        
        // Highlight current day
        if (day.getDate() === date.getDate() && 
            day.getMonth() === date.getMonth() && 
            day.getFullYear() === date.getFullYear()) {
            calendarDays[index].classList.add('current-day');
        } else {
            calendarDays[index].classList.remove('current-day');
        }
        
        // Gray out days from previous or next month
        if (day.getMonth() !== date.getMonth()) {
            calendarDays[index].classList.add('other-month');
        } else {
            calendarDays[index].classList.remove('other-month');
        }
    });
}

// Initialize with current date
const today = new Date();
// Call the calendar setup
updateCalendar(today);



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
        const NumToDays = {
          0: "Sun",
          1: "Mon",
          2: "Tue",
          3: "Wed", 
          4: "Thu",
          5: "Fri",
          6: "Sat"
        };
        const daysArray = med.medDayOfWeek.split(',').map(d => d.trim());
        days.textContent = `Days: ${daysArray.map(d => NumToDays[d]).join(', ')}`;
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


  const welcomeMessage = document.getElementById("welcomeMessage");
const viewingUserLabel = document.getElementById("viewingUserLabel");



// Show Viewing User label if userId is set
if (userId && viewingUserLabel) {
  fetch(`/users/${userId}`)
    .then(res => {
      if (!res.ok) return null;
      return res.json();
    })
    .then(viewedUser => {
      if (viewedUser && viewedUser.name) {
        viewingUserLabel.textContent = 
          preferredLanguage === 'Chinese'
            ? `正在查看: ${viewedUser.name}`
            : `Viewing: ${viewedUser.name}`;
      }
    });

}


});
  
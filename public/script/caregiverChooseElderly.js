document.addEventListener("DOMContentLoaded", () => {
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







  // 2. Fetch elderly users and populate dropdown
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
});


document.addEventListener("DOMContentLoaded", () => {
  const dropdown = document.getElementById("elderlyDropdown");
  const button = document.querySelector(".view-medication-btn");

  if (dropdown && button) {
    button.addEventListener("click", () => {
      const selectedValue = dropdown.value;

      if (!selectedValue) {
        alert("Please select an elderly user before continuing.");
        return;
      }

      //Save to localStorage
      localStorage.setItem("chosenuserID", selectedValue);
      console.log("Saved chosenuserID:", selectedValue);
      // Redirect to caregiverHomeScreen.html
      window.location.href = "caregiverHomeScreen.html";

    });
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

});




// Function to format the date
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

// Utility function to apply visual changes for checkbox state
function updateMedicationStyle(checkbox) {
    const item = checkbox.closest('.medication-item');
    const content = checkbox.previousElementSibling;
    if (!content || !item) return;

    const name = content.querySelector('.medication-name');
    const time = content.querySelector('.medication-time');
    if (!name || !time) return;

    const isChecked = checkbox.checked;

    // Background and text colors on the box and text elements
    item.style.backgroundColor = isChecked ? '#00ADB5' : '#f9f9f9';
    name.style.color = isChecked ? '#ffffff' : '#000000';
    time.style.color = isChecked ? '#ffffff' : '#00ADB5'; // keep time blue or white based on your design
}



// Enables visual state change on checkbox toggle
document.querySelectorAll('.medication-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        updateMedicationStyle(this);
    });
});

// Save checkbox state
function saveCheckboxState(checkbox) {
    const medicationName = checkbox.closest('.medication-item').querySelector('.medication-name').textContent;
    localStorage.setItem(`medication_${medicationName}`, checkbox.checked);
}

// Load checkbox state on page load
function loadCheckboxStates() {
    document.querySelectorAll('.medication-checkbox').forEach(checkbox => {
        const medicationName = checkbox.closest('.medication-item').querySelector('.medication-name').textContent;
        const isChecked = localStorage.getItem(`medication_${medicationName}`) === 'true';
        checkbox.checked = isChecked;

        // Update visual state if needed
        if (isChecked) {
            updateMedicationStyle(checkbox);
        }
    });
}

document.addEventListener("DOMContentLoaded", function () {
  // Hide Add Pills nav for Elderly
    const role = localStorage.getItem("role"); // stored at login
    console.log("Role:", role);
    const addPillsNav = document.getElementById("addPillsNav");
    if (role === "Elderly" && addPillsNav) {
    addPillsNav.style.display = "none";
  }

  // Load checkbox states
  loadCheckboxStates();

  // Add event listeners to checkboxes
  document.querySelectorAll('.medication-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
      saveCheckboxState(this);
      updateMedicationStyle(this);
    });
  });

  // Navigation tab highlight
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      this.classList.add('active');
    });
  });
});

// Navigation functionality
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

// Navigation functionality
document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});

document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function() {
        document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
        this.classList.add('active');
    });
});


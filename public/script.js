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
    const calendarDays = document.querySelectorAll('.calendar-day:not(:nth-child(-n+7)');
    
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
updateCalendar(today);

// Enables visual state change on checkbox toggle
document.querySelectorAll('.medication-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const content = this.previousElementSibling;
        content.querySelector('.medication-name').style.opacity = this.checked ? 0.5 : 1;
        content.querySelector('.medication-time').style.opacity = this.checked ? 0.5 : 1;
        content.querySelector('.medication-name').style.textDecoration = this.checked ? 'line-through' : 'none';
        content.querySelector('.medication-time').style.textDecoration = this.checked ? 'line-through' : 'none';
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
            const content = checkbox.previousElementSibling;
            content.querySelector('.medication-name').style.opacity = 0.5;
            content.querySelector('.medication-time').style.opacity = 0.5;
            content.querySelector('.medication-name').style.textDecoration = 'line-through';
            content.querySelector('.medication-time').style.textDecoration = 'line-through';
        }
    });
}

// Add event listeners
document.addEventListener('DOMContentLoaded', () => {
    loadCheckboxStates();
    
    document.querySelectorAll('.medication-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            saveCheckboxState(this);
            
            // Update visual state immediately
            const content = this.previousElementSibling;
            content.querySelector('.medication-name').style.opacity = this.checked ? 0.5 : 1;
            content.querySelector('.medication-time').style.opacity = this.checked ? 0.5 : 1;
            content.querySelector('.medication-name').style.textDecoration = this.checked ? 'line-through' : 'none';
            content.querySelector('.medication-time').style.textDecoration = this.checked ? 'line-through' : 'none';
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

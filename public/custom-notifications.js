function extractYouTubeID(url) {
const regExp = /^.*(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/))([^#&?]{11}).*/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

const form = document.getElementById("notificationForm");
const msgEl = document.getElementById("message");
const preview = document.getElementById("preview");
const vibrationToggle = document.getElementById("vibration");

const vibrationLabel = document.getElementById("vibrationLabel");
const formButtons = document.getElementById("formButtons");
const messageOverlay = document.getElementById("messageOverlay");
const messageText = document.getElementById("messageText");



// Simulate logged-in userId for demo; replace with your auth user ID logic
const userId = 1; // Example fixed user ID

// Update vibration label text on toggle change
vibrationToggle.addEventListener("change", () => {
  vibrationLabel.textContent = vibrationToggle.value === "on" ? "On" : "Off";
});


// Preview YouTube video embed
document.getElementById("youtube").addEventListener("input", function () {
  const id = extractYouTubeID(this.value);
  preview.innerHTML = id
    ? `<iframe width="100%" height="170" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`
    : "";
});

// Show a message overlay and redirect to index after click
function showMessageAndRedirect(msg) {
  messageText.textContent = msg;
  messageOverlay.classList.remove("hidden");

  function clickHandler() {
    messageOverlay.classList.add("hidden");
    messageOverlay.removeEventListener("click", clickHandler);
    window.location.href = "index.html"; // redirect after user clicks anywhere
  }

  messageOverlay.addEventListener("click", clickHandler);
}

// Show an error message inside form
function showError(msg) {
  msgEl.textContent = msg;
  msgEl.style.color = "red";
}

// Clear error message
function clearError() {
  msgEl.textContent = "";
}

// Extract form data as an object
function getFormData() {
  return {
    userId,
    ringtone: form.ringtone.value.trim(),
    vibration: vibrationToggle.value === "on" ? "On" : "Off",
    repeat: parseInt(form.repeat.value),
    youtube: form.youtube.value.trim() || null
  };
}


// Dynamically create buttons based on notification existence
function renderButtons(notificationExists) {
  formButtons.innerHTML = "";

  if (notificationExists) {
    // Done Editing button
    const doneBtn = document.createElement("button");
    doneBtn.id = "updateBtn";
    doneBtn.type = "button";
    doneBtn.textContent = "Done Editing";
    doneBtn.addEventListener("click", handleUpdate);
    formButtons.appendChild(doneBtn);

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.id = "deleteBtn";
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete Notification";
    deleteBtn.addEventListener("click", handleDelete);
    formButtons.appendChild(deleteBtn);
  } else {
    // Create button
    const createBtn = document.createElement("button");
    createBtn.id = "createBtn";
    createBtn.type = "button";
    createBtn.textContent = "Create Notification";
    createBtn.addEventListener("click", handleCreate);
    formButtons.appendChild(createBtn);
  }
}

// Load notification and populate form, then show appropriate buttons
async function loadNotification() {
  try {
    const res = await fetch(`/api/notifications/${userId}`);
    if (res.status === 404) {
      clearError();
      renderButtons(false);
      return;
    }
    if (!res.ok) throw new Error("Failed to load notification");

    const notif = await res.json();

    // Populate form
    form.ringtone.value = notif.ringtone_name;
    form.repeat.value = notif.repeat_count;
    form.youtube.value = notif.youtube_link || "";
    const vibrateOn = notif.vibration_type === "On";
    vibrationToggle.value = vibrateOn ? "on" : "off"; // FIXED

    // Preview
    if (notif.youtube_link) {
      const id = extractYouTubeID(notif.youtube_link);
      preview.innerHTML = id
        ? `<iframe width="100%" height="170" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`
        : "";
    } else {
      preview.innerHTML = "";
    }

    clearError();
    renderButtons(true);
  } catch (err) {
    showError("Error loading notification");
    renderButtons(false);
  }
}


// Create new notification
async function handleCreate(event) {
  event.preventDefault();
  clearError();
  const data = getFormData();

  try {
    const res = await fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to create notification");

    showMessageAndRedirect("Notification created successfully!");
  } catch (err) {
    showError(err.message);
  }
}

// Update existing notification
async function handleUpdate(event) {
  event.preventDefault();
  clearError();
  const data = getFormData();

  try {
    const res = await fetch(`/api/notifications/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update notification");

    showMessageAndRedirect("Notification updated successfully!");
  } catch (err) {
    showError(err.message);
  }
}

// Delete notification
async function handleDelete(event) {
  event.preventDefault();
  clearError();

  if (!confirm("Are you sure you want to delete this notification?")) return;

  try {
    const res = await fetch(`/api/notifications/${userId}`, {
      method: "DELETE",
    });

    if (!res.ok) throw new Error("Failed to delete notification");

    showMessageAndRedirect("Notification deleted successfully!");
  } catch (err) {
    showError(err.message);
  }
}

// Initialize page
loadNotification();

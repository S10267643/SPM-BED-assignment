function extractYouTubeID(url) {
  const regExp = /^.*(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:.*&)?v=|embed\/))([^#&?]{11}).*/;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

// 🔒 Decode JWT to get user ID
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

// DOM elements
const form = document.getElementById("notificationForm");
const msgEl = document.getElementById("message");
const preview = document.getElementById("preview");

const enable = document.getElementById("enable");
const formButtons = document.getElementById("formButtons");
const messageOverlay = document.getElementById("messageOverlay");
const messageText = document.getElementById("messageText");

// Update vibration label

// YouTube preview
document.getElementById("youtube").addEventListener("input", function () {
  const id = extractYouTubeID(this.value);
  preview.innerHTML = id
    ? `<iframe width="100%" height="170" src="https://www.youtube.com/embed/${id}" frameborder="0" allowfullscreen></iframe>`
    : "";
});

function showMessageAndRedirect(msg) {
  messageText.textContent = msg;
  messageOverlay.classList.remove("hidden");
  function clickHandler() {
    messageOverlay.classList.add("hidden");
    messageOverlay.removeEventListener("click", clickHandler);
    window.location.href = "index.html";
  }
  messageOverlay.addEventListener("click", clickHandler);
}

function showError(msg) {
  msgEl.textContent = msg;
  msgEl.style.color = "red";
}

function clearError() {
  msgEl.textContent = "";
}

function getFormData() {
  return {
    userId,
    title: form.title.value.trim(),
    enable: form.enable,
    youtube: form.youtube.value.trim() || null
  };
}

function renderButtons(notificationExists) {
  formButtons.innerHTML = "";

  if (notificationExists) {
    const doneBtn = document.createElement("button");
    doneBtn.id = "updateBtn";
    doneBtn.type = "button";
    doneBtn.textContent = "Done Editing";
    doneBtn.addEventListener("click", handleUpdate);
    formButtons.appendChild(doneBtn);

    const deleteBtn = document.createElement("button");
    deleteBtn.id = "deleteBtn";
    deleteBtn.type = "button";
    deleteBtn.textContent = "Delete Notification";
    deleteBtn.addEventListener("click", handleDelete);
    formButtons.appendChild(deleteBtn);
  } else {
    const createBtn = document.createElement("button");
    createBtn.id = "createBtn";
    createBtn.type = "button";
    createBtn.textContent = "Create Notification";
    createBtn.addEventListener("click", handleCreate);
    formButtons.appendChild(createBtn);
  }
}

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

    form.title.value = notif.title;
    form.youtube.value = notif.youtube_link || "";
    form.enable.value = notif.enable ;

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
    console.error("Load error:", err);
    showError("Error loading notification");
    renderButtons(false);
  }
}

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

loadNotification();

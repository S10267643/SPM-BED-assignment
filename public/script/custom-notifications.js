const publicKey="BBA0RdnN6B1oZRiZ_g8TWfNXWWq_9OyOEeyITcZSxxil3tStxNTQw3mxEKwrOfDcJ42FEOh6qtB4ClmyyTwGM7I"


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




function showMessageAndRedirect(msg) {
  messageText.textContent = msg;
  messageOverlay.classList.remove("hidden");
  function clickHandler() {
    messageOverlay.classList.add("hidden");
    messageOverlay.removeEventListener("click", clickHandler);
    window.location.href = "elderlyHomeScreen.html";
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
    enable: enable.checked ? "true":"false" ,
    imageLink: form.imageLink.value.trim() || null
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
    form.imageLink.value = notif.imageLink || "";
    
    console.log(notif.enableNotification );
    if (notif.enableNotification){
      enable.checked = true;
    } else {
      enable.checked = false;
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
    updatePushNotificationToken();
  } catch (err) {
    showError(err.message);
  }
}

async function handleUpdate(event) {
  event.preventDefault();
  clearError();
  const data = getFormData();
console.log(data)
  try {
    const res = await fetch(`/api/notifications/${userId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) throw new Error("Failed to update notification");

    showMessageAndRedirect("Notification updated successfully!");
    updatePushNotificationToken();
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


//update push notification token
function updatePushNotificationToken(){
  // Check for service worker
  if ("serviceWorker" in navigator) {
    send().catch((err) => console.error(err));
  }
}

// Register SW, Register Push, Send PushW
async function send() {

  // Register Service Worker
  console.log("Registering service worker...");
  const register = await navigator.serviceWorker.register("./sw.js", {
    scope: "/",
  });
  console.log("Service Worker Registered...");

  // Register Push
  console.log("Registering Push...");
  const notificationToken = await register.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(publicKey),
  });
  console.log("Push Registered...");

  // send Notification token
  console.log("Sending Push...");
  await fetch("http://localhost:3000/api/subscribe", {
    method: "POST",
    body: JSON.stringify({userId,notificationToken}),
    headers: {
      "content-type": "application/json",
    },
  });
  console.log("Push Sent...");
}

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}


loadNotification();

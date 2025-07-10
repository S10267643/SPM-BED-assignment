
const confirmBtn = document.querySelector(".btn.confirm");

confirmBtn.addEventListener("click", async (e) => {
  e.preventDefault();

  // Collects input values
  const medName = document.querySelector("#medName").value;
  const time = document.querySelector("#time").value;

  // Gathers all selected days' text content (like 'Mon', 'Tue') into a comma-separated string
  const selectedDays = Array.from(document.querySelectorAll(".day.selected"))
    .map(el => el.textContent)
    .join(",");

  // Example fixed user ID (replace with real user session ID in production)
  const user_id = 1;

  const payload = {
    user_id,
    medication_name: medName,
    medication_time: time,
    medication_day: selectedDays,
    medication_prescription: "" // optional, empty string for now
  };

  // Sends the data as JSON to your backend API
  try {
    const res = await fetch("/medications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    const result = await res.json();

    if (res.ok) {
      alert("Medication added successfully!");
      window.location.href = "index.html"; // Redirect or refresh page
    } else {
      alert(`Error: ${result.error}`);
    }
  } catch (err) {
    console.error("Failed to submit medication:", err);
    alert("Something went wrong. Please try again.");
  }
});

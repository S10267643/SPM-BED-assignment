document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");

  if (!id) {
    alert("No contact ID provided.");
    window.location.href = "emergencyContact.html";
    return;
  }

  try {
    // Fetch contact by ID
    const response = await fetch(`http://localhost:3000/api/emergency-contacts/${id}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || "Failed to load contact.");
    }

    const contact = await response.json();

    // Pre-fill form
    document.getElementById("name").value = contact.contactName;
    document.getElementById("relationship").value = contact.relationship;
    document.getElementById("phone").value = contact.phoneNumber;

    // Handle form submission
    document.getElementById("editContactForm").addEventListener("submit", async (e) => {
      e.preventDefault();

      const updatedContact = {
        contactName: document.getElementById("name").value.trim(),
        relationship: document.getElementById("relationship").value,
        phoneNumber: document.getElementById("phone").value.replace(/\D/g, ""),
      };

      const updateResponse = await fetch(`http://localhost:3000/api/emergency-contacts/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify(updatedContact),
      });

      if (!updateResponse.ok) {
        const errData = await updateResponse.json();
        throw new Error(errData.error || "Failed to update contact.");
      }

      alert("Contact updated successfully!");
      window.location.href = "emergencyContact.html";
    });
  } catch (error) {
    console.error("Edit error:", error);
    alert("Something went wrong. Redirecting...");
    window.location.href = "emergencyContact.html";
  }
});

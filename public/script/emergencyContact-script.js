document.addEventListener("DOMContentLoaded", async () => {
  const token = localStorage.getItem("token");

  try {
    const response = await fetch("http://localhost:3000/api/emergency-contacts", {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch emergency contacts");
    }

    const contacts = await response.json();
    const container = document.getElementById("contactList");

    if (contacts.length === 0) {
      container.innerHTML = "<p>No emergency contacts found.</p>";
      return;
    }

    contacts.forEach((contact) => {
      const div = document.createElement("div");
      div.className = "contact-card";
      div.innerHTML = `
        <h3>${contact.contactName}</h3>
        <p><strong>Phone:</strong> <a href="tel:${contact.phoneNumber}">${contact.phoneNumber}</a></p>
        <p><strong>Relationship:</strong> ${contact.relationship}</p>
        <button class="edit-btn" data-id="${contact.contactId}">Edit</button>
        <button class="delete-btn" data-id="${contact.contactId}">Delete</button>
      `;
      container.appendChild(div);
      
      const editBtn = div.querySelector(".edit-btn");
      editBtn.addEventListener("click", () => {
        window.location.href = `editEmergencyContact.html?id=${contact.contactId}`;
      });

      const deleteBtn = div.querySelector(".delete-btn");
      deleteBtn.addEventListener("click", async () => {
        if (confirm("Are you sure you want to delete this contact?")) {
          try {
            const token = localStorage.getItem("token");
            const response = await fetch(`http://localhost:3000/api/emergency-contacts/${contact.contactId}`, {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            });

            if (!response.ok) {
              const data = await response.json();
              throw new Error(data.error || "Failed to delete contact");
            }

            alert("Contact deleted successfully");
            window.location.reload(); // Refresh the list
          } catch (err) {
            console.error("Delete error:", err);
            alert("Failed to delete contact");
          }
        }
      });
    });
  } catch (err) {
    console.error("Error loading contacts:", err);
    document.getElementById("contactList").innerHTML = `<p>Error: ${err.message}</p>`;
  }
});
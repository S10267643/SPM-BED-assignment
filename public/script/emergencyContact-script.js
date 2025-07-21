document.addEventListener("DOMContentLoaded", fetchContacts);

async function fetchContacts() {
  const res = await fetch("/emergency-contacts");
  const contacts = await res.json();
  const list = document.getElementById("contactList");
  list.innerHTML = "";
  contacts.forEach(c => {
    const li = document.createElement("li");
    li.textContent = `${c.name} - ${c.phone}`;
    li.innerHTML += ` <button onclick="editContact(${c.id}, '${c.name}', '${c.phone}')">Edit</button>
                      <button onclick="deleteContact(${c.id})">Delete</button>`;
    list.appendChild(li);
  });
}

function showAddForm() {
  document.getElementById("contactForm").style.display = "block";
}

async function submitContact() {
  const name = document.getElementById("contactName").value;
  const phone = document.getElementById("contactPhone").value;
  await fetch("/emergency-contacts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, phone })
  });
  fetchContacts();
}

async function editContact(id, name, phone) {
  const newName = prompt("Edit name:", name);
  const newPhone = prompt("Edit phone:", phone);
  if (newName && newPhone) {
    await fetch(`/emergency-contacts/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, phone: newPhone })
    });
    fetchContacts();
  }
}

async function deleteContact(id) {
  await fetch(`/emergency-contacts/${id}`, {
    method: "DELETE"
  });
  fetchContacts();
}

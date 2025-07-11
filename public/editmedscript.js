document.addEventListener("DOMContentLoaded", () => {
  const medicationItems = document.querySelectorAll(".medication-item");

  medicationItems.forEach(item => {
    item.addEventListener("click", () => {
      // Unselect all items
      medicationItems.forEach(i => i.classList.remove("selected"));

      // Select the clicked item
      item.classList.add("selected");
    });
  });
});

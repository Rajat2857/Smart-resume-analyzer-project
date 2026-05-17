document.addEventListener("DOMContentLoaded", function () {

  //  GET CURRENT USER //
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser) {
    window.location.href = "login.html";
    return;
  }

  // SHOW DATA //
  document.getElementById("profileName").textContent = currentUser.name || "";
  document.getElementById("profileEmail").textContent = currentUser.email || "";

  document.getElementById("editName").value = currentUser.name || "";
  document.getElementById("editEmail").value = currentUser.email || "";
  document.getElementById("joined").value = currentUser.createdAt || "";

  // BUTTONS //
  const editBtn = document.getElementById("editBtn");
  const saveBtn = document.getElementById("saveBtn");
  const nameInput = document.getElementById("editName");

  // EDIT //
  editBtn.addEventListener("click", function () {
    nameInput.disabled = false;
    nameInput.focus();
    saveBtn.style.display = "inline-block";
  });

  // SAVE //
  saveBtn.addEventListener("click", function () {

    let allUsers = JSON.parse(localStorage.getItem("users")) || [];

    allUsers = allUsers.map(eachUser => {
      if (eachUser.email === currentUser.email) {
        return {
          ...eachUser,
          name: nameInput.value
        };
      }
      return eachUser;
    });

    // update full users list  
    localStorage.setItem("users", JSON.stringify(allUsers));

    // update current logged in user
    const updatedCurrentUser = {
      ...currentUser,
      name: nameInput.value
    };

    localStorage.setItem("currentUser", JSON.stringify(updatedCurrentUser));

    alert("Profile Updated ✅");
    location.reload();
  });

  // LOGOUT //
  document.getElementById("logoutBtn").addEventListener("click", function () {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  });

});

// BACK BUTTON //
function goBack() {
  window.location.href = "project.html";
}
//  COMMON //
function isValidEmail(email) {
  const atIndex = email.indexOf("@");
  const dotIndex = email.lastIndexOf(".");

  return (
    atIndex > 0 &&
    dotIndex > atIndex + 5 &&
    dotIndex < email.length - 1
  );
}

//  SIGNUP //
const signupForm = document.getElementById("signupForm");

if (signupForm) {
  signupForm.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("signupName").value.trim();
    const email = document.getElementById("signupEmail").value.trim();
    const password = document.getElementById("signupPassword").value;

    if (!isValidEmail(email)) {
      alert("Enter valid email");
      return;
    }

    if (password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    let users = JSON.parse(localStorage.getItem("users")) || [];

    if (users.find(u => u.email === email)) {
      alert("User already exists");
      return;
    }

    const newUser = {
      name,
      email,
      password,
      createdAt: new Date().toLocaleString()
    };

    users.push(newUser);
    localStorage.setItem("users", JSON.stringify(users));

    alert("Signup successful!");
    window.location.href = "login.html";
  });
}

//  LOGIN //
const loginForm = document.getElementById("loginForm");

if (loginForm) {
  loginForm.addEventListener("submit", function (e) {
    e.preventDefault();

    let attempts = parseInt(localStorage.getItem("attempts")) || 0;
    let blockTime = localStorage.getItem("blockTime");

    //  Check if blocked //
    if (blockTime && Date.now() < blockTime) {
      let remaining = blockTime - Date.now();

      let minutes = Math.floor(remaining / 60000);
      let seconds = Math.floor((remaining % 60000) / 1000);

      alert(`Try again after ${minutes} min ${seconds} sec`);
      return;
    }

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    let users = JSON.parse(localStorage.getItem("users")) || [];

    const user = users.find(
      u => u.email === email && u.password === password
    );

    if (!user) {
      attempts++;
      localStorage.setItem("attempts", attempts);

      if (attempts >= 3) {
        
        let blockUntil = Date.now() + 5 * 60 * 1000;
        localStorage.setItem("blockTime", blockUntil);
        localStorage.setItem("attempts", 0);

        alert("Too many attempts! Try again after 5 minutes.");
        return;
      }

      alert(`Invalid credentials (${attempts}/3)`);
      return;
    }

    //  Login success //
    localStorage.removeItem("attempts");
    localStorage.removeItem("blockTime");

    localStorage.setItem("currentUser", JSON.stringify(user));

    
    window.location.href = "project.html";
  });
}
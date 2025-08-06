function togglePasswordVisibility() {
  const passwordInput = document.getElementById("password");
  const passwordToggle = document.getElementById("passwordToggle");

  // Check if both elements exist
  if (!passwordInput || !passwordToggle) {
    console.warn("Password input or toggle element not found");
    return;
  }

  if (passwordInput.type === "password") {
    passwordInput.type = "text";
    passwordToggle.src = "/images/hide-password.png";
  } else {
    passwordInput.type = "password";
    passwordToggle.src = "/images/show-password.png";
  }
}

// Add event listener only if the toggle element exists
const passwordToggle = document.getElementById("passwordToggle");

if (passwordToggle) {
  passwordToggle.addEventListener("click", togglePasswordVisibility);
} else {
  console.warn("Password toggle element not found");
}
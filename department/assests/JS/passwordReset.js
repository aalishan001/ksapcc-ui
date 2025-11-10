function togglePasswordVisibility(button, input) {
  button.addEventListener("click", function () {
    if (input.type === "password") {
      input.type = "text";
      button.querySelector("i").classList.replace("bi-eye-slash", "bi-eye");
    } else {
      input.type = "password";
      button.querySelector("i").classList.replace("bi-eye", "bi-eye-slash");
    }
  });
}

const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("comfirm-password");
const eyeBtn2 = document.querySelectorAll(".btn")[1];
const eyeBtn = document.querySelectorAll(".btn")[0];

togglePasswordVisibility(eyeBtn, passwordInput);
togglePasswordVisibility(eyeBtn2, confirmPasswordInput);

// form

document.getElementById("login").addEventListener("click", function (event) {
  event.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("comfirm-password").value;
  const errorMessage = document.getElementById("error-message");

  // Check if passwords match
  if (password !== confirmPassword) {
    errorMessage.textContent = "Passwords do not match. Please try again.";
    errorMessage.style.display = "block";
    return;
  }

  // Hide error message if passwords match
  errorMessage.style.display = "none";

  console.log("Email:", email);
  console.log("Password:", password);
  console.log("Confirm Password:", confirmPassword);
});

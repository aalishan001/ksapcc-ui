let isSubmitting = false;

let body = document.querySelector("body");
let right = document.createElement("div");
right.setAttribute("class", "right");
let left = document.createElement("div");
left.setAttribute("class", "left");
const email = document.getElementById("email");
const password = document.getElementById("password");
const loginBtn = document.querySelector(".login-btn");
// console.log("login");

const loginForm = document.getElementById("login-form");
const passwordInput = document.getElementById("password");
const togglePassword = document.getElementById("toggle-password");

const inputValidationMsg = document.createElement("div"); // Create a div for validation messages

// Append validation message div to the login box
const loginBox = document.querySelector(".formBox");
loginBox.appendChild(inputValidationMsg);
inputValidationMsg.classList.add("validation-message");
inputValidationMsg.style.display = "none";

togglePassword.addEventListener("click", () => {
  const isPasswordHidden = passwordInput.type === "password";
  passwordInput.type = isPasswordHidden ? "text" : "password";
  togglePassword.src = isPasswordHidden
    ? "./assests/img/Icon.svg"
    : "./assests/img/Icon2.svg";
});

const emailRegex =
  /^(?!.*[<>\\/\[\]{};:])(?!.*(script|alert|confirm|prompt|document|window|eval|onload|onerror|innerHTML|setTimeout|setInterval|XMLHttpRequest|fetch|Function|console))[^\s@]+@[^\s@]+\.[^\s@]+$/;

const validateInputs = () => {
  let valid = true;
  let validationMsg = "";

  // Validate email input
  if (!email.value.trim()) {
    validationMsg += "Email cannot be empty.\n";
    email.style.borderColor = "red";
    valid = false;
  } else if (!email.value.trim().match(emailRegex)) {
    validationMsg += "Please enter a valid email address.\n";
    email.style.borderColor = "red";
    valid = false;
  } else {
    email.style.borderColor = "";
  }

  // Validate password input
  if (!passwordInput.value.trim()) {
    validationMsg += "Password cannot be empty.\n";
    passwordInput.style.borderColor = "red";
    valid = false;
  } else {
    passwordInput.style.borderColor = "";
  }

  // Show validation messages if any
  if (validationMsg) {
    inputValidationMsg.innerText = validationMsg;
    inputValidationMsg.style.display = "block";
  } else {
    inputValidationMsg.style.display = "none";
  }

  return valid;
};

const focusOnFirstError = () => {
  if (email.style.borderColor === "red") {
    email.focus();
  } else if (password.style.borderColor === "red") {
    password.focus();
  }
};

async function handleSubmit(event) {
  event.preventDefault();

  if (isSubmitting) return;
  isSubmitting = true;

  if (!validateInputs()) {
    focusOnFirstError();
    isSubmitting = false;
    return;
  }
  console.log("Email:", email.value);
  console.log("Password:", password.value);

  try {
    // Show loading state on the login button
    loginBtn.disabled = true;
    loginBtn.innerHTML = `<div class="spinner-border spinner-border-sm" role="status">
                            <span class="visually-hidden">Loading...</span>
                          </div>`;

    // Prepare form data
    const formData = new FormData();
    formData.append("email", email.value.trim());
    formData.append("password", passwordInput.value.trim());

    // Send a POST request to the login API
    const response = await fetch(
      "https://ksapccmonitoring.in/kpi_app/department/login",
      {
        method: "POST",
        body: formData,
      }
    );

    // Parse the JSON response
    const data = await response.json();
    console.log(data);

    if (data.errflag === undefined) {
      localStorage.setItem("authToken", data.userToken);
      localStorage.setItem("userEmail", email.value.trim());
      localStorage.setItem("adminName", data.username);
      window.location.href = "departmentDashboard.html";
    } else if (data.errflag === 3) {
      inputValidationMsg.textContent = data.message + " Enter a safe input.";
      inputValidationMsg.style.display = "block";
      email.focus();
    } else {
      inputValidationMsg.textContent = data.message + " Please try again.";
      inputValidationMsg.style.display = "block";
      email.focus();
    }
  } catch (error) {
    // Handle network or unexpected errors
    console.error("Error:", error);
    inputValidationMsg.textContent = "An error occurred, please try again.";
    inputValidationMsg.style.display = "block";
  } finally {
    // Re-enable the login button and restore its text
    loginBtn.disabled = false;
    loginBtn.innerHTML = "Login";
    isSubmitting = false;
  }
}

loginForm.addEventListener("submit", handleSubmit);

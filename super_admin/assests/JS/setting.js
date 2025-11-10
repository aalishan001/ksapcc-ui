document.addEventListener("DOMContentLoaded", () => {
  const userNameInput = document.getElementById("userName");
  const emailInput = document.getElementById("Email");
  const currentPassInput = document.getElementById("currentPass");
  const newPasswordInput = document.getElementById("newPassword");
  const confirmPassInput = document.getElementById("confirmPass");
  const errmsgbox = document.getElementById("error-message");
  const token = localStorage.getItem("authToken");
  console.log(token);

  const saveUserDetailsBtn = document.querySelector(
    ".settings .btn-success:first-of-type"
  );
  const savePasswordChangeBtn = document.querySelector(
    ".userPass .btn-success"
  );

  const togglePasswordIcons = document.querySelectorAll(".toggle-password");
  togglePasswordIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      const input = icon.previousElementSibling;
      const iconElement = icon.querySelector("i");

      if (input.type === "password") {
        input.type = "text";
        iconElement.classList.remove("bi-eye");
        iconElement.classList.add("bi-eye-slash");
      } else {
        input.type = "password";
        iconElement.classList.remove("bi-eye-slash");
        iconElement.classList.add("bi-eye");
      }
    });
  });

  const errorMsg = document.createElement("p");
  errorMsg.style.color = "red";
  errorMsg.style.fontSize = "0.9rem";
  errorMsg.style.marginTop = "5px";
  errorMsg.style.display = "none";
  errmsgbox.closest(".mb-3").appendChild(errorMsg);

  saveUserDetailsBtn.addEventListener("click", (event) => {
    event.preventDefault();

    const userData = new FormData();
    userData.append("username", userNameInput.value.trim());
    userData.append("emailid", emailInput.value.trim());
    userData.append("token", token);
    saveChange(userData);
  });

  // Get the toast element
  const toastElement = document.getElementById("toast-error");
  const toastMessageElement = document.getElementById("toast-message");
  const toast = new bootstrap.Toast(toastElement);

  // Event listener for password change save button
  savePasswordChangeBtn.addEventListener("click", (event) => {
    event.preventDefault();

    const currentPassword = currentPassInput.value.trim();
    const newPassword = newPasswordInput.value.trim();
    const confirmPassword = confirmPassInput.value.trim();

    if (newPassword !== confirmPassword) {
      toastMessageElement.textContent = "Passwords do not match!";
      toast.show();
    } else if (newPassword === "") {
      toastMessageElement.textContent = "Password cannot be empty!";
      toast.show();
    } else {
      toast.hide();

      const passwordData = new FormData();
      passwordData.append("old_password", currentPassword);
      passwordData.append("new_password", newPassword);
      passwordData.append("token", token);

      changePassword(passwordData);
    }
  });
});

async function saveChange(data) {
  console.log(data);
  const response = await fetch(
    `https://ksapccmonitoring.in/kpi_app/superadmin/update/basic`,
    {
      method: "POST",
      body: data,
    }
  );

  const res = await response.json();
  console.log(res);
}

async function changePassword(data) {
  console.log(data);
  const response = await fetch(
    `https://ksapccmonitoring.in/kpi_app/superadmin/update/password`,
    {
      method: "POST",
      body: data,
    }
  );
  const res = await response.json();
  console.log(res);
}

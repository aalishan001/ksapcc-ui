const tok = localStorage.getItem("authToken");
document.addEventListener("DOMContentLoaded", function () {
  // Select all icons with the class 'bi-pencil-fill'
  const editIcons = document.querySelectorAll(".bi-pencil-fill");

  editIcons.forEach((icon) => {
    icon.addEventListener("click", function () {
      // Find the associated input element (the sibling of the icon's parent div)
      const inputField = this.previousElementSibling;

      // Toggle the 'readonly' attribute
      if (inputField.hasAttribute("readonly")) {
        inputField.removeAttribute("readonly"); // Make it editable
        inputField.focus(); // Focus on the input for convenience
        this.classList.add("editing"); // Optional: Add a class for visual feedback
      } else {
        inputField.setAttribute("readonly", true); // Make it read-only again
        this.classList.remove("editing"); // Remove the class
      }
    });
  });
});

document.addEventListener("DOMContentLoaded", function () {
  const toggleIcons = document.querySelectorAll(".toggle-password");

  toggleIcons.forEach((icon) => {
    icon.addEventListener("click", function () {
      const passwordFieldId = this.getAttribute("data-password");
      const passwordField = document.getElementById(passwordFieldId);

      // Toggle the password field's visibility
      if (passwordField.type === "password") {
        passwordField.type = "text"; // Show password
        this.style.display = "none"; // Hide the current icon
        // Show the sibling icon (eye or eye-slash) for the opposite state
        this.nextElementSibling
          ? (this.nextElementSibling.style.display = "inline")
          : (this.previousElementSibling.style.display = "inline");
      } else {
        passwordField.type = "password"; // Hide password
        this.style.display = "none"; // Hide the current icon
        // Show the sibling icon (eye or eye-slash) for the opposite state
        this.nextElementSibling
          ? (this.nextElementSibling.style.display = "inline")
          : (this.previousElementSibling.style.display = "inline");
      }
    });
  });
});

// Handle Save Change for the Basic Info section
document
  .querySelector(".basicSettings .btn-success")
  .addEventListener("click", function () {
    const basicInfo = {
      department: document
        .querySelector(".basicSettings input[placeholder='']")
        .value.trim(),
      designation: document
        .querySelectorAll(".basicSettings input")[1]
        .value.trim(),
      registrantsName: document
        .querySelectorAll(".basicSettings input")[2]
        .value.trim(),
      division: document
        .querySelectorAll(".basicSettings input")[3]
        .value.trim(),
      district: document
        .querySelectorAll(".basicSettings input")[4]
        .value.trim(),
      placeOfWork: document
        .querySelectorAll(".basicSettings input")[6]
        .value.trim(),
      departmentalCode: document
        .querySelectorAll(".basicSettings input")[5]
        .value.trim(),
      mobileNumber: document
        .querySelectorAll(".basicSettings input")[7]
        .value.trim(),
    };

    // console.log("Basic Info:", tok);

    const formData = new FormData();
    formData.append("place", basicInfo.placeOfWork);
    formData.append("dept_code", basicInfo.departmentalCode);
    formData.append("mobile", basicInfo.mobileNumber);
    formData.append("token", tok || "");

    basicInfoFetch(formData);
  });

// Handle Save Change for the Change Password section
document
  .querySelector(".passDiv .btn-success")
  .addEventListener("click", function () {
    // Get all input values in the Change Password section
    const passwordInfo = {
      currentPassword: document.getElementById("currentPassword").value.trim(),
      newPassword: document.getElementById("newPassword").value.trim(),
      confirmPassword: document.getElementById("confirmPassword").value.trim(),
    };

    if (passwordInfo.newPassword !== passwordInfo.confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    const formData = new FormData();
    formData.append("cur_password", passwordInfo.currentPassword);
    formData.append("new_password", passwordInfo.confirmPassword);
    formData.append("token", tok || "");

    console.log("Password Info:", passwordInfo);

    changePasswordFetch(formData);
  });

async function basicInfoFetch(basicInfo) {
  console.log(basicInfo);

  const response = await fetch(
    `https://ksapccmonitoring.in/kpi_app/department/update`,
    {
      method: "POST",
      body: basicInfo,
    }
  );
  const data = await response.json();
  console.log(data);
}

async function changePasswordFetch(passwordInfo) {
  console.log(passwordInfo);
  const response = await fetch(
    `https://ksapccmonitoring.in/kpi_app/department/update_password`,
    {
      method: "POST",
      body: passwordInfo,
    }
  );
  const data = await response.json();
  console.log(data);
}
// https://ksapccmonitoring.in/kpi_app/

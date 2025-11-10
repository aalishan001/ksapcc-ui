const logout = document.getElementById("logout");

logout.addEventListener("click", () => {
  logoutFunction();
});

async function logoutFunction() {
  const token = localStorage.getItem("authToken");
  const formData = new FormData();
  formData.append("user_token", token);
  console.log(Object.fromEntries(formData));
  // const response = await fetch(
  //   "https://ksapccmonitoring.in/kpi_app/superadmin/logout",
  //   {
  //     method: "POST",
  //     body: formData,
  //     // mode: "no-cors",
  //   }
  // );

  // const data = await response.json();
  // console.log(data);
  localStorage.removeItem("authToken");
  localStorage.removeItem("adminName");
  localStorage.removeItem("adminMail");
  localStorage.removeItem("userEmail");
  window.location.href = "./login.html";
}

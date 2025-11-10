const token = localStorage.getItem("authToken");
const name1 = localStorage.getItem("adminName") || "admin";

if(!token){
  window.location.href = "./login.html";
}

const headName = document.getElementById("nameHeader");
headName.innerText = `Welcome, ${name1}`;

const profile = document.querySelector(".profile");
const initials = getInitials(name1);
profile.innerText = initials;

function getInitials(name) {
  if (!name) return "";
  const nameParts = name.trim().split(" ");
  const firstInitial = nameParts[0]?.charAt(0).toUpperCase() || "";
  const lastInitial = nameParts[1]?.charAt(0).toUpperCase() || "";
  return firstInitial + lastInitial;
}



const logout = document.getElementById("logout");
logout.addEventListener("click", () => {
  localStorage.removeItem("authToken");
  localStorage.removeItem("userEmail");
  localStorage.removeItem("adminName");
  console.log("Logout clicked");
  window.location.href = "./login.html";
});
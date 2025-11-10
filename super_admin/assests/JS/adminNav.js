const token = localStorage.getItem("authToken") || "";
let adminName = localStorage.getItem("adminName") || "";
let adminMail = localStorage.getItem("adminMail") || "";

if (!token) {
  window.location.href = "./login.html";
} else {
  document.addEventListener("DOMContentLoaded", async function () {
    if (!adminName) {
      await fetchAdminData();
    }
    updateNavBar();
    fetchNotifications();
  });

  async function fetchAdminData() {
    try {
      const res = await fetch(
        `https://ksapccmonitoring.in/kpi_app/superadmin/all/${token}`
      );
      if (!res.ok) {
        throw new Error(`Failed to fetch admin data: ${res.status}`);
      }
      const data = await res.json();
      if (data.superAdmins && data.superAdmins.length > 0) {
        adminName = data.superAdmins[0].username;
        adminMail = data.superAdmins[0].emailid;

        localStorage.setItem("adminName", adminName);
        localStorage.setItem("adminMail", adminMail);

        // console.log(adminName, adminMail);
      } else {
        console.warn("No superAdmins found in the response");
      }
    } catch (error) {
      console.error("Error fetching admin data:", error);
    }
  }

  function getInitials(name) {
    if (!name) return "";
    const nameParts = name.trim().split(" ");
    const firstInitial = nameParts[0]?.charAt(0).toUpperCase() || "";
    const lastInitial = nameParts[1]?.charAt(0).toUpperCase() || "";
    return firstInitial + lastInitial;
  }

  function updateNavBar() {
    const initials = getInitials(adminName);
    document.getElementById("adminNav").innerHTML = `
    <nav class="navBar">
      <div class="logo">
        <svg width="40" height="40" viewBox="0 0 55 56" fill="none" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<rect y="0.5" width="55" height="55" rx="4" fill="url(#pattern0_224_757)"/>
<defs>
<pattern id="pattern0_224_757" patternContentUnits="objectBoundingBox" width="1" height="1">
<use xlink:href="#image0_224_757" transform="translate(-0.0035461) scale(0.0070922)"/>
</pattern>
<image id="image0_224_757" width="142" height="141" xlink:href="data:image/png;base64,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"/>
</defs>
</svg>
        <div class="tagText">
          <h1>KSAPCC</h1>
          <h3>Monitoring</h3>
        </div>
      </div>
      <div class="navRight">
        <p>Welcome, ${adminName || "Admin"}</p>
        <div class="profile">${initials || "A"}</div>
        <div class="notification dropdown">
          <i
            class="bi bi-bell"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          ></i>
         <ul class="dropdown-menu" id="notificationList">
      
          </ul>
        </div>
      </div>
    </nav>
  `;
  }
}

async function fetchNotifications() {
  try {
    const res = await fetch(
      `https://ksapccmonitoring.in/kpi_app/get_superadmin_notifications/${token}`
    );

    const data = await res.json();
    // console.log(data);

    setNotifications(data);
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
}

function setNotifications(data) {
  // console.log(data.notifications);

  let icon;
  const notificationList = document.getElementById("notificationList");
  notificationList.innerHTML = "";

  data.notifications.forEach((notification) => {
    const div = document.createElement("div");

    if (notification.notif_type == 0) {
      div.classList.add("notificationColorRed");
      icon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
<path d="M12 2.25C10.0716 2.25 8.18657 2.82183 6.58319 3.89317C4.97982 4.96451 3.73013 6.48726 2.99218 8.26884C2.25422 10.0504 2.06114 12.0108 2.43735 13.9021C2.81355 15.7934 3.74215 17.5307 5.10571 18.8943C6.46928 20.2579 8.20656 21.1865 10.0979 21.5627C11.9892 21.9389 13.9496 21.7458 15.7312 21.0078C17.5127 20.2699 19.0355 19.0202 20.1068 17.4168C21.1782 15.8134 21.75 13.9284 21.75 12C21.747 9.41506 20.7188 6.93684 18.891 5.10901C17.0632 3.28118 14.5849 2.25299 12 2.25ZM16.6436 10.2927L11.1431 15.5427C11.0032 15.6758 10.8176 15.75 10.6245 15.75C10.4315 15.75 10.2458 15.6758 10.106 15.5427L7.35645 12.9177C7.2128 12.7801 7.12965 12.5911 7.12525 12.3923C7.12084 12.1934 7.19555 12.0009 7.33297 11.8571C7.47038 11.7133 7.65927 11.6299 7.85813 11.6252C8.05699 11.6206 8.24957 11.695 8.39356 11.8323L10.6245 13.9629L15.6065 9.20728C15.7504 9.07004 15.943 8.99558 16.1419 9.00023C16.3407 9.00489 16.5296 9.08828 16.667 9.2321C16.8045 9.37592 16.8792 9.56841 16.8748 9.76727C16.8704 9.96614 16.7872 10.1551 16.6436 10.2927Z" fill="#0FAF62"/>
</svg>`;
    } else if (notification.notif_type == 1) {
      div.classList.add("notificationColorYellow");
      icon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
  <path d="M9 12.0006H15" stroke="#005CE8" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M9 15.0006H15" stroke="#005CE8" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M5.25 3.75056H18.75C18.9489 3.75056 19.1397 3.82958 19.2803 3.97023C19.421 4.11089 19.5 4.30165 19.5 4.50056V18.7506C19.5 19.3473 19.2629 19.9196 18.841 20.3416C18.419 20.7635 17.8467 21.0006 17.25 21.0006H6.75C6.15326 21.0006 5.58097 20.7635 5.15901 20.3416C4.73705 19.9196 4.5 19.3473 4.5 18.7506V4.50056C4.5 4.30165 4.57902 4.11089 4.71967 3.97023C4.86032 3.82958 5.05109 3.75056 5.25 3.75056Z" stroke="#005CE8" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M7.5 2.25056V5.25056" stroke="#005CE8" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M12 2.25056V5.25056" stroke="#005CE8" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M16.5 2.25056V5.25056" stroke="#005CE8" stroke-width="1.25" stroke-linecap="round" stroke-linejoin="round"/>
</svg>`;
    }

    div.classList.add("notificationLIstBox");
    div.innerHTML = `<div class="notificationHeadBox" ><div class="notIcon" >${icon}</div><p>${notification.content}</p></div>
<div class="notificationTime">${notification.created_at}</div>`;

    notificationList.appendChild(div);
  });
}

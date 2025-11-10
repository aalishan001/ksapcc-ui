document.addEventListener("DOMContentLoaded", () => {
  const toggles = Array.from(document.querySelectorAll(".navToggle"));
  const mediaQuery = window.matchMedia("(max-width: 768px)");

  const closeMenu = (toggle) => {
    const targetId = toggle.getAttribute("aria-controls");
    const target = document.getElementById(targetId);
    if (!target) return;
    toggle.setAttribute("aria-expanded", "false");
    target.classList.remove("nav-open");
    document.body.classList.remove("nav-locked");
    target.querySelectorAll(".dropdown").forEach((dropdown) => {
      dropdown.classList.remove("dropdown-open");
      const btn = dropdown.querySelector(".dropbtn");
      if (btn) btn.setAttribute("aria-expanded", "false");
    });
  };

  toggles.forEach((toggle) => {
    const targetId = toggle.getAttribute("aria-controls");
    const target = document.getElementById(targetId);
    if (!target) return;

    toggle.addEventListener("click", () => {
      const isExpanded = toggle.getAttribute("aria-expanded") === "true";
      if (isExpanded) {
        closeMenu(toggle);
      } else {
        toggles.forEach((other) => closeMenu(other));
        toggle.setAttribute("aria-expanded", "true");
        target.classList.add("nav-open");
        document.body.classList.add("nav-locked");
      }
    });

    target.querySelectorAll("a, button:not(.dropbtn)").forEach((element) => {
      element.addEventListener("click", () => {
        if (mediaQuery.matches) {
          closeMenu(toggle);
        }
      });
    });
  });

  const dropdownButtons = Array.from(
    document.querySelectorAll(".dropdown .dropbtn")
  );

  dropdownButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      if (!mediaQuery.matches) return;
      event.preventDefault();
      const dropdown = btn.closest(".dropdown");
      const isOpen = dropdown.classList.toggle("dropdown-open");
      btn.setAttribute("aria-expanded", String(isOpen));
    });
  });

  const handleViewportChange = () => {
    if (!mediaQuery.matches) {
      toggles.forEach((toggle) => closeMenu(toggle));
      dropdownButtons.forEach((btn) => {
        const dropdown = btn.closest(".dropdown");
        if (dropdown) dropdown.classList.remove("dropdown-open");
        btn.setAttribute("aria-expanded", "false");
      });
    }
  };

  window.addEventListener("resize", handleViewportChange);

  document.addEventListener("click", (event) => {
    if (!mediaQuery.matches) return;
    toggles.forEach((toggle) => {
      if (toggle.getAttribute("aria-expanded") !== "true") return;
      const target = document.getElementById(
        toggle.getAttribute("aria-controls")
      );
      if (!target) return;
      if (!toggle.contains(event.target) && !target.contains(event.target)) {
        closeMenu(toggle);
      }
    });
  });
});

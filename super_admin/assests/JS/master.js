const tok = localStorage.getItem("authToken");
let tempKpiDataArray = []; // Array to store multiple KPIs

document.addEventListener("DOMContentLoaded", async () => {
  // Check if token exists
  if (!tok) {
    alert("Authentication token not found. Please login again.");
    window.location.href = "./login.html";
    return;
  }

  const buttons = document.querySelectorAll(".tab-button");
  const contents = document.querySelectorAll(".content");

  // Handle tab switching
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      buttons.forEach((btn) => btn.classList.remove("active"));
      button.classList.add("active");

      // Hide all content
      contents.forEach((content) => content.classList.remove("active"));
      const tabId = button.getAttribute("data-tab");
      document.getElementById(tabId).classList.add("active");

      if (tabId === "tab1") {
        fetchDepartmentDetails();
      } else if (tabId === "tab2") {
        fetchDistrictDetails();
      } else if (tabId === "tab3") {
        fetchDivisionDetails();
      } else if (tabId === "tab4") {
        fetchUnitDetails();
      }
    });
  });

  // Initialize data and activate first tab
  await Promise.all([
    fetchDepartmentDetails(),
    fetchDivisionDetails(),
    fetchDistrictDetails(),
    fetchUnitDetails(),
  ]);

  buttons[0].classList.add("active");
  contents[0].classList.add("active");

  // Handle Add button clicks
  const departmentButton = document.getElementById("addDepartment");
  const divisionButton = document.getElementById("addDivision");
  const districtButton = document.getElementById("addDistrict");
  const addUnit = document.getElementById("addUnit");

  departmentButton.addEventListener("click", (event) => {
    event.preventDefault();
    const departmentInput = document.getElementById("departmentInput").value;
    const departmentCode = document.getElementById("despartmentCode").value;

    if (departmentInput == "" || departmentCode == "") {
      alert("Please enter a valid department name and code");
      return;
    }

    // Check if KPI data exists, if so use the multi-step process
    if (tempKpiDataArray.length > 0) {
      handleAddDepartmentWithMultipleKpis(
        departmentInput,
        departmentCode,
        tempKpiDataArray
      );
    } else {
      // Use existing endpoint for adding department only
      const formData = new FormData();
      formData.append("dept_name", departmentInput);
      formData.append("dept_code", departmentCode);
      formData.append("token", tok);

      handleAddClick(
        "https://ksapccmonitoring.in/kpi_app/dept_masters/add",
        formData
      );
    }
  });

  divisionButton.addEventListener("click", (event) => {
    event.preventDefault();
    const divisionInput = document.getElementById("divisionInput").value;

    if (divisionInput == "") {
      alert("Please enter a valid division name");
      return;
    }

    const formData = new FormData();
    formData.append("div_name", divisionInput);
    formData.append("token", tok);

    handleAddClick(
      "https://ksapccmonitoring.in/kpi_app/division_master/add",
      formData
    );
  });

  districtButton.addEventListener("click", (event) => {
    event.preventDefault();
    const districtInput = document.getElementById("districtInput").value;

    if (districtInput == "") {
      alert("Please enter a valid district name");
      return;
    }

    const formData = new FormData();
    formData.append("dist_name", districtInput);
    formData.append("token", tok);

    handleAddClick(
      "https://ksapccmonitoring.in/kpi_app/district_master/add",
      formData
    );
  });

  addUnit.addEventListener("click", (event) => {
    event.preventDefault();
    const unitInput = document.getElementById("unitInput").value;

    if (unitInput == "") {
      alert("Please enter a valid unit name");
      return;
    }

    const formData = new FormData();
    formData.append("uom", unitInput);
    formData.append("token", tok);

    handleAddClick(
      "https://ksapccmonitoring.in/kpi_app/uom_master/add",
      formData
    );
  });

  // Add event listener for Assign KPI button
  const assignKpiButton = document.getElementById("assignKpiButton");
  assignKpiButton.addEventListener("click", handleAssignKpiClick);

  // Add event listener for Save KPI button in modal
  const saveKpiButton = document.getElementById("saveKpiButton");
  saveKpiButton.addEventListener("click", handleSaveKpi);

  // Set up delete functionality
  setupDeleteFunctionality();
});

// Fetch Department Details
async function fetchDepartmentDetails() {
  try {
    const response = await fetch(
      `https://ksapccmonitoring.in/kpi_app/department_name/all`
    );
    const data = await response.json();
    if (data.errflag === 0) {
      populateDropdown(
        data,
        "disabledSelect",
        "department_names",
        "dept_name",
        "dept_code"
      );
    } else {
      console.error("Error fetching departments:", data.message);
    }
  } catch (error) {
    console.error("Error fetching department details:", error);
  }
}

// Fetch Division Details
async function fetchDivisionDetails() {
  try {
    const response = await fetch(
      `https://ksapccmonitoring.in/kpi_app/division/all`
    );
    const data = await response.json();
    if (data.errflag === 0) {
      populateDropdown(data, "DivisionsSelect", "divisions", "div_name");
    } else {
      console.error("Error fetching divisions:", data.message);
    }
  } catch (error) {
    console.error("Error fetching division details:", error);
  }
}

// Fetch District Details
async function fetchDistrictDetails() {
  try {
    const response = await fetch(
      `https://ksapccmonitoring.in/kpi_app/district/all`
    );
    const data = await response.json();
    if (data.errflag === 0) {
      populateDropdown(data, "districtSelect", "districts", "dist_name");
    } else {
      console.error("Error fetching districts:", data.message);
    }
  } catch (error) {
    console.error("Error fetching district details:", error);
  }
}

async function fetchUnitDetails() {
  try {
    const response = await fetch(
      `https://ksapccmonitoring.in/kpi_app/get_all_uom/all/${tok}`
    );
    const data = await response.json();

    if (data.errflag === 0) {
      populateDropdown(data, "unitSelect", "uom", "uom");
    } else if (data.errflag === 2) {
      console.error("Token error:", data.message);
      alert("Your session has expired. Please login again.");
      localStorage.removeItem("authToken");
      window.location.href = "./login.html";
    } else {
      console.error("Error fetching units:", data.message);
    }
  } catch (error) {
    console.error("Error fetching unit details:", error);
  }
}

// Populate Dropdown
function populateDropdown(data, dropdownId, dataKey, textKey, valueKey = null) {
  const dropdown = document.getElementById(dropdownId);
  dropdown.innerHTML = "";

  const defaultOption = document.createElement("option");
  defaultOption.text = "Select an Option";
  defaultOption.value = "";
  dropdown.appendChild(defaultOption);

  if (data[dataKey] && Array.isArray(data[dataKey])) {
    data[dataKey].forEach((item) => {
      const option = document.createElement("option");

      if (dataKey == "department_names") {
        option.text = `${item.dept_name} | (${item.dept_code})`;
        option.value = item.id;
      } else {
        option.text = item[textKey];
        if (item.dist_id) {
          option.value = item.dist_id;
        } else if (item.div_id) {
          option.value = item.div_id;
        } else if (item.id) {
          option.value = item.id;
        } else {
          option.value = item[textKey];
        }
      }
      dropdown.appendChild(option);
    });
  }
}

async function handleAddClick(url, data) {
  try {
    const response = await fetch(url, {
      method: "POST",
      body: data,
    });
    const res = await response.json();
    console.log(res);

    if (res.errflag == 0) {
      showToast("Data added successfully!", "success");
      // Refresh the appropriate data
      refreshCurrentTabData();
      clearInputFields();
    } else if (res.errflag === 2) {
      alert("Your session has expired. Please login again.");
      localStorage.removeItem("authToken");
      window.location.href = "./login.html";
    } else {
      showToast(res.message || "Something went wrong!", "danger");
    }
  } catch (error) {
    console.error("Error adding data:", error);
    showToast("Network error occurred!", "danger");
  }
}

function refreshCurrentTabData() {
  const activeTab = document.querySelector(".tab-button.active");
  const tabId = activeTab.getAttribute("data-tab");

  if (tabId === "tab1") {
    fetchDepartmentDetails();
  } else if (tabId === "tab2") {
    fetchDistrictDetails();
  } else if (tabId === "tab3") {
    fetchDivisionDetails();
  } else if (tabId === "tab4") {
    fetchUnitDetails();
  }
}

function clearInputFields() {
  const activeTab = document.querySelector(".tab-button.active");
  const tabId = activeTab.getAttribute("data-tab");

  if (tabId === "tab1") {
    document.getElementById("departmentInput").value = "";
    document.getElementById("despartmentCode").value = "";
  } else if (tabId === "tab2") {
    document.getElementById("districtInput").value = "";
  } else if (tabId === "tab3") {
    document.getElementById("divisionInput").value = "";
  } else if (tabId === "tab4") {
    document.getElementById("unitInput").value = "";
  }
}

function showToast(message, type) {
  console.log("Showing toast:", message);

  const toastContainer = document.getElementById("toastContainer");
  const toastTemplate = document.getElementById("toast");

  const toastElement = toastTemplate.cloneNode(true);
  toastElement.style.display = "block";
  toastElement.id = "";

  const toastBody = toastElement.querySelector(".toast-body");
  toastBody.textContent = message;

  let toastClass = "text-bg-primary";
  if (type === "success") toastClass = "text-bg-success";
  if (type === "danger") toastClass = "text-bg-danger";
  if (type === "warning") toastClass = "text-bg-warning";
  if (type === "info") toastClass = "text-bg-info";
  toastElement.classList.replace("text-bg-primary", toastClass);

  toastContainer.appendChild(toastElement);

  const toast = new bootstrap.Toast(toastElement, {
    autohide: true,
    delay: 3000,
  });
  toast.show();

  toastElement.addEventListener("hidden.bs.toast", () => {
    toastElement.remove();
  });
}

// Handle Assign KPI button click
async function handleAssignKpiClick() {
  console.log("Assign KPI clicked");

  const departmentInput = document.getElementById("departmentInput").value;
  const departmentCode = document.getElementById("despartmentCode").value;

  if (departmentInput == "" || departmentCode == "") {
    alert("Please enter department name and code first before assigning KPI");
    return;
  }

  // Load units for the dropdown
  await loadUnitsForKpi();
  // Also load optional Master KPI/Sub-KPI selectors if present in DOM
  await loadKpiAndSubKpiOptions();

  // Update modal title to show current count
  const modalTitle = document.getElementById("assignModalLabel");
  const currentCount = tempKpiDataArray.length;
  modalTitle.textContent = `ASSIGNING KPI FOR NEW DEPARTMENT ${
    currentCount > 0 ? `(${currentCount} already saved)` : ""
  }`;
}

// Load units for KPI assignment
async function loadUnitsForKpi() {
  try {
    const response = await fetch(
      `https://ksapccmonitoring.in/kpi_app/get_all_uom/all/${tok}`
    );
    const data = await response.json();

    if (data.errflag === 0) {
      const unitSelector = document.getElementById("unitSelector");
      unitSelector.innerHTML = "";

      const defaultOption = document.createElement("option");
      defaultOption.text = "Select Unit";
      defaultOption.value = "";
      unitSelector.appendChild(defaultOption);

      data.uom.forEach((unit) => {
        const option = document.createElement("option");
        option.value = unit.id;
        option.text = unit.uom;
        unitSelector.appendChild(option);
      });
    } else if (data.errflag === 2) {
      alert("Your session has expired. Please login again.");
      localStorage.removeItem("authToken");
      window.location.href = "./login.html";
    } else {
      console.error("Error loading units:", data.message);
    }
  } catch (error) {
    console.error("Error loading units:", error);
  }
}

// Load Master KPI and Sub-KPI options (optional controls)
async function loadKpiAndSubKpiOptions() {
  try {
    const masterSelect = document.getElementById("masterKpiSelect");
    const subSelect = document.getElementById("subKpiSelect");
    if (!masterSelect || !subSelect) {
      // Optional controls not present; nothing to do
      return;
    }

    masterSelect.innerHTML =
      '<option value="">Select Master KPI (optional)</option>';
    subSelect.innerHTML = '<option value="">Select Sub KPI (optional)</option>';

    const response = await fetch(
      `https://ksapccmonitoring.in/kpi_app/kpi/all_with_subkpis/${tok}`
    );
    const data = await response.json();
    if (data.errflag !== 0 || !Array.isArray(data.kpis)) {
      console.warn("Unable to load master/sub KPIs:", data.message);
      return;
    }

    const mapping = {};
    data.kpis.forEach((k) => {
      const opt = document.createElement("option");
      // API returns kpi_id and kpi_name
      opt.value = k.kpi_id;
      opt.textContent = k.kpi_name;
      masterSelect.appendChild(opt);
      mapping[k.kpi_id] = k.sub_kpis || [];
    });

    masterSelect.onchange = () => {
      const mid = masterSelect.value;
      subSelect.innerHTML =
        '<option value="">Select Sub KPI (optional)</option>';
      if (!mid || !mapping[mid] || mapping[mid].length === 0) return;
      mapping[mid].forEach((sk) => {
        const so = document.createElement("option");
        so.value = sk.id;
        so.textContent = sk.name;
        subSelect.appendChild(so);
      });
    };
  } catch (error) {
    console.error("Error loading KPI/Sub-KPI options", error);
  }
}

// Handle Save KPI in modal
function handleSaveKpi() {
  const KPIName = document.getElementById("KPIName").value;
  const unitOfMeasurement = document.getElementById("unitSelector").value;
  const baselineStat = document.getElementById("baselineStat").value;
  const target5 = document.getElementById("target5").value;
  const target4 = document.getElementById("target4").value;
  const target3 = document.getElementById("target3").value;
  const target2 = document.getElementById("target2").value;
  const target1 = document.getElementById("target1").value;
  const subKpiSelect = document.getElementById("subKpiSelect");
  const sub_kpi_id = subKpiSelect ? subKpiSelect.value : "";

  if (!KPIName || !unitOfMeasurement || !baselineStat) {
    alert("Please fill in all required KPI fields");
    return;
  }

  // Create KPI object
  const kpiData = {
    kpis: KPIName,
    uom_master_id: unitOfMeasurement,
    baseline_Status: baselineStat,
    t1: target1 || 0,
    t2: target2 || 0,
    t3: target3 || 0,
    t4: target4 || 0,
    t5: target5 || 0,
  };

  if (sub_kpi_id) {
    kpiData.sub_kpi_id = sub_kpi_id;
  }

  // Add to array instead of replacing
  tempKpiDataArray.push(kpiData);

  console.log("KPI data added to array:", kpiData);
  console.log("Total KPIs saved:", tempKpiDataArray.length);
  showToast(
    `KPI "${KPIName}" saved! Total KPIs: ${tempKpiDataArray.length}`,
    "success"
  );
  // Update counter display
  updateKpiCounter();
  // Update clear button visibility
  addClearKpisButton();
  // Clear the form
  clearKpiForm();
}
function updateKpiCounter() {
  const addDepartmentButton = document.getElementById("addDepartment");
  const existingCounter = document.getElementById("kpiCounter");

  if (tempKpiDataArray.length > 0) {
    if (existingCounter) {
      existingCounter.textContent = `(${tempKpiDataArray.length} KPIs ready)`;
    } else {
      // Create counter element
      const counter = document.createElement("span");
      counter.id = "kpiCounter";
      counter.className = "badge bg-info ms-2";
      counter.textContent = `(${tempKpiDataArray.length} KPIs ready)`;
      addDepartmentButton.parentNode.insertBefore(
        counter,
        addDepartmentButton.nextSibling
      );
    }
  } else {
    if (existingCounter) {
      existingCounter.remove();
    }
  }
}

// Clear all temp KPI data and update counter
function clearTempKpiData() {
  tempKpiDataArray = [];
  updateKpiCounter();
  addClearKpisButton(); // Update button visibility
}

// Add a "Clear All KPIs" button functionality
function addClearKpisButton() {
  const assignKpiButton = document.getElementById("assignKpiButton");

  // Create clear button if it doesn't exist and there are KPIs saved
  const existingClearButton = document.getElementById("clearKpisButton");

  if (tempKpiDataArray.length > 0 && !existingClearButton) {
    const clearButton = document.createElement("button");
    clearButton.type = "button";
    clearButton.id = "clearKpisButton";
    clearButton.className = "btn btn-outline-danger rounded-pill mb-2 ms-2";
    clearButton.textContent = "Clear All KPIs";
    clearButton.addEventListener("click", function () {
      if (
        confirm(
          `Are you sure you want to clear all ${tempKpiDataArray.length} saved KPIs?`
        )
      ) {
        clearTempKpiData();
        showToast("All KPIs cleared", "info");
      }
    });

    assignKpiButton.parentNode.insertBefore(
      clearButton,
      assignKpiButton.nextSibling
    );
  } else if (tempKpiDataArray.length === 0 && existingClearButton) {
    existingClearButton.remove();
  }
}

// Clear KPI form
function clearKpiForm() {
  document.getElementById("KPIName").value = "";
  document.getElementById("unitSelector").value = "";
  document.getElementById("baselineStat").value = "";
  document.getElementById("target5").value = "";
  document.getElementById("target4").value = "";
  document.getElementById("target3").value = "";
  document.getElementById("target2").value = "";
  document.getElementById("target1").value = "";
}

// Handle adding department with multiple KPIs
async function handleAddDepartmentWithMultipleKpis(
  deptName,
  deptCode,
  kpiDataArray
) {
  try {
    // Step 1: Add department first
    const deptFormData = new FormData();
    deptFormData.append("dept_name", deptName);
    deptFormData.append("dept_code", deptCode);
    deptFormData.append("token", tok);

    console.log("Step 1: Adding department...");
    const deptResponse = await fetch(
      "https://ksapccmonitoring.in/kpi_app/dept_masters/add",
      {
        method: "POST",
        body: deptFormData,
      }
    );

    const deptResult = await deptResponse.json();
    console.log("Department add result:", deptResult);

    if (deptResult.errflag !== 0) {
      showToast("Error adding department: " + deptResult.message, "danger");
      return;
    }

    // Step 2: Add all KPIs using the returned department ID
    const departmentId = deptResult.department_id;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < kpiDataArray.length; i++) {
      const kpiData = kpiDataArray[i];

      console.log(`Step 2.${i + 1}: Adding KPI "${kpiData.kpis}"...`);

      const kpiFormData = new FormData();
      kpiFormData.append("department_name_id", departmentId);
      kpiFormData.append("kpis", kpiData.kpis);
      kpiFormData.append("uom_master_id", kpiData.uom_master_id);
      kpiFormData.append("baseline_Status", kpiData.baseline_Status);
      kpiFormData.append("t1", kpiData.t1);
      kpiFormData.append("t2", kpiData.t2);
      kpiFormData.append("t3", kpiData.t3);
      kpiFormData.append("t4", kpiData.t4);
      kpiFormData.append("t5", kpiData.t5);
      kpiFormData.append("token", tok);
      if (kpiData.sub_kpi_id) {
        kpiFormData.append("sub_kpi_id", kpiData.sub_kpi_id);
      }

      const kpiResponse = await fetch(
        "https://ksapccmonitoring.in/kpi_app/add_department_kpi",
        {
          method: "POST",
          body: kpiFormData,
        }
      );

      const kpiResult = await kpiResponse.json();
      console.log(`KPI "${kpiData.kpis}" add result:`, kpiResult);

      if (kpiResult.errflag === 0) {
        successCount++;
      } else {
        failCount++;
        console.error(
          `Failed to add KPI "${kpiData.kpis}":`,
          kpiResult.message
        );
      }
    }

    // Show result summary
    if (failCount === 0) {
      showToast(
        `Department and all ${successCount} KPIs added successfully!`,
        "success"
      );
    } else if (successCount > 0) {
      showToast(
        `Department added with ${successCount} KPIs. ${failCount} KPIs failed to add.`,
        "warning"
      );
    } else {
      showToast(
        `Department added but all ${failCount} KPIs failed to add.`,
        "danger"
      );
    }

    // Clear form and temp data
    document.getElementById("departmentInput").value = "";
    document.getElementById("despartmentCode").value = "";
    clearTempKpiData();

    // Refresh department list
    fetchDepartmentDetails();
  } catch (error) {
    console.error("Error in multi-step process:", error);
    showToast("Error adding department with KPIs", "danger");
  }
}

// Setup delete functionality
function setupDeleteFunctionality() {
  const dropdown = document.getElementById("disabledSelect");
  const dropdown1 = document.getElementById("districtSelect");
  const dropdown2 = document.getElementById("DivisionsSelect");
  const dropdown3 = document.getElementById("unitSelect");
  const deleteBox = document.querySelector(".DeleteBox");
  const deleteDepartment = document.getElementById("deleteDistrictBox");
  const deleteDivision = document.getElementById("deleteDivisionBox");
  const deleteUnit = document.getElementById("deleteUnitBox");

  dropdown.addEventListener("change", function () {
    if (dropdown.value) {
      deleteBox.style.display = "flex";
    } else {
      deleteBox.style.display = "none";
    }
  });

  dropdown1.addEventListener("change", function () {
    if (dropdown1.value) {
      deleteDepartment.style.display = "flex";
    } else {
      deleteDepartment.style.display = "none";
    }
  });

  dropdown2.addEventListener("change", function () {
    if (dropdown2.value) {
      deleteDivision.style.display = "flex";
    } else {
      deleteDivision.style.display = "none";
    }
  });

  dropdown3.addEventListener("change", function () {
    if (dropdown3.value) {
      deleteUnit.style.display = "flex";
    } else {
      deleteUnit.style.display = "none";
    }
  });

  // Delete button event listeners
  document
    .getElementById("deleteDepartment")
    .addEventListener("click", function (e) {
      e.preventDefault();
      const selectedValue = dropdown.value;
      setupDeleteConfirmation(
        "https://ksapccmonitoring.in/kpi_app/dept_masters/delete",
        "dept_id",
        selectedValue
      );
    });

  document
    .getElementById("deleteDistrict")
    .addEventListener("click", function (e) {
      e.preventDefault();
      const selectedValue = dropdown1.value;
      setupDeleteConfirmation(
        "https://ksapccmonitoring.in/kpi_app/district_master/delete",
        "dist_id",
        selectedValue
      );
    });

  document
    .getElementById("deleteDivision")
    .addEventListener("click", function (e) {
      e.preventDefault();
      const selectedValue = dropdown2.value;
      setupDeleteConfirmation(
        "https://ksapccmonitoring.in/kpi_app/division_master/delete",
        "div_id",
        selectedValue
      );
    });

  document.getElementById("deleteUnit").addEventListener("click", function (e) {
    e.preventDefault();
    const selectedValue = dropdown3.value;
    setupDeleteConfirmation(
      "https://ksapccmonitoring.in/kpi_app/uom_master/delete",
      "uom_id",
      selectedValue
    );
  });
}

function setupDeleteConfirmation(url, field, id) {
  const confirmButton = document.getElementById("confirmDelete");

  // Remove any existing event listeners
  const newConfirmButton = confirmButton.cloneNode(true);
  confirmButton.parentNode.replaceChild(newConfirmButton, confirmButton);

  // Add new event listener
  newConfirmButton.addEventListener("click", async function () {
    const modal = bootstrap.Modal.getInstance(
      document.getElementById("exampleModal")
    );
    modal.hide();
    await deleteMaster(url, field, id);
  });
}

async function deleteMaster(url, field, id) {
  const formData = new FormData();
  formData.append(field, id);
  formData.append("token", tok);

  try {
    const res = await fetch(url, {
      method: "POST",
      body: formData,
    });

    const data = await res.json();

    if (data.errflag == 0) {
      showToast("Item deleted successfully!", "success");
      refreshCurrentTabData();
    } else if (data.errflag === 2) {
      alert("Your session has expired. Please login again.");
      localStorage.removeItem("authToken");
      window.location.href = "./login.html";
    } else {
      showToast("Failed to delete item!", "danger");
    }
  } catch (error) {
    showToast("An error occurred while deleting the item.", "danger");
    console.error("Fetch error:", error);
  }
}

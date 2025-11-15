const tok = localStorage.getItem("authToken");
let gridApi;
let datas;
let deptId;
let currentEditingKpi = null; // Add this global variable

let currentDepartmentId = null;
// (debug placeholder removed)
async function fetchdetails(tok) {
  try {
    const response = await fetch(
      `https://ksapccmonitoring.in/kpi_app/department/get_status/${tok}`,
      { method: "GET" }
    );
    const data = await response.json();
    datas = data; // Store globally if needed
    initializeGrid(data);
  } catch (error) {
    console.error("Error fetching department status:", error);
  }
}

function initializeGrid(data) {
  gridOptions.rowData = data.department_status;
  const gridDiv = document.querySelector("#myGrid");
  if (!gridApi) {
    gridApi = agGrid.createGrid(gridDiv, gridOptions);
  } else {
    gridApi.setRowData(data.department_status);
  }
}

async function toggleStatus(id, app_status) {
  const form = new FormData();
  form.append("id", id);
  form.append("app_status", app_status);
  form.append("token", tok);

  try {
    const response = await fetch(
      "https://ksapccmonitoring.in/kpi_app/department/toggle_approval_status",
      {
        method: "POST",
        body: form,
      }
    );

    const result = await response.json();
    if (result.errflag === 0) {
      fetchdetails(tok); // Refresh grid
    } else {
      alert("Error updating approval status: " + result.message);
    }
  } catch (error) {
    console.error("Error toggling approval status:", error);
    alert("Failed to update approval status. Please try again.");
  }
}

// usege
const gridOptions = {
  rowData: [],

  columnDefs: [
    {
      field: "dept_name",
      headerName: "DEPARTMENT NAME",
      //   maxWidth: 700,
      cellRenderer: (params) => {
        let data = JSON.stringify(params.data).replace(/"/g, "&quot;");
        let name = params.data.dept_name;
        // cell click handled by handleDepartment
        return `<p style="font-weight: 500; cursor: pointer;" 
           data-bs-toggle="modal" data-bs-target="#exampleModal" 
           onclick="handleDepartment('${data}')">${name}</p>`;
      },
    },
    {
      field: "approval_status",
      headerName: "APPROVAL STATUS",
      maxWidth: 250,
      cellRenderer: (params) => {
        const value = params.data.approval_status;
        const id = params.data.department_id;
        let content = "";
        let color = "";
        let backgroundColor = "";
        let border = "";

        if (value === null) {
          // ADD THIS BLOCK
          content = "PENDING";
          color = "#FFA500"; // Orange color for pending
          backgroundColor = "#FFF8ED";
          border = "0.5px solid #FFA500";
        } else if (value == 1) {
          content = "✓ APPROVED";
          color = "#0FAF62";
          backgroundColor = "#EDFFF3";
          border = "0.5px solid #0FAF62";
        } else if (value == 2) {
          content = "☓ REJECTED";
          color = "#F44336";
          backgroundColor = "#FDEDED";
          border = "0.5px solid #F44336";
        } else {
          // Create Approve and Reject buttons dynamically
          const approveButton = document.createElement("div");
          approveButton.style.color = "#0FAF62";
          approveButton.style.border = "0.5px solid #0FAF62";
          approveButton.style.backgroundColor = "#EDFFF3";
          approveButton.style.padding = "0 8px";
          approveButton.style.borderRadius = "4px";
          approveButton.style.fontWeight = "500";
          approveButton.style.cursor = "pointer";
          approveButton.innerText = "✓ APPROVE";

          const rejectButton = document.createElement("div");
          rejectButton.style.color = "#F44336";
          rejectButton.style.border = "0.5px solid #F44336";
          rejectButton.style.backgroundColor = "#FDEDED";
          rejectButton.style.padding = "0 8px";
          rejectButton.style.borderRadius = "4px";
          rejectButton.style.fontWeight = "500";
          rejectButton.style.cursor = "pointer";
          rejectButton.innerText = "☓ REJECT";

          // Add click listeners to log the appropriate message
          approveButton.addEventListener("click", () => {
            toggleStatus(id, 1);
          });

          rejectButton.addEventListener("click", () => {
            toggleStatus(id, 2);
          });

          // Create a container div to hold both buttons
          const container = document.createElement("div");
          container.style.display = "flex";
          container.style.gap = "10px";
          container.appendChild(approveButton);
          container.appendChild(rejectButton);

          // Return the container as the cell's content
          return container;
        }

        // Return styled content for APPROVED or REJECTED
        const div = document.createElement("div");
        div.style.color = color;
        div.style.border = border;
        div.style.backgroundColor = backgroundColor;
        div.style.padding = "0 8px";
        div.style.borderRadius = "4px";
        div.style.fontWeight = "500";
        div.innerText = content;
        return div;
      },
    },
    {
      field: "kpi_count",
      headerName: "KPI’S",
      maxWidth: 100,
      cellRenderer: (params) => {
        let data = JSON.stringify(params.data).replace(/"/g, "&quot;");

        return `<p style="font-weight: 500; cursor: pointer;" 
        data-bs-toggle="modal" data-bs-target="#kpiNumbersModal"
           onclick="handleKpiNUmberModal('${data}')">${params.data.kpi_count}</p>`;
      },
    },

    // Update the ACTION column in gridOptions
    {
      field: "id",
      headerName: "ACTION",
      maxWidth: 380,
      cellRenderer: function (params) {
        // If rejected, don't render any buttons
        if (params.data.approval_status == 2) {
          return "";
        }

        const data = JSON.stringify(params.data).replace(/"/g, "&quot;");
        let buttons = `
      <div style="display: flex; gap: 10px;">
        <button
          type="button"
          class="btn btn-outline-success rounded-pill"
          data-bs-toggle="modal"
          data-bs-target="#assignModal"
          onclick="handleAssignClick(${data})"
        >
          Assign KPI
        </button>
        <button
          type="button"
          class="btn border border-2 rounded-pill"
          onclick="handleDownloadClick(${data})"
        >
          <i class="bi bi-file-earmark-arrow-down"></i>
          Report
        </button>
    `;

        // Add Change Credentials button for approved departments
        if (params.data.approval_status == 1) {
          buttons += `
        <button
          type="button"
          class="btn btn-outline-primary rounded-pill"
          data-bs-toggle="modal"
          data-bs-target="#changeCredentialsModal"
          onclick="handleChangeCredentialsClick('${data}')"
        >
          Login Update
        </button>
      `;
        }

        buttons += `</div>`;
        return buttons;
      },
    },
  ],
  defaultColDef: {
    sortable: true,
    filter: "agTextColumnFilter",
    resizable: false,
    flex: 1,
    filterParams: {
      debounceMs: 0,
      buttons: ["reset"],
    },
  },
  domLayout: "autoHeight",
  getRowHeight: function (params) {
    return 80;
  },

  onGridReady: function (params) {
    gridApi = params.api; // Ensure global gridApi is set
    updatePaginationSummary(params.api);
    updateCustomPagination(params);
  },

  onFirstDataRendered: function (params) {
    updatePaginationSummary(params.api);
    updateCustomPagination(params);
  },
  onPaginationChanged: function (params) {
    updateCustomPagination(params);
    updatePaginationSummary(params.api);
  },
  pagination: true,
  paginationPageSize: 5,
  paginationPageSizeSelector: false,
  suppressPaginationPanel: true,
};

function handleChangeCredentialsClick(data) {
  const departmentData = JSON.parse(data.replace(/&quot;/g, '"'));
  currentDepartmentId = departmentData.id || departmentData.department_id; // Use .id if present, else .department_id
  console.log("Department data:", departmentData);
  document.getElementById("newEmail").value = "";
  document.getElementById("newPassword").value = "";
  document.getElementById("confirmPassword").value = "";
}

// for showing pagination control
function updatePaginationSummary(api) {
  if (!api || typeof api.getDisplayedRowCount !== "function") {
    console.warn("Grid API not ready or incompatible");
    return;
  }
  const numberPanel = document.querySelector("#paginationNumbers");
  const totalRows = api.getDisplayedRowCount();
  const startRow =
    typeof api.getFirstDisplayedRow === "function"
      ? api.getFirstDisplayedRow() + 1
      : 1;
  const endRow =
    typeof api.getLastDisplayedRow === "function"
      ? api.getLastDisplayedRow() + 1
      : totalRows;
  numberPanel.innerHTML = `Showing ${startRow} to ${endRow} of ${totalRows} entries`;
}

async function handleAssignClick(data) {
  // dept row selected
  deptId = data.dept_master_id;
  const unitSelector = document.getElementById("unitSelector");
  unitSelector.innerHTML = "";
  const response = await fetch(
    `https://ksapccmonitoring.in/kpi_app/get_all_uom/all/${tok}`,
    {
      method: "GET",
    }
  );
  const uomData = await response.json();
  uomData.uom.map((uom) => {
    const option = document.createElement("option");
    option.value = uom.id;
    option.text = uom.uom;
    document.getElementById("unitSelector").appendChild(option);
  });

  // Load master/sub-kpi options if selectors exist
  loadMasterAndSubKpiSelectors();

  // Initialize sub-KPI mode controls
  initSubKpiMode();
}

function handleDownloadClick(data) {}

// Optionally populate sub-KPI multi-select if present (master select removed by design)
async function loadMasterAndSubKpiSelectors() {
  const subSelect = document.getElementById("subKpiSelect");
  if (!subSelect) return; // selector not present in current template
  subSelect.innerHTML = '<option value="">Select Sub KPI (optional)</option>';
  try {
    const resp = await fetch(
      `https://ksapccmonitoring.in/kpi_app/sub_kpi/all/${tok}`
    );
    const data = await resp.json();
    if (data.errflag !== 0 || !Array.isArray(data.kpis)) return;
    data.kpis.forEach((sk) => {
      const so = document.createElement("option");
      so.value = sk.id;
      so.textContent = sk.name;
      subSelect.appendChild(so);
    });
  } catch (e) {
    console.error("Error loading sub-kpis", e);
  }
}

// for number pagination control BUttons
function updateCustomPagination(data) {
  const totalPages = data.api.paginationGetTotalPages();
  const currentPage = data.api.paginationGetCurrentPage();
  const paginationControls = document.getElementById("paginationControler");

  paginationControls.innerHTML = "";

  for (let i = 0; i < totalPages; i++) {
    const pageButton = document.createElement("button");
    pageButton.textContent = i + 1;
    pageButton.classList.add("pagination-button");

    pageButton.addEventListener("click", function () {
      data.api.paginationGoToPage(i);
    });

    if (i === currentPage) {
      pageButton.style.backgroundColor = "#5FA777";
      pageButton.style.color = "white";
    }

    paginationControls.appendChild(pageButton);
  }

  const prevButton = document.createElement("button");
  prevButton.textContent = "←";
  prevButton.setAttribute("id", "arrow-button");
  prevButton.addEventListener("click", function () {
    if (currentPage > 0) {
      data.api.paginationGoToPage(currentPage - 1);
    }
  });

  const nextButton = document.createElement("button");
  nextButton.textContent = "→";
  nextButton.setAttribute("id", "arrow-button");
  nextButton.addEventListener("click", function () {
    if (currentPage < totalPages - 1) {
      data.api.paginationGoToPage(currentPage + 1);
    }
  });

  paginationControls.insertBefore(prevButton, paginationControls.firstChild);
  paginationControls.appendChild(nextButton);
}

async function handleDeleteKpiClick(kpi_id) {
  if (!kpi_id) {
    alert("Error: KPI ID is missing.");
    return;
  }
  if (!confirm("Are you sure you want to delete this KPI?")) {
    return;
  }

  const form = new FormData();
  form.append("kpi_id", kpi_id);
  form.append("token", tok);
  console.log("Deleting KPI:", kpi_id);

  try {
    const response = await fetch(
      "https://ksapccmonitoring.in/kpi_app/kpi/delete",
      {
        method: "POST",
        body: form,
      }
    );

    const result = await response.json();
    console.log("Delete KPI response:", result);
    if (result.errflag === 0) {
      alert(result.message);
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("kpiNumbersModal")
      );
      const currentData = JSON.stringify(
        gridApi.getRowNode(currentDepartmentId)?.data || {}
      );
      modal.hide();
      handleKpiNUmberModal(currentData);
    } else {
      alert(`Error deleting KPI: ${result.message}`);
    }
  } catch (error) {
    console.error("Error deleting KPI:", error);
    alert("Failed to delete KPI. Please check the console for details.");
  }
}

async function handleKpiNUmberModal(data) {
  const departmentData = JSON.parse(data);
  const response = await fetch(
    `https://ksapccmonitoring.in/kpi_app/get_one_department_kpi/${departmentData.dept_master_id}/${tok}`,
    { method: "GET" }
  );
  const kpiData = await response.json();
  console.log(
    "Fetched KPI list count:",
    (kpiData.department_kpis || []).length
  );

  const tableBody = document.querySelector(".modal-kpiNumber-body");
  tableBody.innerHTML = "";

  if (!kpiData.department_kpis || kpiData.department_kpis.length === 0) {
    tableBody.innerHTML = "<p>No KPIs assigned to this department.</p>";
    return;
  }

  kpiData.department_kpis.forEach((kpi, index) => {
    // building KPI row
    const kpiDiv = document.createElement("div");
    kpiDiv.className = "kpiModelBody";
    kpiDiv.style.display = "flex";
    kpiDiv.style.alignItems = "center";
    kpiDiv.style.gap = "10px";
    kpiDiv.innerHTML = `
      <div style="flex-grow: 1;">
        <h6>KPI ${index + 1}</h6>
        <p style="cursor: pointer;">${kpi.kpis}</p>
      </div>
      <button
        type="button"
        class="btn btn-outline-danger rounded-pill btn-sm"
        onclick="handleDeleteKpiClick(${kpi.id})"
      >
        Delete
      </button>
    `;

    kpiDiv.addEventListener("click", (event) => {
      if (event.target.tagName !== "BUTTON") {
        currentEditingKpi = kpi;
      }
    });

    tableBody.appendChild(kpiDiv);
  });
}

document.addEventListener("DOMContentLoaded", function () {
  if (typeof agGrid === "undefined") {
    console.error("AG Grid not loaded");
  } else {
    console.log("AG Grid ready version:", agGrid.version);
  }
  const tok = localStorage.getItem("authToken");
  if (tok) {
    fetchdetails(tok);
  }

  // Modal event handling
  const kpiListModalEl = document.getElementById("kpiNumbersModal");
  const editKpiModalEl = document.getElementById("editKpi");

  if (kpiListModalEl && editKpiModalEl) {
    const kpiListModal = new bootstrap.Modal(kpiListModalEl);
    const editKpiModal = new bootstrap.Modal(editKpiModalEl);

    // Handle click on KPI item
    kpiListModalEl.addEventListener("click", function (event) {
      const kpiItem = event.target.closest(".kpiModelBody");
      if (kpiItem && currentEditingKpi) {
        kpiListModal.hide();
        editKpiModal.show();
      }
    });

    // Populate form when edit modal is shown
    editKpiModalEl.addEventListener("shown.bs.modal", function () {
      if (!currentEditingKpi) return;

      // Function to populate form with retry logic
      function populateEditForm(attempts = 10, delay = 200) {
        const editKpiNameEl = editKpiModalEl.querySelector("#editKpiName");
        if (!editKpiNameEl && attempts > 0) {
          // retry until element renders
          setTimeout(() => populateEditForm(attempts - 1, delay), delay);
          return;
        }
        if (!editKpiNameEl) {
          console.error("Failed to find editKpiName after retries");
          console.warn("editKpiName not found in modal after retries");
          return;
        }

        // Populate fields
        const kpi = currentEditingKpi;
        editKpiNameEl.value = kpi.kpis || "";
        editKpiModalEl.querySelector("#editBaselineStat").value =
          kpi.baseline_Status || "";
        editKpiModalEl.querySelector("#editTarget1").value = kpi.t1 || "";
        editKpiModalEl.querySelector("#editTarget2").value = kpi.t2 || "";
        editKpiModalEl.querySelector("#editTarget3").value = kpi.t3 || "";
        editKpiModalEl.querySelector("#editTarget4").value = kpi.t4 || "";
        editKpiModalEl.querySelector("#editTarget5").value = kpi.t5 || "";

        // Populate unit selector
        const editUnitSelector =
          editKpiModalEl.querySelector("#editUnitSelector");
        editUnitSelector.innerHTML = "";
        fetch(`https://ksapccmonitoring.in/kpi_app/get_all_uom/all/${tok}`)
          .then((response) => response.json())
          .then((uomData) => {
            uomData.uom.forEach((uom) => {
              const option = document.createElement("option");
              option.value = uom.id;
              option.text = uom.uom;
              if (String(uom.id) === String(kpi.uom_master_id)) {
                option.selected = true;
              }
              editUnitSelector.appendChild(option);
            });
          })
          .catch((error) => console.error("Error fetching UOM:", error));
      }

      // Start population
      populateEditForm();
    });
  }

  // Assign button event listener (unchanged)
  const assignSaveButton = document.querySelector(
    "#assignModal .modal-footer button"
  );
  if (assignSaveButton) {
    assignSaveButton.addEventListener("click", () => {
      const KPIName = document.querySelector("#KPIName").value;
      const unitOfMeasurement = document.querySelector("#unitSelector").value;
      const baselineStat = document.querySelector("#baselineStat").value;
      const target5 = document.querySelector("#target5").value;
      const target4 = document.querySelector("#target4").value;
      const target3 = document.querySelector("#target3").value;
      const target2 = document.querySelector("#target2").value;
      const target1 = document.querySelector("#target1").value;
      // Gather selected sub-kpis (multiple allowed)
      const subSelect = document.getElementById("subKpiSelect");
      const selectedSubIds = subSelect
        ? Array.from(subSelect.selectedOptions)
            .map((o) => o.value)
            .filter((v) => v)
        : [];
      const data = {
        KPIName,
        unitOfMeasurement,
        baselineStat,
        targets: {
          "5-Year": target5,
          "4-Year": target4,
          "3-Year": target3,
          "2-Year": target2,
          "1-Year": target1,
        },
        sub_kpi_ids: selectedSubIds,
      };
      postAssignData(data, deptId);
    });
  }

  // Reset sub-KPI modal state on close
  const assignModalEl = document.getElementById("assignModal");
  if (assignModalEl) {
    assignModalEl.addEventListener("hidden.bs.modal", () => {
      const enableCheckbox = document.getElementById("enableSubKpiMode");
      if (enableCheckbox) enableCheckbox.checked = false;
      // Reset mode and UI
      try {
        subKpiDrafts = [];
        currentSubIndex = 0;
        subModeEnabled = false;
      } catch (_) {}
      const nameGroup = document.getElementById("subKpiNameGroup");
      const nav = document.getElementById("subKpiNav");
      const saveBtn = document.getElementById("saveSubKpiBtn");
      const closeBtn = document.getElementById("closeSubKpiBtn");
      const assignSave = document.getElementById("assignSaveBtn");
      const subSelect = document.getElementById("subKpiSelect");
      if (nameGroup) nameGroup.style.display = "none";
      if (nav) nav.style.display = "none";
      if (saveBtn) saveBtn.style.display = "none";
      if (closeBtn) closeBtn.style.display = "none";
      if (assignSave) assignSave.style.display = "inline-block";
      if (subSelect) {
        const group = subSelect.closest(".mb-3");
        if (group) group.style.display = "block";
      }
    });
  }

  // Edit button event listener
  // Edit button event listener
  const editButton = document.getElementById("kpiEditButton");
  if (editButton) {
    editButton.addEventListener("click", () => {
      if (!currentEditingKpi) return;
      const updatedData = {
        id: currentEditingKpi.id,
        // FIX: Add department_name_id here
        department_name_id: currentEditingKpi.department_name_id,
        kpis: document.getElementById("editKpiName")?.value || "",
        uom_master_id: document.getElementById("editUnitSelector")?.value || "",
        baseline_Status:
          document.getElementById("editBaselineStat")?.value || "",
        t1: document.getElementById("editTarget1")?.value || "",
        t2: document.getElementById("editTarget2")?.value || "",
        t3: document.getElementById("editTarget3")?.value || "",
        t4: document.getElementById("editTarget4")?.value || "",
        t5: document.getElementById("editTarget5")?.value || "",
      };
      console.log("Updating KPI id", updatedData.id);
      updateKpiDetails(updatedData);
    });
  }

  const saveCredentialsButton = document.getElementById(
    "saveCredentialsButton"
  );
  if (saveCredentialsButton) {
    saveCredentialsButton.addEventListener("click", async () => {
      const newEmail = document.getElementById("newEmail").value.trim();
      const newPassword = document.getElementById("newPassword").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Client-side validation
      if (!newEmail || !newPassword || !confirmPassword) {
        alert("Please fill in all fields.");
        return;
      }
      if (newPassword !== confirmPassword) {
        alert("Passwords do not match.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
        alert("Please enter a valid email address.");
        return;
      }

      const form = new FormData();
      form.append("id", currentDepartmentId);
      form.append("new_email", newEmail);
      form.append("new_password", newPassword);
      form.append("token", tok);

      try {
        const response = await fetch(
          "https://ksapccmonitoring.in/kpi_app/department/admin_update_credentials",
          {
            method: "POST",
            body: form,
          }
        );

        const result = await response.json();
        if (result.errflag === 0) {
          const modal = bootstrap.Modal.getInstance(
            document.getElementById("changeCredentialsModal")
          );
          modal.hide();
          alert("Credentials updated successfully.");
        } else {
          alert("Error updating credentials: " + result.message);
        }
      } catch (error) {
        console.error("Error updating credentials:", error);
        alert("Failed to update credentials. Please try again.");
      }
    });
  }

  // Add this function to handle the edit click on target fields
  // This makes both the target field and its corresponding remarks field editable/readonly
  document.addEventListener("click", function (e) {
    if (e.target.closest(".targetEdit")) {
      const targetId = e.target.closest(".targetEdit").title;
      const inputField = document.getElementById(targetId);
      const remarksField = document.getElementById(targetId + "remarks");

      if (inputField.hasAttribute("readonly")) {
        inputField.removeAttribute("readonly");
        inputField.style.border = "1px solid #0F6609";
        remarksField.removeAttribute("readonly");
        remarksField.style.border = "1px solid #0F6609";
        remarksField.focus();
      } else {
        inputField.setAttribute("readonly", "true");
        inputField.style.border = "none";
        remarksField.setAttribute("readonly", "true");
        remarksField.style.border = "none";
      }
    }
  });

  // Modify the saveChanges function to include remarks fields
  async function saveChanges(id, rowId) {
    console.log("Saving KPI changes for", id);
    console.log("Row Data:", rowId);

    const leftSectionInputs = document
      .querySelector("#modalleft")
      .querySelectorAll("input");

    const strategyInput = document.querySelector("#strategies");
    const deparmentInput = document.querySelector("#deparment");

    // Get remarks fields
    const y1remarks = document.querySelector("#y1remarks").value;
    const y2remarks = document.querySelector("#y2remarks").value;
    const y3remarks = document.querySelector("#y3remarks").value;
    const y4remarks = document.querySelector("#y4remarks").value;
    const y5remarks = document.querySelector("#y5remarks").value;

    const updatedData = {};

    // Collect data from left section
    leftSectionInputs.forEach((input) => {
      const id = input.id;
      const value = input.value;
      updatedData[id] = value;
      input.setAttribute("readonly", true);
    });

    // Collect data from strategies and co-ordinating departments
    updatedData["strategies"] = strategyInput.value;
    strategyInput.setAttribute("readonly", true);
    updatedData["coordinating_departments"] = deparmentInput.value;
    deparmentInput.setAttribute("readonly", true);

    // Set all remarks fields to readonly
    document.querySelector("#y1remarks").setAttribute("readonly", true);
    document.querySelector("#y2remarks").setAttribute("readonly", true);
    document.querySelector("#y3remarks").setAttribute("readonly", true);
    document.querySelector("#y4remarks").setAttribute("readonly", true);
    document.querySelector("#y5remarks").setAttribute("readonly", true);

    const formData = new FormData();
    formData.append("id", id);
    formData.append("strategies", updatedData.strategies);
    formData.append(
      "coordinating_departments",
      updatedData.coordinating_departments
    );
    if (rowId?.sub_kpi_id) {
      formData.append("sub_kpi_id", rowId.sub_kpi_id);
    }

    // Append remarks fields to form data
    formData.append("y1remarks", y1remarks);
    formData.append("y2remarks", y2remarks);
    formData.append("y3remarks", y3remarks);
    formData.append("y4remarks", y4remarks);
    formData.append("y5remarks", y5remarks);

    for (let i = 1; i <= 5; i++) {
      if (rowId[`y${i}`] == "0.00" || rowId[`y${i}`] == null) {
        if (updatedData[`y${i}`] != "") {
          formData.append(`y${i}`, updatedData[`y${i}`]);
        }
      } else {
        if (
          updatedData[`y${i}`] != "" &&
          updatedData[`y${i}`] != rowId[`y${i}`]
        ) {
          formData.append(`y${i}`, updatedData[`y${i}`]);
        }
      }
    }

    formData.append("token", localStorage.getItem("authToken"));

    console.log("Data being sent:", Object.fromEntries(formData));

    try {
      const response = await fetch(
        "https://ksapccmonitoring.in/kpi_app/update_dep_kpi",
        {
          method: "POST",
          body: formData,
        }
      );

      const result = await response.json();

      if (result.errflag === 0) {
        window.location.reload();
      } else {
        console.error("Error:", result.message);
        alert("Error: " + result.message);
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to update KPI");
    }
  }

  // Function to show edit buttons for both target and notes fields
  function showEditButtons() {
    // For each year 1-5
    for (let i = 1; i <= 5; i++) {
      // Show edit button for target field
      const editButton = document.getElementById(`edit${i}`);
      if (editButton) {
        editButton.style.display = "flex";
      }

      // Show edit button for notes field
      const editNoteButton = document.getElementById(`editnote${i}`);
      if (editNoteButton) {
        editNoteButton.style.display = "flex";
      }
    }
  }

  // handleModalDisplay duplicate removed (use populateModalFields + showEditButtons instead)
});

async function updateKpiDetails(data) {
  const form = new FormData();
  form.append("id", data.id);
  // FIX: Always append department_name_id from the data object
  form.append("department_name_id", data.department_name_id);
  form.append("kpis", data.kpis);
  form.append("uom_master_id", data.uom_master_id);
  form.append("baseline_Status", data.baseline_Status);
  form.append("t1", data.t1);
  form.append("t2", data.t2);
  form.append("t3", data.t3);
  form.append("t4", data.t4);
  form.append("t5", data.t5);
  form.append("token", tok);

  // Log the payload for debugging
  console.log("Form data being sent:", [...form]);

  try {
    const response = await fetch(
      "https://ksapccmonitoring.in/kpi_app/admin_update_department_kpi",
      {
        method: "POST",
        body: form,
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Server error:", response.status, errorText);
      throw new Error(`Server responded with status ${response.status}`);
    }

    const result = await response.json();
    console.log("Server response:", result);

    if (result.errflag === 0) {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("editKpi")
      );
      if (modal) {
        modal.hide();
      }
      // Use a small delay before reloading to ensure modal is hidden
      setTimeout(() => location.reload(), 300);
    } else {
      alert("Error updating KPI: " + result.message);
    }
  } catch (error) {
    console.error("Error updating KPI:", error);
    alert("Failed to update KPI. Please check the console for details.");
  }
}

async function postAssignData(data, deptId) {
  // If multiple sub-kpi selections, create multiple KPI rows
  const subIds = Array.isArray(data.sub_kpi_ids) ? data.sub_kpi_ids : [];
  const payloads = subIds.length > 0 ? subIds : [null];

  for (const sid of payloads) {
    const form = new FormData();
    form.append("department_name_id", deptId);
    form.append("kpis", data.KPIName);
    form.append("uom_master_id", data.unitOfMeasurement);
    form.append("baseline_Status", data.baselineStat);
    form.append("t1", data.targets["1-Year"]);
    form.append("t2", data.targets["2-Year"]);
    form.append("t3", data.targets["3-Year"]);
    form.append("t4", data.targets["4-Year"]);
    form.append("t5", data.targets["5-Year"]);
    if (sid) form.append("sub_kpi_id", sid);
    form.append("token", tok);
    try {
      const resp = await fetch(
        "https://ksapccmonitoring.in/kpi_app/add_department_kpi",
        { method: "POST", body: form }
      );
      const result = await resp.json();
      console.log("Assign KPI result", sid, result);
    } catch (e) {
      console.error("Error assigning KPI for sub_kpi", sid, e);
    }
  }
  location.reload();
}

// --- Sub KPI mode state ---
let subKpiDrafts = []; // array of { name, t1..t5, baseline, unit, etc }
let currentSubIndex = 0;
let subModeEnabled = false;
let masterDeptKpiId = null; // department_kpi id for the master created in this modal

function initSubKpiMode() {
  const enableCheckbox = document.getElementById("enableSubKpiMode");
  const nameGroup = document.getElementById("subKpiNameGroup");
  const nav = document.getElementById("subKpiNav");
  const saveBtn = document.getElementById("saveSubKpiBtn");
  const closeBtn = document.getElementById("closeSubKpiBtn");
  const assignSave = document.getElementById("assignSaveBtn");
  const subSelect = document.getElementById("subKpiSelect");

  if (!enableCheckbox || !nameGroup || !nav || !saveBtn || !closeBtn) return;

  // Reset state on modal open
  subKpiDrafts = [];
  currentSubIndex = 0;
  subModeEnabled = false;
  masterDeptKpiId = null;
  nameGroup.style.display = "none";
  nav.style.display = "none";
  saveBtn.style.display = "none";
  closeBtn.style.display = "none";
  assignSave.style.display = "inline-block";

  enableCheckbox.onchange = () => {
    subModeEnabled = enableCheckbox.checked;
    if (subModeEnabled) {
      // Enter sub KPI mode
      nameGroup.style.display = "block";
      nav.style.display = "flex";
      saveBtn.style.display = "inline-block";
      closeBtn.style.display = "inline-block";
      assignSave.style.display = "none"; // hide normal save
      // Hide existing sub-kpi multi-select group to reduce confusion
      if (subSelect) {
        const group = subSelect.closest(".mb-3");
        if (group) group.style.display = "none";
      }
      // Ensure at least one draft exists
      if (subKpiDrafts.length === 0) {
        subKpiDrafts.push(createEmptySubDraft());
      }
      loadSubDraftIntoForm();
      updateSubNavState();
    } else {
      // Exit sub KPI mode
      nameGroup.style.display = "none";
      nav.style.display = "none";
      saveBtn.style.display = "none";
      closeBtn.style.display = "none";
      assignSave.style.display = "inline-block";
      // Show sub-kpi multi-select group back
      if (subSelect) {
        const group = subSelect.closest(".mb-3");
        if (group) group.style.display = "block";
      }
    }
  };

  const prevBtn = document.getElementById("prevSubKpiBtn");
  const nextBtn = document.getElementById("nextSubKpiBtn");
  const saveSubBtn = document.getElementById("saveSubKpiBtn");
  const closeBtn2 = document.getElementById("closeSubKpiBtn");

  if (prevBtn) {
    prevBtn.onclick = () => {
      if (currentSubIndex > 0) {
        saveCurrentSubDraftFromForm();
        currentSubIndex--;
        loadSubDraftIntoForm();
        updateSubNavState();
      }
    };
  }

  if (nextBtn) {
    nextBtn.onclick = () => {
      saveCurrentSubDraftFromForm();
      if (currentSubIndex === subKpiDrafts.length - 1) {
        // Add a new empty draft at the end
        subKpiDrafts.push(createEmptySubDraft());
      }
      currentSubIndex++;
      loadSubDraftIntoForm();
      updateSubNavState();
    };
  }

  if (saveSubBtn) {
    saveSubBtn.onclick = async () => {
      try {
        saveCurrentSubDraftFromForm();
        // Ensure master department_kpi created once
        const kpiNameVal = document.getElementById("KPIName").value.trim();
        if (!kpiNameVal) {
          alert("Enter KPI Name first");
          return;
        }
        if (!masterDeptKpiId) {
          const masterForm = new FormData();
          masterForm.append("department_name_id", deptId);
          masterForm.append("kpis", kpiNameVal);
          masterForm.append(
            "uom_master_id",
            document.getElementById("unitSelector").value
          );
          masterForm.append(
            "baseline_Status",
            document.getElementById("baselineStat").value
          );
          masterForm.append("t1", document.getElementById("target1").value);
          masterForm.append("t2", document.getElementById("target2").value);
          masterForm.append("t3", document.getElementById("target3").value);
          masterForm.append("t4", document.getElementById("target4").value);
          masterForm.append("t5", document.getElementById("target5").value);
          masterForm.append("token", tok);
          masterForm.append("is_master_only", "1");
          const mResp = await fetch(
            "https://ksapccmonitoring.in/kpi_app/add_department_kpi",
            { method: "POST", body: masterForm }
          );
          const mResult = await mResp.json();
          if (mResult.errflag !== 0 || !mResult.id) {
            throw new Error(mResult.message || "Failed to create master KPI");
          }
          masterDeptKpiId = mResult.id;
        }
        // Create sub_kpi linked to master
        const d = subKpiDrafts[currentSubIndex];
        if (!d.name) {
          alert("Sub KPI Name required");
          return;
        }
        const subForm = new FormData();
        subForm.append("name", d.name);
        subForm.append("department_kpi_id", masterDeptKpiId);
        subForm.append(
          "uom_master_id",
          d.unit || document.getElementById("unitSelector").value
        );
        if (d.baseline) subForm.append("baseline_Status", d.baseline);
        if (d.t1) subForm.append("t1", d.t1);
        if (d.t2) subForm.append("t2", d.t2);
        if (d.t3) subForm.append("t3", d.t3);
        if (d.t4) subForm.append("t4", d.t4);
        if (d.t5) subForm.append("t5", d.t5);
        subForm.append("token", tok);
        const subResp = await fetch(
          "https://ksapccmonitoring.in/kpi_app/sub_kpi/add",
          { method: "POST", body: subForm }
        );
        const subResult = await subResp.json();
        if (subResult.errflag === 0 && subResult.sub_kpi_id) {
          d.saved = true;
          d.sub_kpi_id = subResult.sub_kpi_id;
          alert("Sub KPI saved");
        } else {
          throw new Error(subResult.message || "Failed to save sub KPI");
        }
        updateSubNavState();
      } catch (e) {
        console.error("Save sub KPI error", e);
        alert("Error: " + e.message);
      }
    };
  }

  if (closeBtn2) {
    closeBtn2.onclick = () => {
      // Reset sub KPI mode to allow normal assign if needed
      const enableCheckbox = document.getElementById("enableSubKpiMode");
      if (enableCheckbox) enableCheckbox.checked = false;
      subModeEnabled = false;
      document.getElementById("subKpiNameGroup").style.display = "none";
      document.getElementById("subKpiNav").style.display = "none";
      document.getElementById("saveSubKpiBtn").style.display = "none";
      document.getElementById("closeSubKpiBtn").style.display = "none";
      const assignSave = document.getElementById("assignSaveBtn");
      if (assignSave) assignSave.style.display = "inline-block";
    };
  }

  // Ensure saveCurrentSubDraftFromForm is clean
  // (Re-declared here to overwrite any accidental corruptions)
  window.saveCurrentSubDraftFromForm = function () {
    const d = subKpiDrafts[currentSubIndex];
    d.name = document.getElementById("subKpiNameInput").value.trim();
    d.unit = document.getElementById("unitSelector").value;
    d.baseline = document.getElementById("baselineStat").value.trim();
    d.t1 = document.getElementById("target1").value.trim();
    d.t2 = document.getElementById("target2").value.trim();
    d.t3 = document.getElementById("target3").value.trim();
    d.t4 = document.getElementById("target4").value.trim();
    d.t5 = document.getElementById("target5").value.trim();
  };
  // Close initSubKpiMode
}

// Helper: create an empty sub-KPI draft
function createEmptySubDraft() {
  return {
    name: "",
    unit: document.getElementById("unitSelector")?.value || "",
    baseline: document.getElementById("baselineStat")?.value || "",
    t1: document.getElementById("target1")?.value || "",
    t2: document.getElementById("target2")?.value || "",
    t3: document.getElementById("target3")?.value || "",
    t4: document.getElementById("target4")?.value || "",
    t5: document.getElementById("target5")?.value || "",
    saved: false,
    sub_kpi_id: null,
  };
}

// Helper: load current draft into form inputs
function loadSubDraftIntoForm() {
  const d = subKpiDrafts[currentSubIndex] || createEmptySubDraft();
  const nameInput = document.getElementById("subKpiNameInput");
  if (nameInput) nameInput.value = d.name || "";
  const unitSel = document.getElementById("unitSelector");
  if (unitSel && d.unit) unitSel.value = d.unit;
  const baselineEl = document.getElementById("baselineStat");
  if (baselineEl) baselineEl.value = d.baseline || baselineEl.value;
  const t1 = document.getElementById("target1");
  const t2 = document.getElementById("target2");
  const t3 = document.getElementById("target3");
  const t4 = document.getElementById("target4");
  const t5 = document.getElementById("target5");
  if (t1 && d.t1 !== undefined) t1.value = d.t1;
  if (t2 && d.t2 !== undefined) t2.value = d.t2;
  if (t3 && d.t3 !== undefined) t3.value = d.t3;
  if (t4 && d.t4 !== undefined) t4.value = d.t4;
  if (t5 && d.t5 !== undefined) t5.value = d.t5;
}

// Helper: update navigation buttons state
function updateSubNavState() {
  const prevBtn = document.getElementById("prevSubKpiBtn");
  const nextBtn = document.getElementById("nextSubKpiBtn");
  if (prevBtn) prevBtn.disabled = currentSubIndex === 0;
  if (nextBtn)
    nextBtn.textContent =
      currentSubIndex === subKpiDrafts.length - 1 ? "Add Next" : "Next";
}

function handlekpinumbermodal(kpi) {
  console.log("Setting KPI to edit:", kpi);
  // 1. Store the KPI data in the global variable.
  currentEditingKpi = kpi;

  // 2. Manually hide the first modal.
  const kpiListModal = bootstrap.Modal.getInstance(
    document.getElementById("kpiNumbersModal")
  );
  if (kpiListModal) {
    kpiListModal.hide();
  }

  // 3. Show the second modal. The population will be handled by an event listener.
  const editModal = new bootstrap.Modal(document.getElementById("editKpi"));
  editModal.show();
}

// Function to fetch and populate KPI details
async function handleDepartment(data) {
  data = JSON.parse(data);
  console.log("Data received:", data);

  try {
    const response = await fetch(
      `https://ksapccmonitoring.in/kpi_app/get_dep_kpi_tracker/${localStorage.getItem(
        "authToken"
      )}`,
      { method: "GET" }
    );

    const getData = await response.json();
    console.log("API Response:", getData);

    if (getData.errflag === 0) {
      const kpiData = getData.kpi_data.find(
        (kpi) => kpi.kpi_id === parseInt(data.kpi_id)
      );
      console.log("Found KPI data:", kpiData);

      if (kpiData) {
        populateModalFields(kpiData);

        // Set up the save button click event with the correct kpiData
        const saveChangesBtn = document.getElementById("saveChanges");
        saveChangesBtn.onclick = function () {
          saveChangesHandler(kpiData.kpi_id, kpiData);
        };
      } else {
        console.error("KPI data not found for ID:", data.kpi_id);
      }
    } else {
      console.error("API error:", getData);
    }
  } catch (error) {
    console.error("Error fetching KPI details:", error);
  }
}

// Function to populate modal fields
function populateModalFields(rowData) {
  console.log("Populating fields with data:", rowData);

  // KPI details
  document.getElementById("kpiName").value = rowData.kpis || "";
  document.getElementById("kpiUnit").value = rowData.unit_of_measurement || "";
  document.getElementById("baseLineStatus").value =
    rowData.baseline_Status || "";
  document.getElementById("target5year").value = rowData.t5 || "";

  // Target fields
  document.getElementById("year1").value = rowData.t1 || "";
  document.getElementById("year2").value = rowData.t2 || "";
  document.getElementById("year3").value = rowData.t3 || "";
  document.getElementById("year4").value = rowData.t4 || "";
  document.getElementById("year5").value = rowData.t5 || "";

  // Achievement fields
  document.getElementById("y1").value = rowData.y1 || "";
  document.getElementById("y2").value = rowData.y2 || "";
  document.getElementById("y3").value = rowData.y3 || "";
  document.getElementById("y4").value = rowData.y4 || "";
  document.getElementById("y5").value = rowData.y5 || "";

  // Remarks fields - log them to verify data is present
  console.log("Remarks data:", {
    y1remarks: rowData.y1remarks,
    y2remarks: rowData.y2remarks,
    y3remarks: rowData.y3remarks,
    y4remarks: rowData.y4remarks,
    y5remarks: rowData.y5remarks,
  });

  document.getElementById("y1remarks").value = rowData.y1remarks || "";
  document.getElementById("y2remarks").value = rowData.y2remarks || "";
  document.getElementById("y3remarks").value = rowData.y3remarks || "";
  document.getElementById("y4remarks").value = rowData.y4remarks || "";
  document.getElementById("y5remarks").value = rowData.y5remarks || "";

  // Additional fields
  document.getElementById("deparment").value =
    rowData.coordinating_departments || "";
  document.getElementById("strategies").value = rowData.strategies || "";

  // Show edit buttons
  showEditButtons();
}

// Function to show edit buttons
function showEditButtons() {
  // Show edit buttons for target fields
  for (let i = 1; i <= 5; i++) {
    const editBtn = document.getElementById(`edit${i}`);
    if (editBtn) editBtn.style.display = "flex";

    const editNoteBtn = document.getElementById(`editnote${i}`);
    if (editNoteBtn) editNoteBtn.style.display = "flex";
  }
}

// Handle edit button clicks
document.addEventListener("DOMContentLoaded", function () {
  // Add event delegation for edit buttons
  document.body.addEventListener("click", function (e) {
    const target = e.target.closest(".targetEdit");
    if (target) {
      const fieldId = target.getAttribute("title");
      toggleFieldEditable(fieldId);
    }
  });

  // Add event listeners for editable fields
  const strategiesEl = document.getElementById("strategies");
  if (strategiesEl) {
    strategiesEl.addEventListener("click", function () {
      toggleEditable("strategies");
    });
  }
  const deptEl = document.getElementById("deparment");
  if (deptEl) {
    deptEl.addEventListener("click", function () {
      toggleEditable("deparment");
    });
  }
});

// Toggle field editable state
function toggleFieldEditable(fieldId) {
  console.log("Making field editable:", fieldId);
  const field = document.getElementById(fieldId);

  if (field) {
    if (field.hasAttribute("readonly")) {
      field.removeAttribute("readonly");
      field.style.border = "1px solid #0F6609";
      field.focus();
    } else {
      field.setAttribute("readonly", "true");
      field.style.border = "";
    }
  } else {
    console.error("Field not found:", fieldId);
  }
}

// Toggle function for strategies and coordinating departments
function toggleEditable(elementId) {
  const textarea = document.getElementById(elementId);
  if (textarea) {
    if (textarea.hasAttribute("readonly")) {
      textarea.removeAttribute("readonly");
      textarea.style.border = "1px solid #0F6609";
      textarea.focus();
    } else {
      textarea.setAttribute("readonly", "true");
      textarea.style.border = "";
    }
  }
}

// Save changes handler function
async function saveChangesHandler(kpiId, originalData) {
  console.log("=== SAVE CHANGES STARTED ===");
  console.log("KPI ID:", kpiId);
  console.log("Original data:", originalData);

  // Get input values
  const strategies = document.getElementById("strategies").value;
  const coordinating_departments = document.getElementById("deparment").value;

  // Get achievement values
  const y1 = document.getElementById("y1").value;
  const y2 = document.getElementById("y2").value;
  const y3 = document.getElementById("y3").value;
  const y4 = document.getElementById("y4").value;
  const y5 = document.getElementById("y5").value;

  // Get remarks values
  const y1remarks = document.getElementById("y1remarks").value;
  const y2remarks = document.getElementById("y2remarks").value;
  const y3remarks = document.getElementById("y3remarks").value;
  const y4remarks = document.getElementById("y4remarks").value;
  const y5remarks = document.getElementById("y5remarks").value;

  // Reset all fields to readonly
  document.getElementById("strategies").setAttribute("readonly", "true");
  document.getElementById("deparment").setAttribute("readonly", "true");
  document.getElementById("y1").setAttribute("readonly", "true");
  document.getElementById("y2").setAttribute("readonly", "true");
  document.getElementById("y3").setAttribute("readonly", "true");
  document.getElementById("y4").setAttribute("readonly", "true");
  document.getElementById("y5").setAttribute("readonly", "true");
  document.getElementById("y1remarks").setAttribute("readonly", "true");
  document.getElementById("y2remarks").setAttribute("readonly", "true");
  document.getElementById("y3remarks").setAttribute("readonly", "true");
  document.getElementById("y4remarks").setAttribute("readonly", "true");
  document.getElementById("y5remarks").setAttribute("readonly", "true");

  const formData = new FormData();
  formData.append("id", kpiId);
  formData.append("strategies", strategies);
  formData.append("coordinating_departments", coordinating_departments);
  formData.append("token", localStorage.getItem("authToken"));
  if (originalData?.sub_kpi_id) {
    formData.append("sub_kpi_id", originalData.sub_kpi_id);
  }

  // Append remarks
  formData.append("y1remarks", y1remarks);
  formData.append("y2remarks", y2remarks);
  formData.append("y3remarks", y3remarks);
  formData.append("y4remarks", y4remarks);
  formData.append("y5remarks", y5remarks);

  // Only append changed achievement values
  if (y1 !== originalData.y1 && y1 !== "") formData.append("y1", y1);
  if (y2 !== originalData.y2 && y2 !== "") formData.append("y2", y2);
  if (y3 !== originalData.y3 && y3 !== "") formData.append("y3", y3);
  if (y4 !== originalData.y4 && y4 !== "") formData.append("y4", y4);
  if (y5 !== originalData.y5 && y5 !== "") formData.append("y5", y5);

  console.log("Sending data:", Object.fromEntries(formData));

  try {
    const response = await fetch(
      "https://ksapccmonitoring.in/kpi_app/update_dep_kpi",
      {
        method: "POST",
        body: formData,
      }
    );

    const result = await response.json();
    console.log("API response:", result);

    if (result.errflag === 0) {
      alert("KPI updated successfully");
      window.location.reload();
    } else {
      console.error("Error:", result.message);
      alert("Error: " + result.message);
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Failed to update KPI");
  }
}

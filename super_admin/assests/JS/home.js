const tok = localStorage.getItem("authToken");
let gridApi;
let gridApi1;
async function fetchDepartmentPerformance(tok) {
  try {
    const response = await fetch(
      `https://ksapccmonitoring.in/kpi_app/superadmin_dashboard/department_performance/${tok}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Performance Data Received:", data); // Debugging line

    if (data.errflag === 0) {
      renderPerformanceCards(data.performance_data);
    } else {
      console.error("API Error fetching performance data:", data.message);
      const container = document.getElementById("department-performance-cards");
      container.innerHTML = `<p>Error loading performance data: ${data.message}</p>`;
    }
  } catch (error) {
    console.error("Fetch Error fetching performance data:", error);
    const container = document.getElementById("department-performance-cards");
    container.innerHTML = `<p>Could not fetch performance data. See console for details.</p>`;
  }
}

function renderPerformanceCards(performanceData) {
  const container = document.getElementById("department-performance-cards");
  container.innerHTML = ""; // Clear existing cards

  if (!performanceData || performanceData.length === 0) {
    console.log("No performance data to render."); // Debugging line
    container.innerHTML =
      "<p>No approved department performance data available.</p>";
    return;
  }

  performanceData.forEach((dept) => {
    const percentage = dept.average_performance_percentage;
    // Display the performance relative to 100%
    const displayValue = Math.round(percentage - 100);

    let color;
    if (displayValue > 0) {
      color = "#0F6609"; // Green for positive percentages
    } else if (displayValue < 0) {
      color = "#d32f2f"; // Red for negative percentages
    } else {
      color = "#000000"; // Black for exactly 0%
    }

    const sign = displayValue > 0 ? "+" : "";

    const cardHTML = `
  <div class="card" onclick="filterGridByDepartment('${dept.department_name}')">
    <div class="card-text-content">
      <h10>${dept.department_name.toUpperCase()}</h10>
    </div>
    <div class="card-percentage-content">
      <img src="./assests/img/department_logo.svg" alt="department logo" style="width: 24px; height: 24px; margin-bottom: 8px;" />
      <h1 style="color: ${color};">${sign}${displayValue}%</h1>
    </div>
  </div>
`;
    container.insertAdjacentHTML("beforeend", cardHTML);
  });
}

function filterGridByDepartment(departmentName) {
  if (gridApi) {
    gridApi.setFilterModel({
      department_name: {
        filterType: "text",
        type: "equals",
        filter: departmentName,
      },
    });
    gridApi.onFilterChanged();
  }
}

function clearGridFilter() {
  if (gridApi) {
    gridApi.setFilterModel(null);
    gridApi.onFilterChanged();
  }
}

async function fetchdetails(tok) {
  try {
    const response = await fetch(
      `https://ksapccmonitoring.in/kpi_app/superadmin_dashboard/recent_department_updates/${tok}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();
    datas = await data;
    // console.log(data);
    // deptId = data.department_status[0].dept_master_id;
    initializeGrid(data);
  } catch (error) {
    console.error("Error fetching department status:", error);
    return null;
  }
}

function initializeGrid(data) {
  // console.log(data);
  gridOptions.rowData = data.recent_updates;
  const gridDiv = document.querySelector("#myGrid");
  if (!gridApi) {
    gridApi = agGrid.createGrid(gridDiv, gridOptions);
  }
}

const gridOptions = {
  onGridReady: function (params) {
    gridApi1 = params.api;
  },
  // Row Data: The data to be displayed.
  rowData: [],

  columnDefs: [
    { field: "department_name", headerName: "DEPARTMENT NAME" },
    {
      field: "LAST UPDATED DATE",
      headerName: "LAST UPDATED DATE",
      cellRenderer: (params) => {
        const data = JSON.stringify(params.data).replace(/"/g, "&quot;");
        // console.log(params);
        return `<p data-bs-toggle="modal"
        data-bs-target="#exampleModal1" style=" font-weight: 500; text-decoration: underline; cursor: pointer" onclick="showHistory(${data})" >View History</p>`;
      },
    },
    {
      field: "TREND(UP/DOWN)",
      headerName: "TREND(UP/DOWN)",
      cellRenderer: (params) => {
        // console.log(params);
        const value = params.data.trend;
        // console.log(value);
        let icon = "";
        let color = "";

        if (value.includes("increase")) {
          icon = "↑"; // Up arrow
          color = "green";
        } else if (value.includes("decrease")) {
          icon = "↓"; // Down arrow
          color = "red";
        } else {
          icon = "→ "; // Right arrow
          color = "blue";
        }

        return `<span style="color: ${color}; font-weight: 500;"> 
                ${icon} ${value}
              </span>`;
      },
    },
    { field: "target_5_year", headerName: "TARGET SET FOR 5 YEARS" },
    { field: "recent_target", headerName: "LAST TARGET UPDATE" },
    {
      field: "id",
      headerName: "ACTION",
      cellRenderer: function (params) {
        // console.log(params);
        const data = JSON.stringify(params.data).replace(/"/g, "&quot;");
        return `
      <button
        type="button"
        class="btn btn-outline-success rounded-pill"
        data-bs-toggle="modal"
        data-bs-target="#exampleModal"
        onclick="handleDetails(${data})"
      >
        View Details
      </button>
    `;
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

  onFirstDataRendered: function (params) {
    updatePaginationSummary(params);
    // console.log(params);
  },

  onPaginationChanged: function () {
    updatePaginationSummary(params);
  },
  onPaginationChanged: function (param) {
    updateCustomPagination(param);
    updatePaginationSummary(param);
    // console.log(param)
  },
  // rowModelType : "infinite",
  pagination: true,
  paginationPageSize: 5,
  paginationPageSizeSelector: false,
  suppressPaginationPanel: true,
};

// for showing pagination control
function updatePaginationSummary(p) {
  // console.log(p)
  const numberPannel = document.querySelector("#paginationNumbers");
  const totalRows = p.api.getDisplayedRowCount();
  const startRow = p.api.getFirstDisplayedRowIndex() + 1;
  const endRow = p.api.getLastDisplayedRowIndex() + 1;

  numberPannel.innerHTML = `<div id="paginationNumb"><p>Showing ${startRow} to ${endRow} of ${totalRows} entries</p> <a href="dashBoardShowRecent.html" > <p id="showAll">Show all entries</p></a></div>`;
}

document.addEventListener("DOMContentLoaded", function () {
  fetchdetails(tok);
  fetchdetailsPending(tok);
  fetchDepartmentPerformance(tok);
});

async function handleDetails(data) {
  // console.log(data);
  const id = data.department_kpi_id;
  try {
    const response = await fetch(
      `https://ksapccmonitoring.in/kpi_app/super_admin_get_kpi_details/${id}/${tok}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();
    // datas = await data;
    // console.log(data);

    setInputvalues(data);
  } catch (error) {
    console.error("Error fetching department status:", error);
  }
}

function setInputvalues(data) {
  console.log("KPI Details:", data.kpi_details);

  const value = data.kpi_details.trend;
  // console.log(value);
  let icon = "";
  let color = "";

  if (value.includes("increase")) {
    icon = "↑"; // Up arrow
    color = "green";
  } else if (value.includes("decrease")) {
    icon = "↓"; // Down arrow
    color = "red";
  } else {
    icon = "→ "; // Right arrow
    color = "blue";
  }

  const departmentName = document.getElementById("departmentName");
  departmentName.value = data.kpi_details.department_name;
  const target5year = document.getElementById("target5year");
  target5year.value = data.kpi_details.targets.t5;
  const lastUpdated = document.getElementById("lastUpdated");
  lastUpdated.innerHTML = `
  ${data.kpi_details.last_updated_target}${""}
  <span style="color: ${color}; margin-left: 15px; ">${icon} ${
    data.kpi_details.trend
  }</span>
`;
  const kpiName = document.getElementById("kpiName");
  kpiName.value = data.kpi_details.kpi_name;
  const kpiUnit = document.getElementById("kpiUnit");
  kpiUnit.value = data.kpi_details.uom;
  const kpiLastUpdated = data.kpi_details.kpi_last_updated;

  if (kpiLastUpdated) {
    const date = new Date(kpiLastUpdated);
    const dayName = date.toLocaleString("en-US", { weekday: "short" }); // "Tue"
    const monthName = date.toLocaleString("en-US", { month: "short" }); // "Dec"
    const day = date.getDate().toString().padStart(2, "0"); // "03"
    const year = date.getFullYear(); // "2024"
    // Format the date with a comma
    const formattedDate = `${dayName}, ${monthName} ${day} ${year}`;
    // Update the input field
    const lastUpdate = document.getElementById("lastUpdate");
    lastUpdate.value = formattedDate;
  } else {
    // Handle case where kpiLastUpdated is not provided
    const lastUpdate = document.getElementById("lastUpdate");
    lastUpdate.value = "No date available"; // Or leave it empty
  }

  const co_department = document.getElementById("co_department");
  co_department.value = data.kpi_details.coordinating_departments;
  const strategies = document.getElementById("strategies");
  strategies.value = data.kpi_details.strategies;

  const y1 = document.getElementById("y1");
  y1.value = data.kpi_details.targets.t1;
  const y2 = document.getElementById("y2");
  y2.value = data.kpi_details.targets.t2;
  const y3 = document.getElementById("y3");
  y3.value = data.kpi_details.targets.t3;
  const y4 = document.getElementById("y4");
  y4.value = data.kpi_details.targets.t4;
  const y5 = document.getElementById("y5");
  y5.value = data.kpi_details.targets.t5;

  const t1 = document.getElementById("t1");
  t1.value = data.kpi_details.y_values.y1;
  const t2 = document.getElementById("t2");
  t2.value = data.kpi_details.y_values.y2;
  const t3 = document.getElementById("t3");
  t3.value = data.kpi_details.y_values.y3;
  const t4 = document.getElementById("t4");
  t4.value = data.kpi_details.y_values.y4;
  const t5 = document.getElementById("t5");
  t5.value = data.kpi_details.y_values.y5;

  // Set values for the remarks fields - Make sure we check if the properties exist
  if (data.kpi_details.y_remarks) {
    const t1remarks = document.getElementById("t1remarks");
    t1remarks.value = data.kpi_details.y_remarks.y1remarks || "";
    const t2remarks = document.getElementById("t2remarks");
    t2remarks.value = data.kpi_details.y_remarks.y2remarks || "";
    const t3remarks = document.getElementById("t3remarks");
    t3remarks.value = data.kpi_details.y_remarks.y3remarks || "";
    const t4remarks = document.getElementById("t4remarks");
    t4remarks.value = data.kpi_details.y_remarks.y4remarks || "";
    const t5remarks = document.getElementById("t5remarks");
    t5remarks.value = data.kpi_details.y_remarks.y5remarks || "";

    console.log("Remarks values loaded:", {
      y1: data.kpi_details.y_remarks.y1remarks,
      y2: data.kpi_details.y_remarks.y2remarks,
      y3: data.kpi_details.y_remarks.y3remarks,
      y4: data.kpi_details.y_remarks.y4remarks,
      y5: data.kpi_details.y_remarks.y5remarks,
    });
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

async function showHistory(data) {
  // console.log(data);

  const formData = new FormData();
  formData.append("id", data.department_kpi_id);
  formData.append("token", tok);
  // console.log(Object.fromEntries(formData));

  try {
    const response = await fetch(
      `https://ksapccmonitoring.in/kpi_app/fetch_kpi_update_history`,
      {
        method: "POST",
        body: formData,
      }
    );

    const data = await response.json();
    // datas = await data;
    // console.log(data);

    setHistory(data);
  } catch (error) {
    console.error("Error fetching department status:", error);
  }
}

function setHistory(data) {
  console.log(data);

  const timelineDiv = document.getElementById("timelineDiv");
  timelineDiv.innerHTML = "";

  for (let i = 1; i <= 5; i++) {
    let name = data.kpi_details.y_values[`y${i}`];
    let unit = data.kpi_details.uom;
    let user = data.kpi_details.department_user;
    let date = data.kpi_details.y_values[`y${i}_updated_at`];

    const div = document.createElement("div");
    div.classList.add("timeline-item");
    const div1 = document.createElement("div");
    div1.classList.add("timeline-dot");
    const div2 = document.createElement("div");
    div2.classList.add("timeline-content");
    div2.innerHTML = `<p class="history1" >
                      Updated “Year 1” Target to
                      <span class="highlight">${name}</span> ( In ${unit} )
                  </p>  <p class="meta" class="metah1">${user} ${date}</p>`;

    timelineDiv.appendChild(div);
    div.appendChild(div1);
    div.appendChild(div2);
  }
}

// ---------------------------------------------------------------------------------------------------------------------------
// SECOND GRID FUCNTION 2

async function fetchdetailsPending(tok) {
  // console.log(tok);
  try {
    const response = await fetch(
      `https://ksapccmonitoring.in/kpi_app/superadmin_dashboard/get_pending_updates/${tok}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();
    datas = await data;
    // console.log(data);
    // deptId = data.department_status[0].dept_master_id;
    initializeGrid1(data);
  } catch (error) {
    console.error("Error fetching department status:", error);
    return null;
  }
}

function initializeGrid1(data) {
  // console.log(data);
  gridOptions1.rowData = data.department_kpi_updates;
  const gridDiv = document.querySelector("#myGrid1");
  if (!gridApi1) {
    gridApi1 = agGrid.createGrid(gridDiv, gridOptions1);
  }
}

async function sendReminder(data) {
  console.log(data);

  const formData = new FormData();
  formData.append("department_kpi_id", data.department_kpi_id);
  formData.append("token", tok);
  console.log(Object.fromEntries(formData));

  try {
    const response = await fetch(
      `https://ksapccmonitoring.in/kpi_app/remind_update`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = await response.json();
    console.log(data);
  } catch (error) {
    console.log(error);
  }
}

const gridOptions1 = {
  // Row Data: The data to be displayed.
  rowData: [],
  columnDefs: [
    { field: "department_name", headerName: "DEPARTMENT NAME" },
    {
      field: "update_deadline",
      headerName: "REQUIRED UPDATED DEADLINE",
    },
    {
      field: "deadline_status",
      headerName: "DEADLINE STATUS",
      cellStyle: { color: "red" },
    },
    {
      field: "id",
      headerName: "ACTION",
      cellRenderer: function (params) {
        // console.log(params);
        const data = JSON.stringify(params.data).replace(/"/g, "&quot;");
        return `
      <button
        type="button"
        class="btn btn-outline-success rounded-pill"
        onclick="sendReminder(${data})"
      >
        Send Update Remider
      </button>
    `;
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

  onFirstDataRendered: function (params) {
    updatePaginationSummary1(params);
    // console.log(params);
  },

  onPaginationChanged: function (param) {
    updateCustomPagination1(param);
    updatePaginationSummary1(param);
    // console.log(param)
  },
  pagination: true,
  paginationPageSize: 5,
  paginationPageSizeSelector: false,
  suppressPaginationPanel: true,
};

function updateCustomPagination1(data) {
  const totalPages = data.api.paginationGetTotalPages();
  const currentPage = data.api.paginationGetCurrentPage();
  //   const paginationControls = document.getElementById("paginationControler");
  const paginationControls1 = document.getElementById("paginationControler1");

  //   paginationControls.innerHTML = "";
  paginationControls1.innerHTML = "";

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

    paginationControls1.appendChild(pageButton);
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

  paginationControls1.insertBefore(prevButton, paginationControls1.firstChild);
  paginationControls1.appendChild(nextButton);
}

function updatePaginationSummary1(p) {
  // console.log(p)
  const numberPannel = document.querySelector("#paginationNumbers1");
  const totalRows = p.api.getDisplayedRowCount();
  const startRow = p.api.getFirstDisplayedRowIndex() + 1;
  const endRow = p.api.getLastDisplayedRowIndex() + 1;

  numberPannel.innerHTML = `<div id="paginationNumb" ><p>Showing ${startRow} to ${endRow} of ${totalRows} entries</p> <a href="dashboardShowPending.html" > <p id="showAll">Show all entries</p></a></div>`;
}

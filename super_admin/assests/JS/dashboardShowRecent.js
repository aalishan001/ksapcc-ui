const tok = localStorage.getItem("authToken");
let gridApi;
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
  const numberPannel = document.querySelector("#paginationNumbers");
  const totalRows = p.api.getDisplayedRowCount();
  const startRow = p.api.getFirstDisplayedRowIndex() + 1;
  const endRow = p.api.getLastDisplayedRowIndex() + 1;

  numberPannel.innerHTML = `<div id="paginationNumb"><p>Showing ${startRow} to ${endRow} of ${totalRows} entries</p></div>`;
}

document.addEventListener("DOMContentLoaded", function () {
  fetchdetails(tok);
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
  console.log(data.kpi_details);

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
  // co_department.value = data.kpi_details.co_department;
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
    div2.innerHTML = `<p id="history1" >Updated “Year 1” Target to
                      <span class="highlight">${name}</span> ( In ${unit} )
                  </p>  <p class="meta" id="metah1">${user} ${date}</p>`;

    timelineDiv.appendChild(div);
    div.appendChild(div1);
    div.appendChild(div2);
  }
}

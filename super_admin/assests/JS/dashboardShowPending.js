const tok = localStorage.getItem("authToken");
let gridApi;
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
    // datas = await data;
    console.log(data);
    // deptId = data.department_status[0].dept_master_id;
    initializeGrid1(data);
  } catch (error) {
    console.error("Error fetching department status:", error);
    return null;
  }
}

function initializeGrid1(data) {
  console.log(data);
  gridOptions1.rowData = data.department_kpi_updates;
  const gridDiv = document.querySelector("#myGrid1");
  if (!gridApi) {
    gridApi = agGrid.createGrid(gridDiv, gridOptions1);
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
        onclick="handleDetails(${data})"
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

document.addEventListener("DOMContentLoaded", function () {
  // const gridDiv = document.querySelector("#myGrid1");
  // gridApi1 = agGrid.createGrid(gridDiv, gridOptions1);
  fetchdetailsPending(tok);
});

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

  numberPannel.innerHTML = `<div id="paginationNumb" ><p>Showing ${startRow} to ${endRow} of ${totalRows} entries</p></div>`;
}

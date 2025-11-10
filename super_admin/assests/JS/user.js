const tok = localStorage.getItem("authToken");
let gridApi;
let datas;
const toastMessageElement = document.getElementById("toast-message");
const toastElement = document.getElementById("toast-error");
const toast = new bootstrap.Toast(toastElement);

class StatusCellRenderer {
  init(params) {
    // console.log(params);
    this.eGui = document.createElement("div");
    const isChecked = params.value === 1 ? "checked" : "";

    this.eGui.innerHTML = `
      <label class="switch">
        <input id=${params.data.id} type="checkbox" class="checkbox" ${isChecked}>
        <div class="slider"></div>
      </label>`;

    const checkbox = this.eGui.querySelector('input[type="checkbox"]');

    checkbox.addEventListener("change", async () => {
      const success = await toggleStatus(params.data.id);
      if (success) {
        // params.setValue(newStatus);
      } else {
        checkbox.checked = !checkbox.checked;
      }
    });
  }

  getGui() {
    return this.eGui;
  }

  refresh(params) {
    const checkbox = this.eGui.querySelector('input[type="checkbox"]');
    checkbox.checked = params.value === 1;
    return true;
  }
}

const gridOptions = {
  rowData: [],

  columnDefs: [
    {
      field: "username",
      headerName: "Name Of User",
      maxWidth: 300,
    },
    {
      field: "emailid",
      headerName: "Email ID",
      maxWidth: 500,
    },
    {
      field: "role_id",
      headerName: "ROLE",
      maxWidth: 200,
      cellRenderer: function (params) {
        return params.value === 1 ? "Super Admin" : "Admin";
      },
    },
    {
      field: "status",
      headerName: "STATUS",
      cellRenderer: StatusCellRenderer,
    },
    {
      field: "id",
      headerName: "ACTION",
      cellRenderer: function (params) {
        // console.log(params)
        const dataId = JSON.stringify(params.data).replace(/"/g, "&quot;");
        return `
    <i class="bi bi-pencil-square" data-bs-toggle="modal" data-bs-target="#editModal" onclick="handleEditClick(${dataId})"></i> 
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
  },
  pagination: true,
  paginationPageSize: 5,
  paginationPageSizeSelector: false,
  suppressPaginationPanel: true,
};

// for showing pagination control
function updatePaginationSummary(p) {
  const numberPannel = document.querySelector("#paginationNumbers");
  const totalRows = p.api.getDisplayedRowCount();
  const startRow = p.api.getFirstDisplayedRow() + 1;
  const endRow = p.api.getLastDisplayedRow() + 1;

  numberPannel.innerHTML = `Showing ${startRow} to ${endRow} of ${totalRows} entries`;
}

async function fetchdetails(tok) {
  try {
    const response = await fetch(
      `https://ksapccmonitoring.in/kpi_app/superadmin/all/${tok}`,
      {
        method: "GET",
      }
    );

    const data = await response.json();
    datas = await data;
    console.log(datas);
    initializeGrid(data);
  } catch (error) {
    console.error("Error fetching department status:", error);
    return null;
  }
}

function initializeGrid(data) {
  // console.log(data);
  gridOptions.rowData = data.superAdmins;
  const gridDiv = document.querySelector("#myGrid");
  if (!gridApi) {
    gridApi = agGrid.createGrid(gridDiv, gridOptions);
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const tok = localStorage.getItem("authToken");
  fetchdetails(tok);
});

function handleDetails(data) {
  console.log(data);
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

function handleDepartment(data) {
  const departmentData = JSON.parse(data);
  console.log(departmentData);
}

async function handleEditClick(data) {
  console.log(data);

  document.getElementById("editname").value = data.username || "";
  document.getElementById("editMail").value = data.emailid || "";
  document.getElementById("editPass").value = "";

  const formData = new FormData();
  formData.append("user_id", data.id);
  formData.append("token", tok);
  formData.append("username", data.username);
  formData.append("mail", data.emailid);
  formData.append("role_id", data.role_id);
  formData.append("password", data.status);

  const saveButton = document.getElementById("editBtn");
  saveButton.onclick = function () {
    const name = document.getElementById("editname").value;
    const email = document.getElementById("editMail").value;
    const pass = document.getElementById("editPass").value;

    //  console.log("Updated values:", { name, email, pass });

    // Prepare the form data
    const formData = new FormData();
    formData.append("user_id", data.id);
    formData.append("token", tok);
    formData.append("username", name);
    formData.append("mail", email);
    formData.append("role_id", data.role_id);
    formData.append("password", pass);

    fetcheditor(formData);
  };
}

async function toggleStatus(customerId) {
  console.log("Toggle status clicked", customerId, tok);

  const formDatas = new FormData();
  formDatas.append("user_id", customerId);
  formDatas.append("token", tok);

  const response = await fetch(
    "https://ksapccmonitoring.in/kpi_app/superadmin/toggle",
    {
      method: "POST",
      body: formDatas,
    }
  );

  const data = await response.json();
  console.log(data);
  return true;
}

// Add event listener for the Save button
document.querySelector("#save").addEventListener("click", function () {
  // Get form values
  const userName = document.getElementById("userId").value.trim();
  const email = document.getElementById("InputEmail1").value.trim();
  const password = document.getElementById("InputPassword").value.trim();
  const role = document.getElementById("select").value;

  // Create an object to store the form data
  const formData = new FormData();
  formData.append("username", userName);
  formData.append("mail", email);
  formData.append("password", password);
  formData.append("role_id", role);
  formData.append("token", tok);

  fetchadder(formData);
});

async function fetchadder(formData) {
  const response = await fetch(
    "https://ksapccmonitoring.in/kpi_app/superadmin/add",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();
  console.log(data);
  if (data.errflag == 0) {
    toastMessageElement.textContent = "New user added successfully!";
    toast.show();
  } else {
    toastMessageElement.textContent = "there is an error";
    toast.show();
  }
}

async function fetcheditor(formData) {
  // console.log(Object.fromEntries(formData));

  const response = await fetch(
    "https://ksapccmonitoring.in/kpi_app/superadmin/update",
    {
      method: "POST",
      body: formData,
    }
  );

  const data = await response.json();
  console.log(data);
  if (data.errflag == 0) {
    toastMessageElement.textContent = "User updated successfully!";
    toast.show();
  } else {
    toastMessageElement.textContent = "there is an error";
    toast.show();
  }
}

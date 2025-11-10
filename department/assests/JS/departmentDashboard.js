const tok = localStorage.getItem("authToken");
let gridApi;
let expandedRows = {};
let department;
let pendingRowData = [];

const gridOptions = {
  rowData: [],
  columnDefs: [
    {
      field: "kpis",
      headerName: "KPI NAME",
      width: 180,
      minWidth: 140,
      maxWidth: 220,
      flex: 0,
      tooltipField: "kpis",
      wrapText: false,
      autoHeight: false,
      cellRenderer: (params) => {
        const name = escapeHtml(params.data?.kpis || "Untitled KPI");
        const date = formatUpdatedAt(params.data?.updated_at);
        return `
          <div class="grid-primary-cell grid-primary-cell--compact" title="${name}">
            <span class="grid-primary-title" title="${name}">${name}</span>
            <span class="grid-subtitle" title="Last updated: ${date}">Last updated: ${date}</span>
          </div>
        `;
      },
    },
    {
      field: "baseline_Status",
      headerName: "BASELINE STATUS",
      minWidth: 170,
      tooltipField: "baseline_Status",
      cellRenderer: (params) => {
        const value = escapeHtml(
          params.data?.baseline_Status || "Not captured"
        );
        return `<span class="grid-pill">${value}</span>`;
      },
    },
    {
      field: "unit_of_measurement",
      headerName: "UNITS",
      minWidth: 140,
      tooltipField: "unit_of_measurement",
      cellRenderer: (params) => {
        const value = escapeHtml(params.data?.unit_of_measurement || "N/A");
        return `<span class="grid-chip">${value}</span>`;
      },
    },
    {
      field: "t5",
      headerName: "TARGET (5 YR)",
      minWidth: 150,
      tooltipField: "t5",
      cellRenderer: (params) => {
        return `<span class="grid-number">${formatNumericValue(
          params.data?.t5
        )}</span>`;
      },
    },
    {
      field: "coordinating_departments",
      headerName: "COORDINATING DEPARTMENT",
      minWidth: 220,
      tooltipField: "coordinating_departments",
      cellRenderer: (params) => {
        const cd = escapeHtml(
          params.data?.coordinating_departments || "No coordinators yet"
        );
        return `<span class="grid-text">${cd}</span>`;
      },
    },
    {
      field: "strategies",
      headerName: "STRATEGIES",
      minWidth: 240,
      tooltipField: "strategies",
      // Disable column filter specifically for the Strategies column
      filter: false,
      cellRenderer: (params) => {
        const strategies = escapeHtml(
          params.data?.strategies || "No strategies yet"
        );
        return `<span class="grid-text">${strategies}</span>`;
      },
    },
    {
      headerName: "ANNUAL TARGET",
      headerClass: "annual-target-header",
      children: [
        {
          field: "t1",
          headerName: "YR1",
          minWidth: 110,
          tooltipField: "t1",
          cellRenderer: (params) =>
            `<span class="grid-number">${formatNumericValue(
              params.data?.t1
            )}</span>`,
        },
        {
          field: "t2",
          headerName: "YR2",
          minWidth: 110,
          tooltipField: "t2",
          cellRenderer: (params) =>
            `<span class="grid-number">${formatNumericValue(
              params.data?.t2
            )}</span>`,
        },
        {
          field: "t3",
          headerName: "YR3",
          minWidth: 110,
          tooltipField: "t3",
          cellRenderer: (params) =>
            `<span class="grid-number">${formatNumericValue(
              params.data?.t3
            )}</span>`,
        },
        {
          field: "t4",
          headerName: "YR4",
          minWidth: 110,
          tooltipField: "t4",
          cellRenderer: (params) =>
            `<span class="grid-number">${formatNumericValue(
              params.data?.t4
            )}</span>`,
        },
        {
          field: "t5",
          headerName: "YR5",
          minWidth: 110,
          tooltipField: "t5",
          cellRenderer: (params) =>
            `<span class="grid-number">${formatNumericValue(
              params.data?.t5
            )}</span>`,
        },
      ],
    },
    {
      headerName: "TARGET ACHIEVED",
      headerClass: "annual-target-header",
      children: [
        {
          field: "y1",
          headerName: "YR1",
          minWidth: 110,
          tooltipField: "y1",
          cellRenderer: (params) =>
            `<span class="grid-number subtle">${formatNumericValue(
              params.data?.y1
            )}</span>`,
        },
        {
          field: "y2",
          headerName: "YR2",
          minWidth: 110,
          tooltipField: "y2",
          cellRenderer: (params) =>
            `<span class="grid-number subtle">${formatNumericValue(
              params.data?.y2
            )}</span>`,
        },
        {
          field: "y3",
          headerName: "YR3",
          minWidth: 110,
          tooltipField: "y3",
          cellRenderer: (params) =>
            `<span class="grid-number subtle">${formatNumericValue(
              params.data?.y3
            )}</span>`,
        },
        {
          field: "y4",
          headerName: "YR4",
          minWidth: 110,
          tooltipField: "y4",
          cellRenderer: (params) =>
            `<span class="grid-number subtle">${formatNumericValue(
              params.data?.y4
            )}</span>`,
        },
        {
          field: "y5",
          headerName: "YR5",
          minWidth: 110,
          tooltipField: "y5",
          cellRenderer: (params) =>
            `<span class="grid-number subtle">${formatNumericValue(
              params.data?.y5
            )}</span>`,
        },
      ],
    },
    {
      field: "id",
      headerName: "ACTIONS",
      minWidth: 160,
      pinned: "right",
      lockPinned: true,
      cellClass: "grid-action-cell",
      suppressMovable: true,
      cellRenderer: (params) => {
        const dataId = JSON.stringify(params.data || {}).replace(
          /"/g,
          "&quot;"
        );
        return `
          <button class="grid-action-btn" data-bs-toggle="modal" data-bs-target="#exampleModal" onclick="actionButton(${dataId})">
            <i class="bi bi-pencil-square"></i>
            <span>Update</span>
          </button>
        `;
      },
    },
  ],
  defaultColDef: {
    sortable: true,
    filter: "agTextColumnFilter",
    resizable: true,
    minWidth: 150,
    flex: 1,
    wrapHeaderText: true,
    autoHeaderHeight: true,
    wrapText: true,
    autoHeight: true,
    headerClass: "dashboard-grid-header",
    cellClass: "dashboard-grid-cell",
    suppressHeaderMenuButton: true,
    filterParams: {
      debounceMs: 150,
      buttons: ["reset"],
    },
  },
  suppressMenuHide: true,
  domLayout: "autoHeight",
  rowHeight: 72,
  headerHeight: 64,
  pagination: false,
  paginationPageSizeSelector: false,
  suppressPaginationPanel: true,
  suppressMovableColumns: true,
  alwaysShowHorizontalScroll: true,
  ensureDomOrder: true,
  animateRows: false,
  tooltipShowDelay: 0,
  tooltipHideDelay: 200,
  onGridReady: (params) => {
    gridApi = params.api;
    setGridRowData(pendingRowData);
    autoSizeColumns();
    bindGridInteractions();
  },
  onFirstDataRendered: () => {
    autoSizeColumns();
  },
};

let resizeTimeout;

function escapeHtml(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).replace(/[&<>"']/g, (char) => {
    const map = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return map[char] || char;
  });
}

function formatNumericValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return escapeHtml(value);
  }

  if (Number.isInteger(numericValue)) {
    return numericValue.toLocaleString();
  }

  return numericValue.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function formatPercentage(value) {
  if (value === null || value === undefined || value === "") {
    return "0.0";
  }

  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return "0.0";
  }

  if (Math.abs(numericValue) >= 1000) {
    return numericValue.toFixed(0);
  }

  return numericValue.toFixed(1);
}

function getPerformanceMeta(percentage) {
  const value = Number(percentage);
  if (Number.isNaN(value)) {
    return { tone: "neutral", icon: "bi-dash-lg" };
  }

  if (value >= 110) {
    return { tone: "positive", icon: "bi-arrow-up-right" };
  }

  if (value <= 90) {
    return { tone: "negative", icon: "bi-arrow-down-right" };
  }

  return { tone: "neutral", icon: "bi-activity" };
}

function getKpiTrendMeta(trendText) {
  const label = trendText ? String(trendText) : "Stable";
  const value = label.toLowerCase();

  if (value.includes("increase")) {
    return { tone: "positive", icon: "bi-arrow-up-right-circle-fill", label };
  }

  if (value.includes("decrease")) {
    return { tone: "negative", icon: "bi-arrow-down-right-circle-fill", label };
  }

  return { tone: "neutral", icon: "bi-dash-circle", label };
}

function applyQuickFilter(value) {
  if (!gridApi) {
    return;
  }

  if (typeof gridApi.setGridOption === "function") {
    gridApi.setGridOption("quickFilterText", value);
  } else if (typeof gridApi.setQuickFilter === "function") {
    gridApi.setQuickFilter(value);
  }
}

function setGridRowData(data) {
  if (!gridApi) {
    return;
  }

  const safeData = Array.isArray(data) ? data : [];

  if (typeof gridApi.setGridOption === "function") {
    gridApi.setGridOption("rowData", safeData);
  } else if (typeof gridApi.setRowData === "function") {
    gridApi.setRowData(safeData);
  }

  autoSizeColumns();
}

function autoSizeColumns() {
  if (!gridApi || typeof gridApi.getColumns !== "function") {
    return;
  }

  const columns = gridApi.getColumns();
  if (!columns || !columns.length) {
    return;
  }

  const columnIds = columns.map((column) => column.getId());
  if (typeof gridApi.autoSizeColumns === "function") {
    gridApi.autoSizeColumns(columnIds, false);
  }

  if (typeof gridApi.setColumnWidth === "function") {
    gridApi.setColumnWidth("kpis", 180);
  }

  const actionColumn = gridApi.getColumn("id");
  if (actionColumn && typeof gridApi.setColumnWidth === "function") {
    gridApi.setColumnWidth(actionColumn, 160);
  }
}

function bindGridInteractions() {
  const searchInput = document.getElementById("trackerSearch");
  if (searchInput && !searchInput.dataset.bound) {
    searchInput.addEventListener("input", (event) => {
      applyQuickFilter(event.target.value || "");
    });
    searchInput.dataset.bound = "true";
  }
}

window.addEventListener("resize", () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(autoSizeColumns, 200);
});

// Function to generate expanded row data
function generateExpandedData() {
  const expandedData = [];
  gridOptions.rowData.forEach((row) => {
    expandedData.push(row);

    // If the row is expanded, add child rows for annual targets and target achievements
    if (expandedRows[row.id]) {
      expandedData.push(
        {
          id: `${row.id}_annual_target`, // Unique ID for the child row
          KPI_name: "ANNUAL TARGET",
          baselineStatus: "",
          target_set: "",
          coordinate_department: "",
          strategies: "", // Placeholder if necessary
          annual_target: row.annual_target,
        },
        {
          id: `${row.id}_target_achieved`, // Unique ID for the child row
          KPI_name: "TARGET ACHIEVED",
          baselineStatus: "",
          target_set: "",
          coordinate_department: "",
          strategies: "", // Placeholder if necessary
          target_achieved: row.target_achieved,
        }
      );
    }
  });
  return expandedData;
}

document.addEventListener("DOMContentLoaded", function () {
  // const gridDiv = document.querySelector("#myGrid");
  // gridApi = agGrid.createGrid(gridDiv, gridOptions);
  fetchDepartmentPerformanceForDept(tok);
  fetchDepartmentkpitracker();
  initializeConfirmModal();
  initializeModalSaveButton();
  initializeTooltips(document);
  // const myModal = new bootstrap.Modal(document.getElementById("exampleModal"));
  // myModal.show();
});

function scroller(table) {
  // console.log(table);
  // console.log("scroller");
  let isMouseDown = false;
  let startX, scrollLeft;

  // Mouse down event
  table.addEventListener("mousedown", (e) => {
    console.log("mouse down");
    isMouseDown = true;
    startX = e.pageX - table.offsetLeft;
    scrollLeft = table.scrollLeft;
    // table.style.cursor = "grabbing";
  });

  // Mouse up event
  document.addEventListener("mouseup", () => {
    console.log("mouse up");
    isMouseDown = false;
    // table.style.cursor = "grab";
  });

  // Mouse move event to handle dragging
  table.addEventListener("mousemove", (e) => {
    if (!isMouseDown) return;
    e.preventDefault();
    const x = e.pageX - table.offsetLeft;
    const walk = (x - startX) * 2;
    table.scrollLeft = scrollLeft - walk;
    console.log(walk, scrollLeft);
  });
}

// fetch department kpi tracker
async function fetchDepartmentkpitracker() {
  const response = await fetch(
    `https://ksapccmonitoring.in/kpi_app/get_dep_kpi_tracker/${tok}`
  );

  const res = await fetch(
    `https://ksapccmonitoring.in/kpi_app/get_dep_dashboard/${tok}`
  );
  const dataTracker = await response.json();
  const data = await res.json();
  // console.log(dataTracker);
  department = dataTracker.department_name;
  // console.log(department);
  // console.log("assigned kpi:", data);
  showkpi(data);

  initializeGrid(dataTracker);

  document.getElementById(
    "hello"
  ).innerHTML = `👋 Hello ${dataTracker.department_name}, Welcome to KSAPCC Monitoring`;
}

function initializeGrid(data) {
  const gridDiv = document.querySelector("#myGrid");
  if (!gridDiv) {
    return;
  }

  pendingRowData = Array.isArray(data?.kpi_data) ? data.kpi_data : [];

  if (!gridApi) {
    gridOptions.rowData = pendingRowData;
    agGrid.createGrid(gridDiv, gridOptions);
    return;
  }

  setGridRowData(pendingRowData);
}

// department kpis
function showkpi(data) {
  const box = document.getElementById("cards");
  if (!box) {
    return;
  }

  box.innerHTML = "";

  const kpis = Array.isArray(data?.kpi_data) ? data.kpi_data : [];
  if (!kpis.length) {
    box.innerHTML = `
      <div class="kpi-card kpi-card--empty">
        <div class="kpi-card__title">No KPIs assigned yet</div>
        <div class="kpi-card__footer">
          <span class="kpi-card__update">Updates will appear once KPIs are configured.</span>
        </div>
      </div>
    `;
    return;
  }

  kpis.forEach((kpi, index) => {
    const trendMeta = getKpiTrendMeta(kpi?.percentage_changes);
    const title = escapeHtml(kpi?.kpis || `KPI ${index + 1}`);
    const updatedOn = formatUpdatedAt(kpi?.updated_at);
    const updateMessage =
      updatedOn === "—" ? "No updates yet" : `Updated ${updatedOn}`;

    const card = document.createElement("article");
    card.className = `kpi-card kpi-card--${trendMeta.tone}`;
    card.innerHTML = `
      <div class="kpi-card__header">
        <span class="kpi-card__badge">KPI ${index + 1}</span>
        <span class="kpi-card__trend">
          <i class="bi ${trendMeta.icon}"></i>
          ${escapeHtml(trendMeta.label)}
        </span>
      </div>
      <h3 class="kpi-card__title">${title}</h3>
      <div class="kpi-card__footer">
        <span class="kpi-card__update"><i class="bi bi-clock-history"></i> ${escapeHtml(
          updateMessage
        )}</span>
      </div>
    `;

    box.appendChild(card);
  });
}

function formatUpdatedAt(dateString) {
  if (!dateString) {
    return "—";
  }

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  const day = String(date.getUTCDate()).padStart(2, "0");
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const year = date.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

// for edits in kpi tracker
function toggleEditable(elementId) {
  const textarea = document.getElementById(elementId);
  if (textarea.hasAttribute("readonly")) {
    textarea.removeAttribute("readonly");
    textarea.style.border = "1px solid #0F6609";
    textarea.focus();
  } else {
    textarea.setAttribute("readonly", "true");
    textarea.style.border = "none";
  }
}

const YEAR_CONFIG = [
  { key: "y1", targetKey: "t1", label: "FY 2024-2025" },
  { key: "y2", targetKey: "t2", label: "FY 2025-2026" },
  { key: "y3", targetKey: "t3", label: "FY 2026-2027" },
  { key: "y4", targetKey: "t4", label: "FY 2027-2028" },
  { key: "y5", targetKey: "t5", label: "FY 2028-2029" },
];

let activeKpiContext = null;
let pendingUpdatePayload = null;
let pendingUpdateSummary = "";
let confirmModalInstance = null;

function sanitizeText(value) {
  if (value === null || value === undefined) {
    return "";
  }
  return String(value).trim();
}

function hasAchievementValue(value) {
  if (value === null || value === undefined) {
    return false;
  }
  const strValue = String(value).trim();
  return strValue !== "";
}

function formatSummaryValue(value) {
  if (value === null || value === undefined || value === "") {
    return "—";
  }
  const numericValue = Number(value);
  if (Number.isNaN(numericValue)) {
    return String(value);
  }
  return formatNumericValue(numericValue);
}

function buildKpiContext(row) {
  return {
    row,
    original: {
      strategies: sanitizeText(row.strategies),
      coordinating_departments: sanitizeText(row.coordinating_departments),
      notes: YEAR_CONFIG.map((cfg) => sanitizeText(row[`${cfg.key}remarks`])),
    },
  };
}

function populateUpdateModal(context) {
  const { row } = context;
  const titleEl = document.getElementById("modalKpiTitle");
  const unitEl = document.getElementById("modalKpiUnit");
  const baselineEl = document.getElementById("modalBaseline");
  const targetEl = document.getElementById("modalFiveYearTarget");
  const lastUpdatedEl = document.getElementById("modalLastUpdated");
  const coordinatingEl = document.getElementById("modalCoordinating");
  const strategiesEl = document.getElementById("modalStrategies");
  const headerTitleEl = document.getElementById("exampleModalLabel");

  const modalTitle = sanitizeText(row.kpis) || "—";

  if (titleEl) {
    titleEl.textContent = modalTitle;
  }
  if (headerTitleEl) {
    headerTitleEl.textContent = modalTitle;
  }
  if (unitEl) {
    unitEl.textContent = sanitizeText(row.unit_of_measurement) || "—";
  }
  if (baselineEl) {
    baselineEl.textContent = formatNumericValue(row.baseline_Status);
  }
  if (targetEl) {
    targetEl.textContent = formatNumericValue(row.t5);
  }
  if (lastUpdatedEl) {
    lastUpdatedEl.textContent = formatUpdatedAt(row.updated_at);
  }
  if (coordinatingEl) {
    coordinatingEl.value = context.original.coordinating_departments;
  }
  if (strategiesEl) {
    strategiesEl.value = context.original.strategies;
  }

  renderYearRows(context);
  injectWindowHint();
  clearModalFeedback();
}

function injectWindowHint() {
  const hintContainerId = "editWindowHint";
  let hintEl = document.getElementById(hintContainerId);
  const modalBody = document.querySelector("#exampleModal .modal-body");
  if (!modalBody) return;
  if (!hintEl) {
    hintEl = document.createElement("div");
    hintEl.id = hintContainerId;
    hintEl.className = "alert alert-secondary py-2 px-3 small";
    modalBody.prepend(hintEl);
  }
  hintEl.innerHTML = `Editable for <strong>7 days</strong> after the first submission of a year's attainment.<br/>Within that window click <em>Change</em> to adjust the value; after it closes the value becomes locked.`;
}

function renderYearRows(context) {
  const grid = document.getElementById("modalYearGrid");
  if (!grid) {
    return;
  }

  const { row } = context;
  grid.innerHTML = "";

  const firstPendingIndex = YEAR_CONFIG.findIndex(
    (cfg) => !hasAchievementValue(row[cfg.key])
  );

  YEAR_CONFIG.forEach((cfg, index) => {
    const rowEl = document.createElement("div");
    rowEl.className = "kpi-year-row";
    rowEl.dataset.yearKey = cfg.key;

    const metaCell = document.createElement("div");
    metaCell.className = "kpi-year-cell kpi-year-cell--meta";
    const labelEl = document.createElement("span");
    labelEl.className = "kpi-year-label";
    labelEl.textContent = cfg.label;
    const targetEl = document.createElement("span");
    targetEl.className = "kpi-year-target";
    targetEl.textContent = `Target: ${formatNumericValue(row[cfg.targetKey])}`;
    metaCell.append(labelEl, targetEl);

    const achievementCell = document.createElement("div");
    achievementCell.className = "kpi-year-cell kpi-year-cell--achievement";
    const achievementLabel = document.createElement("label");
    achievementLabel.htmlFor = `modalAchieved-${cfg.key}`;
    achievementLabel.textContent = "Achieved to date";
    achievementCell.appendChild(achievementLabel);

    const hasSubmission = hasAchievementValue(row[cfg.key]);
    const isEditable = !hasSubmission && firstPendingIndex === index;

    if (hasSubmission) {
      // Show current value
      const valueEl = document.createElement("span");
      valueEl.className = "kpi-year-value";
      valueEl.id = `modalAchievedDisplay-${cfg.key}`;
      valueEl.textContent = formatNumericValue(row[cfg.key]);
      achievementCell.appendChild(valueEl);

      // Prepare a hidden input for re-update path (enabled via "Change" within 7 days)
      const inputEl = document.createElement("input");
      inputEl.type = "number";
      inputEl.step = "any";
      inputEl.id = `modalAchieved-${cfg.key}`;
      inputEl.className = "form-control";
      inputEl.placeholder = "Enter cumulative attainment";
      inputEl.value = sanitizeText(row[cfg.key]);
      inputEl.style.display = "none";
      inputEl.disabled = true;
      achievementCell.appendChild(inputEl);

      // Show a Change button only if within 7-day window from first update
      const updatedAtKey = `${cfg.key}_updated_at`;
      const firstUpdatedAtRaw = row[updatedAtKey];
      const canReupdate = isWithinSevenDays(firstUpdatedAtRaw);
      if (canReupdate) {
        const changeBtn = document.createElement("button");
        changeBtn.type = "button";
        changeBtn.className = "btn btn-link btn-sm p-0 ms-2";
        changeBtn.textContent = "Change";
        changeBtn.title = "Edit this year's value (7-day window)";
        changeBtn.addEventListener("click", () => {
          // Disable other inputs and hide their editable states
          YEAR_CONFIG.forEach((c) => {
            const otherInput = document.getElementById(
              `modalAchieved-${c.key}`
            );
            const otherDisplay = document.getElementById(
              `modalAchievedDisplay-${c.key}`
            );
            if (otherInput && c.key !== cfg.key) {
              otherInput.disabled = true;
              otherInput.style.display = "none";
            }
            if (otherDisplay && c.key !== cfg.key) {
              otherDisplay.style.display = "";
            }
          });

          // Enable this input and swap display
          valueEl.style.display = "none";
          inputEl.style.display = "";
          inputEl.disabled = false;
          inputEl.focus();
          changeBtn.disabled = true;
        });
        achievementCell.appendChild(changeBtn);

        // Remaining time indicator next to Change
        const remainingEl = document.createElement("small");
        remainingEl.className = "edit-window-remaining text-muted ms-2";
        remainingEl.id = `remaining-${cfg.key}`;
        achievementCell.appendChild(remainingEl);
        updateRemainingCountdown(cfg.key, firstUpdatedAtRaw);
      } else if (firstUpdatedAtRaw) {
        // Window expired hint (subtle)
        const expiredEl = document.createElement("small");
        expiredEl.className = "edit-window-expired text-muted ms-2";
        expiredEl.textContent = "Edit window closed";
        achievementCell.appendChild(expiredEl);
      }
    } else {
      const inputEl = document.createElement("input");
      inputEl.type = "number";
      inputEl.step = "any";
      inputEl.id = `modalAchieved-${cfg.key}`;
      inputEl.className = "form-control";
      inputEl.placeholder = "Enter cumulative attainment";
      inputEl.disabled = !isEditable;
      achievementCell.appendChild(inputEl);

      if (!isEditable) {
        const helperEl = document.createElement("small");
        helperEl.className = "kpi-year-helper";
        helperEl.textContent = "Awaiting previous year submission";
        achievementCell.appendChild(helperEl);
      }
    }

    const notesCell = document.createElement("div");
    notesCell.className = "kpi-year-cell kpi-year-cell--notes";
    const notesLabel = document.createElement("label");
    notesLabel.htmlFor = `modalNote-${cfg.key}`;
    notesLabel.textContent = "Notes";
    const notesArea = document.createElement("textarea");
    notesArea.id = `modalNote-${cfg.key}`;
    notesArea.className = "form-control";
    notesArea.rows = 2;
    notesArea.placeholder = "Add context (optional)";
    notesArea.value = sanitizeText(row[`${cfg.key}remarks`]);
    notesCell.append(notesLabel, notesArea);

    rowEl.append(metaCell, achievementCell, notesCell);
    grid.appendChild(rowEl);
  });
}

function clearModalFeedback() {
  const feedback = document.getElementById("modalFeedback");
  if (!feedback) {
    return;
  }
  feedback.hidden = true;
  feedback.textContent = "";
  feedback.className = "kpi-modal__feedback";
}

function showModalFeedback(type, message) {
  const feedback = document.getElementById("modalFeedback");
  if (!feedback) {
    return;
  }
  clearModalFeedback();
  feedback.hidden = false;
  feedback.textContent = message;
  const toneClass =
    type === "success"
      ? "alert-success"
      : type === "info"
      ? "alert-info"
      : "alert-danger";
  feedback.classList.add("alert", toneClass);
}

function collectModalChanges() {
  if (!activeKpiContext) {
    return { error: "No KPI selected." };
  }

  const context = activeKpiContext;
  const formData = new FormData();
  formData.append("id", context.row.kpi_id);
  formData.append("token", tok);

  const strategiesInput = document.getElementById("modalStrategies");
  const coordinatingInput = document.getElementById("modalCoordinating");
  const strategiesValue = strategiesInput
    ? sanitizeText(strategiesInput.value)
    : "";
  const coordinatingValue = coordinatingInput
    ? sanitizeText(coordinatingInput.value)
    : "";

  formData.append("strategies", strategiesValue);
  formData.append("coordinating_departments", coordinatingValue);

  const notesChanges = [];
  let yearUpdate = null;

  YEAR_CONFIG.forEach((cfg, index) => {
    const noteInput = document.getElementById(`modalNote-${cfg.key}`);
    const noteValue = noteInput ? sanitizeText(noteInput.value) : "";
    formData.append(`${cfg.key}remarks`, noteValue);

    if (noteValue !== context.original.notes[index]) {
      notesChanges.push(cfg.label);
    }

    const achievementInput = document.getElementById(
      `modalAchieved-${cfg.key}`
    );
    if (
      achievementInput &&
      !achievementInput.disabled &&
      sanitizeText(achievementInput.value)
    ) {
      if (yearUpdate) {
        yearUpdate = {
          error: "Only one year's attainment can be updated at a time.",
        };
      } else {
        const value = sanitizeText(achievementInput.value);
        yearUpdate = { key: cfg.key, label: cfg.label, value };
        formData.append(cfg.key, value);
      }
    }
  });

  if (yearUpdate && yearUpdate.error) {
    return { error: yearUpdate.error };
  }

  const changesSummary = [];

  if (yearUpdate) {
    changesSummary.push(
      `${yearUpdate.label} attainment → ${formatSummaryValue(yearUpdate.value)}`
    );
  }

  if (coordinatingValue !== context.original.coordinating_departments) {
    changesSummary.push("Co-ordinating departments");
  }

  if (strategiesValue !== context.original.strategies) {
    changesSummary.push("Strategies");
  }

  if (notesChanges.length) {
    changesSummary.push(`Notes for ${notesChanges.join(", ")}`);
  }

  const hasChanges = changesSummary.length > 0;

  return {
    formData,
    summary: changesSummary.join("; "),
    hasChanges,
  };
}

function isWithinSevenDays(dateString) {
  if (!dateString) return false;
  const date = parseFlexibleTimestamp(dateString);
  if (!date) return false;
  const now = new Date();
  const msDiff = now.getTime() - date.getTime();
  const sevenDaysMs = 7 * 24 * 60 * 60 * 1000;
  return msDiff >= 0 && msDiff < sevenDaysMs;
}

function msUntilWindowEnds(dateString) {
  if (!dateString) return 0;
  const start = parseFlexibleTimestamp(dateString);
  if (!start) return 0;
  const end = new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  return end.getTime() - Date.now();
}

function humanRemaining(ms) {
  if (ms <= 0) return "0d 0h";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes - days * 24 * 60) / 60);
  return `${days}d ${hours}h`;
}

function updateRemainingCountdown(yearKey, firstUpdatedAtRaw) {
  const el = document.getElementById(`remaining-${yearKey}`);
  if (!el) return;
  const msLeft = msUntilWindowEnds(firstUpdatedAtRaw);
  if (msLeft <= 0) {
    el.textContent = "Edit window closed";
    el.classList.add("text-decoration-line-through");
    return;
  }
  el.textContent = `${humanRemaining(msLeft)} left to edit`;
  // Update every hour for low resource usage
  setTimeout(
    () => updateRemainingCountdown(yearKey, firstUpdatedAtRaw),
    60 * 60 * 1000
  );
}

function parseFlexibleTimestamp(ts) {
  if (!ts) return null;
  // If already a Date
  if (ts instanceof Date) return ts;
  const raw = String(ts).trim();
  // Try native parse
  let d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d;
  // Replace space with T
  d = new Date(raw.replace(" ", "T"));
  if (!Number.isNaN(d.getTime())) return d;
  // Append Z for UTC interpretation
  d = new Date(raw.replace(" ", "T") + "Z");
  if (!Number.isNaN(d.getTime())) return d;
  return null;
}

function handleSaveClick(event) {
  if (event) {
    event.preventDefault();
  }

  clearModalFeedback();
  const result = collectModalChanges();

  if (result.error) {
    showModalFeedback("danger", result.error);
    return;
  }

  if (!result.hasChanges) {
    showModalFeedback(
      "info",
      "No changes detected. Update at least one field before submitting."
    );
    return;
  }

  pendingUpdatePayload = result.formData;
  pendingUpdateSummary = result.summary;

  const summaryEl = document.getElementById("confirmUpdateSummary");
  if (summaryEl) {
    summaryEl.textContent =
      result.summary || "Your changes are ready to be submitted.";
  }

  if (!confirmModalInstance) {
    initializeConfirmModal();
  }

  if (confirmModalInstance) {
    confirmModalInstance.show();
  }
}

async function handleConfirmUpdate() {
  const confirmBtn = document.getElementById("confirmUpdateBtn");
  if (!pendingUpdatePayload) {
    if (confirmModalInstance) {
      confirmModalInstance.hide();
    }
    return;
  }

  if (confirmBtn) {
    confirmBtn.disabled = true;
  }

  try {
    let data;
    // Determine if this is a re-update (editing existing year within 7-day window)
    let reupdate = false;
    let selectedYearKey = null;
    let selectedValue = null;
    if (pendingUpdatePayload) {
      // Identify which year is being updated by checking enabled inputs
      for (const cfg of YEAR_CONFIG) {
        const input = document.getElementById(`modalAchieved-${cfg.key}`);
        if (input && !input.disabled && sanitizeText(input.value)) {
          selectedYearKey = cfg.key;
          selectedValue = sanitizeText(input.value);
          break;
        }
      }
      if (selectedYearKey) {
        const hadSubmission = hasAchievementValue(
          activeKpiContext.row[selectedYearKey]
        );
        const withinWindow = isWithinSevenDays(
          activeKpiContext.row[`${selectedYearKey}_updated_at`]
        );
        reupdate = hadSubmission && withinWindow;
      }
    }

    if (reupdate && selectedYearKey) {
      // Use special endpoint that does not change updated_at timestamps
      const fd = new FormData();
      fd.append("id", activeKpiContext.row.kpi_id);
      fd.append("token", tok);
      fd.append("year", selectedYearKey);
      fd.append("value", selectedValue);
      // Attach remarks for this year if present
      const noteInput = document.getElementById(`modalNote-${selectedYearKey}`);
      if (noteInput) {
        fd.append("remarks", sanitizeText(noteInput.value));
      }
      const response = await fetch(
        `https://ksapccmonitoring.in/kpi_app/reupdate_dep_kpi_year`,
        {
          method: "POST",
          body: fd,
        }
      );
      data = await response.json();
    } else {
      // Fallback to original endpoint (first submission path)
      const response = await fetch(
        `https://ksapccmonitoring.in/kpi_app/update_dep_kpi`,
        {
          method: "POST",
          body: pendingUpdatePayload,
        }
      );
      data = await response.json();
    }

    if (confirmModalInstance) {
      confirmModalInstance.hide();
    }

    if (data.errflag === 0) {
      const modal = bootstrap.Modal.getInstance(
        document.getElementById("exampleModal")
      );
      if (modal) {
        modal.hide();
      }

      pendingUpdatePayload = null;
      pendingUpdateSummary = "";
      activeKpiContext = null;

      await refreshDashboardData();
      await fetchDepartmentPerformanceForDept(tok);
    } else {
      showModalFeedback(
        "danger",
        data.message || "Unable to update the KPI. Please try again."
      );
    }
  } catch (error) {
    console.error("Error updating KPI:", error);
    if (confirmModalInstance) {
      confirmModalInstance.hide();
    }
    showModalFeedback(
      "danger",
      "Unexpected error while updating the KPI. Please try again."
    );
  } finally {
    if (confirmBtn) {
      confirmBtn.disabled = false;
    }
  }
}

function initializeConfirmModal() {
  const modalElement = document.getElementById("confirmUpdateModal");
  if (!modalElement) {
    return;
  }

  confirmModalInstance = bootstrap.Modal.getOrCreateInstance(modalElement);
  const confirmBtn = document.getElementById("confirmUpdateBtn");
  if (confirmBtn && !confirmBtn.dataset.bound) {
    confirmBtn.addEventListener("click", handleConfirmUpdate);
    confirmBtn.dataset.bound = "true";
  }

  modalElement.addEventListener("hidden.bs.modal", () => {
    pendingUpdatePayload = null;
    pendingUpdateSummary = "";
    const confirmButton = document.getElementById("confirmUpdateBtn");
    if (confirmButton) {
      confirmButton.disabled = false;
    }
  });
}

function initializeModalSaveButton() {
  const button = document.getElementById("saveChanges");
  if (button && !button.dataset.bound) {
    button.addEventListener("click", handleSaveClick);
    button.dataset.bound = "true";
  }
}

function initializeTooltips(scope = document) {
  const tooltipTriggerList = [].slice.call(
    scope.querySelectorAll('[data-bs-toggle="tooltip"]')
  );
  tooltipTriggerList.forEach((tooltipTriggerEl) => {
    bootstrap.Tooltip.getOrCreateInstance(tooltipTriggerEl);
  });
}

function openKpiUpdateModal(row) {
  activeKpiContext = buildKpiContext(row);
  pendingUpdatePayload = null;
  pendingUpdateSummary = "";
  populateUpdateModal(activeKpiContext);
  initializeTooltips(document.getElementById("kpiModal"));
}

function renderPerformanceCards(performanceData) {
  const container = document.getElementById("department-performance-cards");
  if (!container) {
    return;
  }

  container.innerHTML = "";

  if (!Array.isArray(performanceData) || performanceData.length === 0) {
    container.innerHTML = `
      <div class="performance-card performance-card--empty">
        <div class="performance-card__body">
          <span class="performance-card__name">No performance data yet</span>
          <span class="performance-card__caption">Approved departments will appear here once updates are submitted.</span>
        </div>
      </div>
    `;
    return;
  }

  performanceData.forEach((dept) => {
    const departmentName = dept.department_name || "Unnamed department";
    const sanitizedName = escapeHtml(departmentName);
    const percentage = Number(dept.average_performance_percentage ?? 0);
    const formattedPercentage = formatPercentage(percentage);
    const diffValue = Number.isNaN(percentage) ? 0 : percentage - 100;
    const formattedDiff = `${diffValue >= 0 ? "+" : ""}${formatPercentage(
      diffValue
    )} pts vs target`;
    const kpiSampleSize = Number.isFinite(Number(dept.kpi_sample_size))
      ? Number(dept.kpi_sample_size)
      : 0;
    const pendingCount = Number.isFinite(Number(dept.pending_kpi_count))
      ? Number(dept.pending_kpi_count)
      : 0;

    let kpiSampleLabel =
      kpiSampleSize > 0
        ? `${kpiSampleSize.toLocaleString()} KPI${
            kpiSampleSize === 1 ? "" : "s"
          }`
        : "No KPI submissions yet";

    if (pendingCount > 0) {
      const pendingLabel = `${pendingCount} pending`;
      kpiSampleLabel =
        kpiSampleSize > 0
          ? `${kpiSampleLabel} • ${pendingLabel}`
          : pendingLabel;
    }

    const meta = getPerformanceMeta(percentage);

    const card = document.createElement("article");
    card.className = `performance-card performance-card--${meta.tone}`;
    card.title = `${departmentName}: ${formattedPercentage}% average attainment`;
    card.innerHTML = `
      <div class="performance-card__header">
        <span class="performance-card__name">${sanitizedName}</span>
        <span class="performance-card__tone">
          <i class="bi ${meta.icon}"></i>
        </span>
      </div>
      <div class="performance-card__body">
        <div class="performance-card__stat">
          <span class="performance-card__value">${formattedPercentage}%</span>
          <span class="performance-card__caption">Average attainment</span>
        </div>
        <div class="performance-card__insight">
          <span class="performance-card__delta">${formattedDiff}</span>
          <span class="performance-card__kpis">${kpiSampleLabel}</span>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}

// Add this new function to refresh data
async function refreshDashboardData() {
  console.log("=== REFRESHING DASHBOARD DATA ===");
  try {
    // Clear existing cards
    document.getElementById("cards").innerHTML = "";
    console.log("Cards cleared");

    // Refetch data
    console.log("Fetching new data...");
    const response = await fetch(
      `https://ksapccmonitoring.in/kpi_app/get_dep_kpi_tracker/${tok}`
    );

    const res = await fetch(
      `https://ksapccmonitoring.in/kpi_app/get_dep_dashboard/${tok}`
    );

    const dataTracker = await response.json();
    const data = await res.json();

    console.log("New data fetched:", dataTracker, data);

    // Update department variable
    department = dataTracker.department_name;

    // Refresh cards
    showkpi(data);
    console.log("Cards refreshed");

    // Update grid data
    pendingRowData = Array.isArray(dataTracker.kpi_data)
      ? dataTracker.kpi_data
      : [];

    if (gridApi) {
      setGridRowData(pendingRowData);
      console.log("Grid updated");
    } else {
      console.log("Grid API not found");
    }

    console.log("=== REFRESH COMPLETE ===");
  } catch (error) {
    console.error("Error refreshing dashboard data:", error);
  }
}

async function fetchDepartmentPerformanceForDept(tok) {
  try {
    const response = await fetch(
      `https://ksapccmonitoring.in/kpi_app/superadmin_dashboard/department_performance/${tok}`
    );
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    console.log("Performance Data Received:", data);

    if (data.errflag === 0) {
      // Use the correct field name from API response
      renderPerformanceCards(data.performance_data); // Changed from performancedata
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

function actionButton(rowId) {
  openKpiUpdateModal(rowId);
}

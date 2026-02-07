const sheetConfig = {
  sheetId: "YOUR_SHEET_ID",
  sheetName: "Sheet1",
  refreshIntervalMs: 10000,
};

const statusEl = document.getElementById("status");
const refreshButton = document.getElementById("refreshButton");
const lastUpdatedEl = document.getElementById("lastUpdated");
const refreshIntervalEl = document.getElementById("refreshInterval");
const tableHead = document.querySelector("#sheetTable thead");
const tableBody = document.querySelector("#sheetTable tbody");

refreshIntervalEl.textContent = Math.round(sheetConfig.refreshIntervalMs / 1000);

const buildSheetUrl = () => {
  const base = `https://docs.google.com/spreadsheets/d/${sheetConfig.sheetId}/gviz/tq`;
  const params = new URLSearchParams({
    tqx: "out:json",
    sheet: sheetConfig.sheetName,
  });
  return `${base}?${params.toString()}`;
};

const parseVisualizationResponse = (text) => {
  const jsonText = text
    .replace(/^\/\/\s*google\.visualization\.Query\.setResponse\(/, "")
    .replace(/\);\s*$/, "");
  return JSON.parse(jsonText);
};

const renderTable = (columns, rows) => {
  tableHead.innerHTML = "";
  tableBody.innerHTML = "";

  const headerRow = document.createElement("tr");
  columns.forEach((column) => {
    const th = document.createElement("th");
    th.textContent = column.label || column.id || "Column";
    headerRow.appendChild(th);
  });
  tableHead.appendChild(headerRow);

  rows.forEach((row) => {
    const tr = document.createElement("tr");
    row.c.forEach((cell) => {
      const td = document.createElement("td");
      td.textContent = cell?.f ?? cell?.v ?? "";
      tr.appendChild(td);
    });
    tableBody.appendChild(tr);
  });
};

const setStatus = (message, isError = false) => {
  statusEl.textContent = message;
  statusEl.style.color = isError ? "#d0454c" : "";
};

const updateSheet = async () => {
  if (sheetConfig.sheetId === "YOUR_SHEET_ID") {
    setStatus("Add your Sheet ID in app.js to begin.", true);
    return;
  }

  setStatus("Refreshing data…");
  try {
    const response = await fetch(buildSheetUrl(), {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`Request failed with ${response.status}`);
    }

    const text = await response.text();
    const data = parseVisualizationResponse(text);
    renderTable(data.table.cols, data.table.rows);

    const now = new Date();
    lastUpdatedEl.textContent = `Last updated: ${now.toLocaleTimeString()}`;
    setStatus("Up to date");
  } catch (error) {
    setStatus(`Unable to refresh: ${error.message}`, true);
  }
};

refreshButton.addEventListener("click", () => {
  updateSheet();
});

updateSheet();
setInterval(updateSheet, sheetConfig.refreshIntervalMs);

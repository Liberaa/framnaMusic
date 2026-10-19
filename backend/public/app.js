const linkForm = document.querySelector("#link-form");
const linkMessage = document.querySelector("#link-message");
const employeeList = document.querySelector("#employee-list");
const listMessage = document.querySelector("#list-message");
const rowTemplate = document.querySelector("#employee-row");
const checkinForm = document.querySelector("#checkin-form");
const checkinMessage = document.querySelector("#checkin-message");

// Skickar ett anrop till API:et. Kastar ett fel med serverns felmeddelande om något går fel.
async function api(method, path, body) {
  const response = await fetch(path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error ?? "Något gick fel");
  }
  return data;
}

function showMessage(element, text, isError) {
  element.textContent = text;
  element.className = isError ? "message error" : "message success";
}

// Skapar en tabellrad från mallen i index.html
function createRow(employee) {
  const row = rowTemplate.content.cloneNode(true);
  const songInput = row.querySelector("input");

  row.querySelector(".name").textContent = employee.name;
  row.querySelector(".tag").textContent = employee.tagId;
  songInput.value = employee.song;

  row.querySelector("button").addEventListener("click", async () => {
    try {
      const updated = await api("PATCH", `/employees/${employee.id}`, { song: songInput.value });
      showMessage(listMessage, `${updated.name} har nu låten ${updated.song}`, false);
    } catch (error) {
      showMessage(listMessage, error.message, true);
    }
  });

  return row;
}

async function loadEmployees() {
  try {
    const employees = await api("GET", "/employees");
    employeeList.replaceChildren(...employees.map(createRow));
  } catch (error) {
    showMessage(listMessage, error.message, true);
  }
}

linkForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const { name, tagId, song } = Object.fromEntries(new FormData(linkForm));

  try {
    const employee = await api("POST", "/employees", { name, tagId, song });
    showMessage(linkMessage, `${employee.name} är nu länkad till kortet ${employee.tagId}`, false);
    linkForm.reset();
    loadEmployees();
  } catch (error) {
    showMessage(linkMessage, error.message, true);
  }
});

checkinForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  const { tagId } = Object.fromEntries(new FormData(checkinForm));

  try {
    const result = await api("POST", "/checkin", { tagId });
    showMessage(checkinMessage, `${result.message} Spelar: ${result.song}`, false);
  } catch (error) {
    showMessage(checkinMessage, error.message, true);
  }
});

loadEmployees();

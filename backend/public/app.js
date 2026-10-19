const linkForm = document.querySelector("#link-form");
const linkMessage = document.querySelector("#link-message");
const employeeList = document.querySelector("#employee-list");
const employeeCount = document.querySelector("#employee-count");
const listMessage = document.querySelector("#list-message");
const rowTemplate = document.querySelector("#employee-row");
const checkinForm = document.querySelector("#checkin-form");
const checkinMessage = document.querySelector("#checkin-message");
const nowPlaying = document.querySelector("#now-playing");

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

// "Anna Svensson" -> "AS"
function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

// Samma namn ger alltid samma färg (en kulör mellan 0 och 359)
function hueFor(name) {
  let hash = 0;
  for (const char of name) {
    hash = (hash * 31 + char.charCodeAt(0)) % 360;
  }
  return hash;
}

function fillAvatar(element, name) {
  element.textContent = initials(name);
  element.style.setProperty("--hue", hueFor(name));
}

// Visar "Sparat ✓" på knappen en kort stund
function flashSaved(button) {
  button.textContent = "Sparat ✓";
  button.classList.add("saved");
  setTimeout(() => {
    button.textContent = "Spara";
    button.classList.remove("saved");
  }, 1500);
}

// Skapar en rad i listan från mallen i index.html
function createRow(employee) {
  const row = rowTemplate.content.cloneNode(true);
  const songForm = row.querySelector(".song-edit");

  fillAvatar(row.querySelector(".avatar"), employee.name);
  row.querySelector(".name").textContent = employee.name;
  row.querySelector(".tag").textContent = employee.tagId;
  songForm.song.value = employee.song;

  songForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    try {
      await api("PATCH", `/employees/${employee.id}`, { song: songForm.song.value });
      listMessage.textContent = "";
      flashSaved(songForm.querySelector("button"));
    } catch (error) {
      showMessage(listMessage, error.message, true);
    }
  });

  return row;
}

async function loadEmployees() {
  try {
    const employees = await api("GET", "/employees");
    employeeCount.textContent = employees.length;

    if (employees.length === 0) {
      const empty = document.createElement("li");
      empty.className = "empty";
      empty.textContent = "Inga kort länkade än.";
      employeeList.replaceChildren(empty);
      return;
    }

    employeeList.replaceChildren(...employees.map(createRow));
  } catch (error) {
    showMessage(listMessage, error.message, true);
  }
}

function showNowPlaying(result) {
  fillAvatar(nowPlaying.querySelector(".avatar"), result.name);
  nowPlaying.querySelector(".welcome").textContent = result.message;
  nowPlaying.querySelector(".now-playing-song").textContent = result.song;

  // Starta om animationen varje gång någon checkar in
  nowPlaying.hidden = false;
  nowPlaying.classList.remove("pop");
  void nowPlaying.offsetWidth;
  nowPlaying.classList.add("pop");
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
    checkinMessage.textContent = "";
    showNowPlaying(result);
  } catch (error) {
    nowPlaying.hidden = true;
    showMessage(checkinMessage, error.message, true);
  }
});

loadEmployees();

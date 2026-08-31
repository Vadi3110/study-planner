let tasks = [];
let currentFilter = "all";

const taskList = document.getElementById("taskList");
const emptyMsg = document.getElementById("emptyMsg");
const subjectInput = document.getElementById("subjectInput");
const taskInput = document.getElementById("taskInput");
const dateInput = document.getElementById("dateInput");
const priorityInput = document.getElementById("priorityInput");
const addBtn = document.getElementById("addBtn");
const totalCount = document.getElementById("totalCount");
const doneCount = document.getElementById("doneCount");
const pendingCount = document.getElementById("pendingCount");
const progressFill = document.getElementById("progressFill");
const progressText = document.getElementById("progressText");
const filterBtns = document.querySelectorAll(".filter-btn");
const todayEl = document.getElementById("today");

function loadTasks() {
  const stored = localStorage.getItem("studyPlannerTasks");
  if (stored) {
    tasks = JSON.parse(stored);
  }
}

function saveTasks() {
  localStorage.setItem("studyPlannerTasks", JSON.stringify(tasks));
}

function formatDate(dateStr) {
  if (!dateStr) return "";
  const options = { day: "numeric", month: "short" };
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString(undefined, options);
}

function setToday() {
  const options = { weekday: "long", day: "numeric", month: "long", year: "numeric" };
  todayEl.textContent = new Date().toLocaleDateString(undefined, options);
}

function addTask() {
  const subject = subjectInput.value.trim();
  const title = taskInput.value.trim();
  const date = dateInput.value;
  const priority = priorityInput.value;

  if (!title) {
    taskInput.focus();
    return;
  }

  tasks.push({
    id: Date.now(),
    subject: subject || "General",
    title: title,
    date: date,
    priority: priority,
    completed: false
  });

  subjectInput.value = "";
  taskInput.value = "";
  dateInput.value = "";
  priorityInput.value = "medium";
  subjectInput.focus();

  saveTasks();
  render();
}

function toggleTask(id) {
  const task = tasks.find(t => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    render();
  }
}

function deleteTask(id) {
  tasks = tasks.filter(t => t.id !== id);
  saveTasks();
  render();
}

function getFilteredTasks() {
  if (currentFilter === "pending") {
    return tasks.filter(t => !t.completed);
  }
  if (currentFilter === "completed") {
    return tasks.filter(t => t.completed);
  }
  return tasks;
}

function render() {
  const filtered = getFilteredTasks();
  taskList.innerHTML = "";

  filtered.forEach(task => {
    const li = document.createElement("li");
    li.className = "task" + (task.completed ? " completed" : "");
    li.setAttribute("data-priority", task.priority);

    const check = document.createElement("button");
    check.className = "task-check";
    check.addEventListener("click", () => toggleTask(task.id));

    const body = document.createElement("div");
    body.className = "task-body";

    const subjectEl = document.createElement("p");
    subjectEl.className = "task-subject";
    subjectEl.textContent = task.subject;

    const titleEl = document.createElement("p");
    titleEl.className = "task-title";
    titleEl.textContent = task.title;

    const meta = document.createElement("div");
    meta.className = "task-meta";

    const priorityLabel = document.createElement("span");
    priorityLabel.textContent = task.priority.charAt(0).toUpperCase() + task.priority.slice(1);
    meta.appendChild(priorityLabel);

    if (task.date) {
      const dateLabel = document.createElement("span");
      dateLabel.textContent = formatDate(task.date);
      meta.appendChild(dateLabel);
    }

    body.appendChild(subjectEl);
    body.appendChild(titleEl);
    body.appendChild(meta);

    const del = document.createElement("button");
    del.className = "task-delete";
    del.textContent = "\u00D7";
    del.setAttribute("aria-label", "Delete task");
    del.addEventListener("click", () => deleteTask(task.id));

    li.appendChild(check);
    li.appendChild(body);
    li.appendChild(del);

    taskList.appendChild(li);
  });

  emptyMsg.classList.toggle("show", filtered.length === 0);
  updateStats();
}

function updateStats() {
  const total = tasks.length;
  const done = tasks.filter(t => t.completed).length;
  const pending = total - done;
  const percent = total === 0 ? 0 : Math.round((done / total) * 100);

  totalCount.textContent = total;
  doneCount.textContent = done;
  pendingCount.textContent = pending;
  progressFill.style.width = percent + "%";
  progressText.textContent = percent + "% complete";
}

addBtn.addEventListener("click", addTask);

taskInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

subjectInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTask();
});

filterBtns.forEach(btn => {
  btn.addEventListener("click", () => {
    filterBtns.forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
    currentFilter = btn.getAttribute("data-filter");
    render();
  });
});

setToday();
loadTasks();
render();
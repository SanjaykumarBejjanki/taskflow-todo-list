// Get elements

const loginScreen = document.getElementById("loginScreen");
const appContainer = document.getElementById("appContainer");
const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");
const resetForm = document.getElementById("resetForm");
const usernameInput = document.getElementById("usernameInput");
const passwordInput = document.getElementById("passwordInput");
const signupUsernameInput = document.getElementById("signupUsernameInput");
const signupEmailInput = document.getElementById("signupEmailInput");
const signupPasswordInput = document.getElementById("signupPasswordInput");
const resetEmailInput = document.getElementById("resetEmailInput");
const resetPasswordInput = document.getElementById("resetPasswordInput");
const resetConfirmPasswordInput = document.getElementById("resetConfirmPasswordInput");
const rememberMeCheckbox = document.getElementById("rememberMe");
const userBadge = document.getElementById("userBadge");
const logoutBtn = document.getElementById("logoutBtn");
const authToggleButtons = document.querySelectorAll(".toggle-btn");
const authLinkButtons = document.querySelectorAll(".link-btn");
const loginView = document.getElementById("loginView");
const signupView = document.getElementById("signupView");
const resetView = document.getElementById("resetView");

const taskInput = document.getElementById("taskInput");
const categoryInput = document.getElementById("categoryInput");
const priorityInput = document.getElementById("priorityInput");
const dateInput = document.getElementById("dateInput");

const addTaskBtn = document.getElementById("addTaskBtn");

const taskList = document.getElementById("taskList");
const emptyState = document.getElementById("emptyState");

const totalTasks = document.getElementById("totalTasks");
const completedTasks = document.getElementById("completedTasks");
const pendingTasks = document.getElementById("pendingTasks");

const taskCount = document.getElementById("taskCount");
const deadlinePopup = document.getElementById("deadlinePopup");
const deadlinePopupText = document.getElementById("deadlinePopupText");
const closeDeadlinePopup = document.getElementById("closeDeadlinePopup");
const notificationBadge = document.getElementById("notificationBadge");

const searchInput = document.getElementById("searchInput");

const filterButtons = document.querySelectorAll(".filter-btn");
const statCards = document.querySelectorAll(".stat-card");

const themeBtn = document.getElementById("themeBtn");


// Login logic

const userStoreKey = "taskflow_users";

function getUsers() {
    try {
        const savedUsers = JSON.parse(localStorage.getItem(userStoreKey) || "[]");
        return Array.isArray(savedUsers) ? savedUsers : [];
    } catch {
        return [];
    }
}

function saveUsers(users) {
    localStorage.setItem(userStoreKey, JSON.stringify(users));
}

function setAuthView(view) {
    const views = {
        login: loginView,
        signup: signupView,
        reset: resetView
    };

    Object.entries(views).forEach(([key, element]) => {
        element.classList.toggle("hidden", key !== view);
    });

    authToggleButtons.forEach(button => {
        const active = button.dataset.authView === view;
        button.classList.toggle("active", active);
    });
}

function isLoggedIn() {
    return (
        localStorage.getItem("taskflow_logged_in") === "true" ||
        sessionStorage.getItem("taskflow_session_logged_in") === "true"
    );
}

function showApp() {
    const username = localStorage.getItem("taskflow_user") || "User";

    userBadge.textContent = username;
    loginScreen.classList.add("hidden");
    appContainer.classList.remove("hidden");
}

function showLogin() {
    userBadge.textContent = "User";
    loginScreen.classList.remove("hidden");
    appContainer.classList.add("hidden");
    setAuthView("login");
}

function persistLogin(rememberMe) {
    localStorage.setItem("taskflow_remember_me", String(rememberMe));

    if (rememberMe) {
        localStorage.setItem("taskflow_logged_in", "true");
        sessionStorage.removeItem("taskflow_session_logged_in");
    } else {
        localStorage.setItem("taskflow_logged_in", "false");
        sessionStorage.setItem("taskflow_session_logged_in", "true");
    }
}

function resetPasswordForm() {
    resetForm.reset();
    document.querySelectorAll(".toggle-password-btn").forEach(button => {
        const targetInput = document.getElementById(button.dataset.target);
        if (targetInput) {
            targetInput.type = "password";
            button.textContent = "Show";
        }
    });
}

loginForm.addEventListener("submit", event => {
    event.preventDefault();

    const usernameOrEmail = usernameInput.value.trim();
    const password = passwordInput.value.trim();
    const rememberMe = rememberMeCheckbox.checked;

    if (!usernameOrEmail || !password) {
        alert("Please enter both username/email and password.");
        return;
    }

    const users = getUsers();
    const user = users.find(item => {
        const target = usernameOrEmail.toLowerCase();
        return (
            item.username.toLowerCase() === target ||
            item.email.toLowerCase() === target
        );
    });

    if (!user) {
        alert("No account found with that username or email.");
        return;
    }

    if (user.password !== password) {
        alert("Incorrect password.");
        return;
    }

    persistLogin(rememberMe);
    localStorage.setItem("taskflow_user", user.username);
    localStorage.setItem("taskflow_email", user.email);

    usernameInput.value = "";
    passwordInput.value = "";
    rememberMeCheckbox.checked = false;

    showApp();
});

signupForm.addEventListener("submit", event => {
    event.preventDefault();

    const username = signupUsernameInput.value.trim();
    const email = signupEmailInput.value.trim();
    const password = signupPasswordInput.value.trim();

    if (!username || !email || !password) {
        alert("Please fill in all signup fields.");
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }

    const users = getUsers();
    const alreadyExists = users.some(item => {
        return (
            item.username.toLowerCase() === username.toLowerCase() ||
            item.email.toLowerCase() === email.toLowerCase()
        );
    });

    if (alreadyExists) {
        alert("A user with that username or email already exists.");
        return;
    }

    users.push({
        username,
        email,
        password
    });

    saveUsers(users);

    persistLogin(true);
    localStorage.setItem("taskflow_user", username);
    localStorage.setItem("taskflow_email", email);

    signupForm.reset();
    showApp();
});

resetForm.addEventListener("submit", event => {
    event.preventDefault();

    const email = resetEmailInput.value.trim();
    const password = resetPasswordInput.value.trim();
    const confirmPassword = resetConfirmPasswordInput.value.trim();

    if (!email || !password || !confirmPassword) {
        alert("Please complete all reset fields.");
        return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        alert("Please enter a valid email address.");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match.");
        return;
    }

    const users = getUsers();
    const userIndex = users.findIndex(item => item.email.toLowerCase() === email.toLowerCase());

    if (userIndex === -1) {
        alert("No account was found for that email.");
        return;
    }

    users[userIndex].password = password;
    saveUsers(users);

    resetPasswordForm();
    setAuthView("login");
    alert("Password reset successful. Please log in with your new password.");
});

logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("taskflow_logged_in");
    localStorage.removeItem("taskflow_user");
    localStorage.removeItem("taskflow_email");
    localStorage.removeItem("taskflow_remember_me");
    sessionStorage.removeItem("taskflow_session_logged_in");
    showLogin();
});

authToggleButtons.forEach(button => {
    button.addEventListener("click", () => {
        setAuthView(button.dataset.authView);
    });
});

authLinkButtons.forEach(button => {
    button.addEventListener("click", () => {
        setAuthView(button.dataset.authView);
    });
});

document.querySelectorAll(".toggle-password-btn").forEach(button => {
    button.addEventListener("click", () => {
        const targetInput = document.getElementById(button.dataset.target);
        if (!targetInput) return;

        const isPassword = targetInput.type === "password";
        targetInput.type = isPassword ? "text" : "password";
        button.textContent = isPassword ? "Hide" : "Show";
    });
});

closeDeadlinePopup.addEventListener("click", hideDeadlinePopup);

// Store tasks

let tasks = JSON.parse(localStorage.getItem("taskflow_tasks")) || [];

let currentFilter = "all";


// Save tasks

function saveTasks() {
    localStorage.setItem("taskflow_tasks", JSON.stringify(tasks));
}


function getAlertedDeadlines() {
    try {
        return new Set(JSON.parse(localStorage.getItem("taskflow_alerted_deadlines") || "[]"));
    } catch {
        return new Set();
    }
}

function saveAlertedDeadlines(alertedDeadlines) {
    localStorage.setItem(
        "taskflow_alerted_deadlines",
        JSON.stringify([...alertedDeadlines])
    );
}

function showDeadlinePopup(message) {
    deadlinePopupText.textContent = message;
    deadlinePopup.classList.remove("hidden");
}

function hideDeadlinePopup() {
    deadlinePopup.classList.add("hidden");
}

function updateNotificationBadge() {
    const today = new Date();
    const count = tasks.filter(task => {
        if (!task.date || task.completed) return false;
        const dueDate = new Date(`${task.date}T23:59:59`);
        return dueDate <= today;
    }).length;

    if (count > 0) {
        notificationBadge.textContent = count;
        notificationBadge.classList.remove("hidden");
    } else {
        notificationBadge.textContent = "0";
        notificationBadge.classList.add("hidden");
    }
}

function checkDeadlineAlerts() {
    const today = new Date();
    const alertedDeadlines = getAlertedDeadlines();
    let changed = false;

    tasks.forEach(task => {
        if (!task.date || task.completed) {
            if (alertedDeadlines.has(String(task.id))) {
                alertedDeadlines.delete(String(task.id));
                changed = true;
            }
            return;
        }

        const dueDate = new Date(`${task.date}T23:59:59`);
        const isDue = dueDate <= today;

        if (isDue && !alertedDeadlines.has(String(task.id))) {
            const message = dueDate.toDateString() === today.toDateString()
                ? `Deadline today: "${task.title}"`
                : `Task overdue: "${task.title}"`;

            showDeadlinePopup(message);
            alertedDeadlines.add(String(task.id));
            changed = true;
        }
    });

    if (changed) {
        saveAlertedDeadlines(alertedDeadlines);
    }

    updateNotificationBadge();
}


// Add task

function addTask() {

    const title = taskInput.value.trim();

    if (title === "") {
        alert("Please enter a task.");
        return;
    }

    const task = {
        id: Date.now(),
        title: title,
        category: categoryInput.value,
        priority: priorityInput.value,
        date: dateInput.value,
        completed: false
    };

    tasks.push(task);

    saveTasks();

    taskInput.value = "";
    dateInput.value = "";

    renderTasks();
}


// Render tasks

function renderTasks() {

    taskList.innerHTML = "";

    const searchText = searchInput.value.toLowerCase();

    let filteredTasks = tasks.filter(task => {

        const matchesSearch =
            task.title.toLowerCase().includes(searchText);

        const matchesFilter =
            currentFilter === "all" ||
            (currentFilter === "active" && !task.completed) ||
            (currentFilter === "completed" && task.completed);

        return matchesSearch && matchesFilter;
    });


    if (filteredTasks.length === 0) {

        emptyState.style.display = "block";

    } else {

        emptyState.style.display = "none";

        filteredTasks.forEach(task => {

            const taskElement = document.createElement("div");

            taskElement.className = "task-item";

            taskElement.innerHTML = `

                <div class="task-left">

                    <input
                        type="checkbox"
                        class="task-checkbox"
                        ${task.completed ? "checked" : ""}
                        onchange="toggleTask(${task.id})"
                    >

                    <div class="task-info ${task.completed ? "task-completed" : ""}">

                        <h3 data-task-id="${task.id}">${escapeHTML(task.title)}</h3>

                        <div class="task-meta">

                            <span class="badge category">
                                ${task.category}
                            </span>

                            <span class="badge priority-${task.priority.toLowerCase()}">
                                ${task.priority}
                            </span>

                        </div>

                        ${
                            task.date
                            ? `<p><i class="fa-regular fa-calendar"></i> ${task.date}</p>`
                            : ""
                        }

                    </div>

                </div>


                <div class="task-actions">

                    <button
                        class="edit-btn"
                        onclick="editTask(${task.id})"
                        title="Edit"
                    >
                        <i class="fa-solid fa-pen"></i>
                    </button>

                    <button
                        class="delete-btn"
                        onclick="deleteTask(${task.id})"
                        title="Delete"
                    >
                        <i class="fa-solid fa-trash"></i>
                    </button>

                </div>

            `;

            taskList.appendChild(taskElement);

        });
    }

    updateStats(filteredTasks);
    checkDeadlineAlerts();
}


// Update statistics

function updateStats() {

    const total = tasks.length;

    const completed = tasks.filter(task => task.completed).length;

    const pending = total - completed;

    totalTasks.textContent = total;

    completedTasks.textContent = completed;

    pendingTasks.textContent = pending;

    taskCount.textContent =
        pending === 0
            ? "No pending tasks"
            : `${pending} pending ${pending === 1 ? "task" : "tasks"}`;
}


// Complete task

function toggleTask(id) {

    tasks = tasks.map(task => {

        if (task.id === id) {
            task.completed = !task.completed;
        }

        return task;
    });

    saveTasks();

    renderTasks();
}


// Delete task

function deleteTask(id) {

    const confirmed = confirm(
        "Are you sure you want to delete this task?"
    );

    if (!confirmed) return;

    tasks = tasks.filter(task => task.id !== id);

    saveTasks();

    renderTasks();
}


// Edit task

function editTask(id) {

    const task = tasks.find(task => task.id === id);

    if (!task) return;

    const titleElement = document.querySelector(`h3[data-task-id="${id}"]`);

    if (!titleElement) return;

    const input = document.createElement("input");

    input.type = "text";
    input.value = task.title;
    input.className = "task-edit-input";
    input.maxLength = 120;

    titleElement.replaceWith(input);
    input.focus();
    input.select();

    const saveEdit = () => {
        const trimmedTitle = input.value.trim();

        if (trimmedTitle === "") {
            alert("Task cannot be empty.");
            input.value = task.title;
            input.focus();
            return;
        }

        task.title = trimmedTitle;

        saveTasks();
        renderTasks();
    };

    input.addEventListener("keydown", event => {

        if (event.key === "Enter") {
            event.preventDefault();
            saveEdit();
        }

        if (event.key === "Escape") {
            input.value = task.title;
            renderTasks();
        }

    });

    input.addEventListener("blur", saveEdit, { once: true });
}


// Search

searchInput.addEventListener("input", renderTasks);


// Filters

function setFilter(filterValue) {

    currentFilter = filterValue;

    filterButtons.forEach(btn => {
        btn.classList.toggle("active", btn.dataset.filter === filterValue);
    });

    renderTasks();
}

filterButtons.forEach(button => {

    button.addEventListener("click", () => {
        setFilter(button.dataset.filter);
    });

});

statCards.forEach(card => {

    card.addEventListener("click", () => {
        if (card.dataset.filter) {
            setFilter(card.dataset.filter);
        }
    });

});


// Add task button

addTaskBtn.addEventListener("click", addTask);


// Enter key

taskInput.addEventListener("keypress", event => {

    if (event.key === "Enter") {
        addTask();
    }

});


// Dark mode

themeBtn.addEventListener("click", () => {

    document.body.classList.toggle("dark");

    const isDark =
        document.body.classList.contains("dark");

    localStorage.setItem("taskflow_dark", isDark);

    themeBtn.innerHTML = isDark
        ? '<i class="fa-solid fa-sun"></i>'
        : '<i class="fa-solid fa-moon"></i>';
});


// Load dark mode

if (localStorage.getItem("taskflow_dark") === "true") {

    document.body.classList.add("dark");

    themeBtn.innerHTML =
        '<i class="fa-solid fa-sun"></i>';
}


// Prevent HTML injection

function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// Initial render

setInterval(checkDeadlineAlerts, 60000);
renderTasks();
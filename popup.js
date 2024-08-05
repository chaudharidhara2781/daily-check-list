const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');

todoForm.addEventListener('submit', function(event) {
    event.preventDefault();
    const newTask = todoInput.value;

    if (newTask === '') {
        alert('Please enter a task!');
        return;
    }

    addTask(newTask);
    saveTask(newTask);
    todoInput.value = '';
});

function addTask(task, checked = false, timestamp = null) {
    const listItem = document.createElement('li');
    const checkbox = document.createElement('input');

    checkbox.type = 'checkbox';
    checkbox.className = 'task-checkbox';
    checkbox.checked = checked;
    checkbox.addEventListener('change', function() {
        if (checkbox.checked) {
            updateTaskTimestamp(task, Date.now());
        } else {
            updateTaskTimestamp(task, null);
        }
    });

    const taskText = document.createElement('span');
    taskText.textContent = task;
    taskText.className = 'task-text';

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'delete-button';
    deleteButton.addEventListener('click', function() {
        todoList.removeChild(listItem);
        removeTask(task);
    });

    listItem.appendChild(checkbox);
    listItem.appendChild(taskText);
    listItem.appendChild(deleteButton);
    todoList.appendChild(listItem);
}

function saveTask(task) {
    chrome.storage.sync.get(['tasks'], function(result) {
        let tasks = result.tasks || [];
        tasks.push({ task, checked: false, timestamp: null });
        chrome.storage.sync.set({ tasks: tasks });
    });
}

function updateTaskTimestamp(task, timestamp) {
    chrome.storage.sync.get(['tasks'], function(result) {
        let tasks = result.tasks || [];
        tasks = tasks.map(t => t.task === task ? { ...t, checked: !!timestamp, timestamp: timestamp } : t);
        chrome.storage.sync.set({ tasks: tasks });
    });
}

function removeTask(task) {
    chrome.storage.sync.get(['tasks'], function(result) {
        let tasks = result.tasks || [];
        tasks = tasks.filter(t => t.task !== task);
        chrome.storage.sync.set({ tasks: tasks });
    });
}

function loadTasks() {
    chrome.storage.sync.get(['tasks'], function(result) {
        let tasks = result.tasks || [];
        const now = Date.now();
        tasks.forEach(t => {
            if (t.checked && t.timestamp && (now - t.timestamp) > 86400000) {
                t.checked = false;
                t.timestamp = null;
            }
            addTask(t.task, t.checked, t.timestamp);
        });
        chrome.storage.sync.set({ tasks: tasks });
    });
}


document.addEventListener('DOMContentLoaded', loadTasks);

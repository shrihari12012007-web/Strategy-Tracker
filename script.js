let routines = JSON.parse(localStorage.getItem('routines')) || [];

function updateUI() {
    const list = document.getElementById('taskList');
    const percentEl = document.getElementById('percent');
    const circle = document.getElementById('progressCircle');
    list.innerHTML = '';
    
    let completedCount = 0;
    routines.forEach((item, index) => {
        if(item.completed) completedCount++;
        const div = document.createElement('div');
        div.className = "flex items-center justify-between p-2 border rounded";
        div.innerHTML = `
            <div class="flex items-center gap-2">
                <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggle(${index})">
                <span>${item.task}</span>
            </div>
            <button onclick="deleteTask(${index})" class="text-red-500 text-sm">Delete</button>
        `;
        list.appendChild(div);
    });

    const percent = routines.length ? Math.round((completedCount / routines.length) * 100) : 0;
    
    // Update Text
    percentEl.innerText = `${percent}%`;
    
    // Update Circle: SVG stroke-dashoffset logic
    // 100 - percent works because stroke-dasharray is 100
    const offset = 100 - percent;
    circle.style.strokeDashoffset = offset;
    
    localStorage.setItem('routines', JSON.stringify(routines));
}

function addTask() {
    const input = document.getElementById('taskInput');
    if(input.value) {
        routines.push({ task: input.value, completed: false });
        input.value = '';
        updateUI();
    }
}

function toggle(index) {
    routines[index].completed = !routines[index].completed;
    updateUI();
}

function deleteTask(index) {
    routines.splice(index, 1);
    updateUI();
}

updateUI();
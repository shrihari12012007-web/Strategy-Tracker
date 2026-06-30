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
        div.className = "flex items-center justify-between p-2 border-white/20 border rounded-lg text-white";
        div.innerHTML = `
            <div class="flex items-center gap-2">
                <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggle(${index})" class="size-5">
                <span class="${item.completed ? 'line-through opacity-50' : ''}">${item.task}</span>
            </div>
            <button onclick="deleteTask(${index})" class="bg-white/10 hover:bg-red-500 px-2 py-1 rounded text-sm transition">Delete</button>
        `;
        list.appendChild(div);
    });

    const percent = routines.length ? Math.round((completedCount / routines.length) * 100) : 0;
    
    // Update Text
    percentEl.innerText = `${percent}%`;
    
    // Update Circle Offset
    circle.style.strokeDashoffset = 100 - percent;
    
    // Automatic Color Logic
    circle.classList.remove('text-red-500', 'text-yellow-400', 'text-green-400');
    if (percent < 40) {
        circle.classList.add('text-red-500');
    } else if (percent < 80) {
        circle.classList.add('text-yellow-400');
    } else {
        circle.classList.add('text-green-400');
    }
    
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
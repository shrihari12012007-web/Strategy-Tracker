let routines = JSON.parse(localStorage.getItem('routines')) || [
    { id: 1, task: "Market Strategy", completed: false },
    { id: 2, task: "Coding Practice", completed: false }
];

function updateUI() {
    const list = document.getElementById('taskList');
    const percentEl = document.getElementById('percent');
    list.innerHTML = '';
    
    let completedCount = 0;
    
    routines.forEach(item => {
        if(item.completed) completedCount++;
        
        const div = document.createElement('div');
        div.className = "flex items-center gap-3 p-2 border rounded";
        div.innerHTML = `
            <input type="checkbox" ${item.completed ? 'checked' : ''} onchange="toggle(${item.id})">
            <span>${item.task}</span>
        `;
        list.appendChild(div);
    });

    const percent = routines.length ? Math.round((completedCount / routines.length) * 100) : 0;
    percentEl.innerText = `${percent}%`;
    localStorage.setItem('routines', JSON.stringify(routines));
}

function toggle(id) {
    routines = routines.map(r => r.id === id ? {...r, completed: !r.completed} : r);
    updateUI();
}

updateUI();
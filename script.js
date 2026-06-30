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
    
    if (percent < 40) {
        circle.style.stroke = 'oklch(70.4% 0.191 22.216)';
    } else if (percent < 80) {
        circle.style.stroke = 'oklch(93.8% 0.127 124.321)';
    } else {
        circle.style.stroke = 'oklch(79.2% 0.209 151.711)';
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

function playAlarmSound() {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'square'; // Sounds like an old-school alarm
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); // 880Hz frequency
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 2); // Plays for 2 seconds
}

function setAlarm(alarmTime) {
    alert("Alarm set for " + alarmTime);
    
    const interval = setInterval(() => {
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ":" + 
                            now.getMinutes().toString().padStart(2, '0');
        
        if (currentTime === alarmTime) {
            playAlarmSound();
            alert("Time for your strategy routine!");
            clearInterval(interval);
        }
    }, 1000);
}
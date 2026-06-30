let routines = JSON.parse(localStorage.getItem('routines')) || [];
let audioCtx;

// --- UI Logic ---
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
    percentEl.innerText = `${percent}%`;
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

// --- Alarm & Time Logic ---
function playAlarmSound() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 2);
}

function setAlarm(alarmTime) {
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

function activateAlarm() {
    const time = document.getElementById('alarmInput').value;
    if (time) {
        alert("Alarm set for " + time);
        setAlarm(time);
    }
}

// --- Task Management ---
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

updateUI();// Display local time when the button is clicked
function checkLocalTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    document.getElementById('currentTimeDisplay').innerText = "Current local time is: " + timeString;
}

// Logic for Time Setter
function activateAlarm() {
    const time = document.getElementById('alarmInput').value;
    if (time) {
        alert("Alarm successfully set for " + time);
        setAlarm(time);
    }
}

// Logic to monitor the set time
function setAlarm(alarmTime) {
    // Clear any existing intervals to prevent multiple alarms
    if (window.alarmInterval) clearInterval(window.alarmInterval);

    window.alarmInterval = setInterval(() => {
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ":" + 
                            now.getMinutes().toString().padStart(2, '0');
        
        if (currentTime === alarmTime) {
            playAlarmSound();
            alert("Time for your strategy routine!");
            clearInterval(window.alarmInterval);
        }
    }, 1000);
}
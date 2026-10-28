// ==========================================================================
// Strategy Tracker / Study Tracker — Interactive Productivity Engine
// ==========================================================================

const STORAGE_KEY = 'strategy_tracker_tasks_v2';
const ALARM_KEY = 'strategy_tracker_alarm_v2';

let tasks = [];
let audioCtx = null;
let alarmInterval = null;
let activeAlarmTime = null;
let timerInterval = null;
let timerSecondsRemaining = 25 * 60;
let isTimerRunning = false;

// Default starter tasks for new visitors
const DEFAULT_TASKS = [
  { id: 1, title: '🧬 Review NCERT Biology: Human Physiology & NEET Key Points', category: 'NEET', completed: true },
  { id: 2, title: '💻 Solve 3 Data Structures & Python Lab Exercises', category: 'VTU CSE', completed: true },
  { id: 3, title: '📐 Revise Engineering Mathematics Differential Calculus', category: 'Academic', completed: false },
  { id: 4, title: '🎯 Complete 50-minute uninterrupted Deep Focus session', category: 'Routine', completed: false }
];

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  loadTasks();
  initClock();
  initAlarmFromStorage();
  initTimerDisplay();

  // Enter key support for task input
  const input = document.getElementById('taskInput');
  if (input) {
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addTask();
    });
  }
});

// ==========================================================================
// 1. TASK PERSISTENCE & MANAGEMENT
// ==========================================================================
function loadTasks() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      tasks = JSON.parse(saved);
    } else {
      tasks = [...DEFAULT_TASKS];
      saveTasks();
    }
  } catch (e) {
    tasks = [...DEFAULT_TASKS];
  }
  renderTasks();
}

function saveTasks() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  } catch (e) {
    console.warn('Storage save failed', e);
  }
}

function addTask() {
  const input = document.getElementById('taskInput');
  const categorySelect = document.getElementById('taskCategory');
  if (!input) return;

  const title = input.value.trim();
  if (!title) {
    input.focus();
    return;
  }

  const category = categorySelect ? categorySelect.value : 'Routine';

  const newTask = {
    id: Date.now(),
    title,
    category,
    completed: false
  };

  tasks.unshift(newTask);
  saveTasks();
  renderTasks();

  input.value = '';
  input.focus();
}

function toggleTask(id) {
  const task = tasks.find((t) => t.id === id);
  if (task) {
    task.completed = !task.completed;
    saveTasks();
    renderTasks();
  }
}

function deleteTask(id) {
  tasks = tasks.filter((t) => t.id !== id);
  saveTasks();
  renderTasks();
}

function clearCompleted() {
  tasks = tasks.filter((t) => !t.completed);
  saveTasks();
  renderTasks();
}

function resetDefaultTasks() {
  if (confirm('Reset to initial study routine template?')) {
    tasks = [...DEFAULT_TASKS];
    saveTasks();
    renderTasks();
  }
}

// ==========================================================================
// 2. RENDERING & CIRCULAR PROGRESS CALCULATION
// ==========================================================================
function renderTasks() {
  const list = document.getElementById('taskList');
  const percentText = document.getElementById('percent');
  const progressCircle = document.getElementById('progressCircle');
  const statsDisplay = document.getElementById('taskStats');
  if (!list) return;

  list.innerHTML = '';

  const total = tasks.length;
  const completed = tasks.filter((t) => t.completed).length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Update circular SVG gauge
  if (percentText) {
    percentText.innerText = `${percent}%`;
  }

  if (progressCircle) {
    // Circumference = 2 * PI * r = 2 * 3.14159 * 16 ~= 100.5
    // Dasharray is 100, so dashoffset = 100 - percent
    const offset = 100 - percent;
    progressCircle.style.strokeDashoffset = offset;

    // Color gradient based on completion
    if (percent >= 80) {
      progressCircle.style.stroke = '#10b981'; // Emerald
      percentText.style.color = '#10b981';
    } else if (percent >= 50) {
      progressCircle.style.stroke = '#06b6d4'; // Cyan
      percentText.style.color = '#06b6d4';
    } else if (percent > 0) {
      progressCircle.style.stroke = '#818cf8'; // Indigo
      percentText.style.color = '#818cf8';
    } else {
      progressCircle.style.stroke = '#64748b'; // Muted
      percentText.style.color = '#94a3b8';
    }
  }

  if (statsDisplay) {
    statsDisplay.innerText = `${completed} of ${total} routines completed`;
  }

  if (tasks.length === 0) {
    list.innerHTML = `
      <div class="text-center py-8 text-white/50 text-sm">
        <p>No active routines. Add your first study task above!</p>
      </div>
    `;
    return;
  }

  tasks.forEach((task) => {
    const item = document.createElement('div');
    item.className = `task-item flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5 backdrop-blur-sm ${
      task.completed ? 'task-completed' : ''
    }`;

    // Tag badge colors
    const categoryColors = {
      NEET: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
      'VTU CSE': 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
      Academic: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      Routine: 'bg-purple-500/20 text-purple-300 border-purple-500/30'
    };
    const tagClass = categoryColors[task.category] || categoryColors.Routine;

    item.innerHTML = `
      <div class="flex items-center gap-3 flex-grow cursor-pointer" onclick="toggleTask(${task.id})">
        <input 
          type="checkbox" 
          ${task.completed ? 'checked' : ''} 
          class="size-5 rounded border-white/20 text-indigo-500 focus:ring-0 cursor-pointer accent-indigo-500"
          onclick="event.stopPropagation(); toggleTask(${task.id})"
        />
        <div class="flex flex-col">
          <span class="text-sm font-medium text-white select-none ${task.completed ? 'line-through opacity-70' : ''}">
            ${escapeHtml(task.title)}
          </span>
          <span class="inline-block mt-0.5 w-max px-2 py-0.5 rounded text-[10px] font-semibold border ${tagClass}">
            ${escapeHtml(task.category)}
          </span>
        </div>
      </div>
      <button 
        onclick="deleteTask(${task.id})" 
        class="text-white/40 hover:text-rose-400 p-1.5 rounded-lg transition hover:bg-white/10"
        title="Delete task"
      >
        ✕
      </button>
    `;

    list.appendChild(item);
  });
}

function escapeHtml(text) {
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return String(text).replace(/[&<>"']/g, (m) => map[m]);
}

// ==========================================================================
// 3. LIVE CLOCK & ROUTINE ALARM SYSTEM
// ==========================================================================
function initClock() {
  const clockElem = document.getElementById('liveClockDisplay');
  const update = () => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    if (clockElem) clockElem.innerText = timeStr;

    // Check alarm trigger
    if (activeAlarmTime) {
      const currentHM = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
      if (currentHM === activeAlarmTime && now.getSeconds() === 0) {
        playAlarmSound();
      }
    }
  };
  update();
  setInterval(update, 1000);
}

function initAlarmFromStorage() {
  const saved = localStorage.getItem(ALARM_KEY);
  if (saved) {
    activeAlarmTime = saved;
    updateAlarmStatusDisplay();
  }
}

function activateAlarm() {
  const input = document.getElementById('alarmInput');
  if (!input || !input.value) {
    alert('Please select a valid alarm time (HH:MM)');
    return;
  }

  activeAlarmTime = input.value;
  localStorage.setItem(ALARM_KEY, activeAlarmTime);
  updateAlarmStatusDisplay();
}

function clearAlarm() {
  activeAlarmTime = null;
  localStorage.removeItem(ALARM_KEY);
  updateAlarmStatusDisplay();
}

function updateAlarmStatusDisplay() {
  const statusElem = document.getElementById('alarmStatus');
  if (!statusElem) return;

  if (activeAlarmTime) {
    statusElem.innerHTML = `
      <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-semibold">
        <span>⏰</span> Alarm Active for ${activeAlarmTime}
        <button onclick="clearAlarm()" class="ml-1 text-white/50 hover:text-white" title="Clear Alarm">✕</button>
      </span>
    `;
  } else {
    statusElem.innerHTML = `<span class="text-xs text-white/50">No alarm currently active</span>`;
  }
}

function playAlarmSound() {
  if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  if (audioCtx.state === 'suspended') audioCtx.resume();

  const now = audioCtx.currentTime;

  // Harmonious multi-pulse chime melody
  const frequencies = [523.25, 659.25, 783.99, 1046.5, 659.25, 783.99, 1046.5, 1318.51];
  frequencies.forEach((freq, i) => {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now + i * 0.18);

    gain.gain.setValueAtTime(0, now + i * 0.18);
    gain.gain.linearRampToValueAtTime(0.25, now + i * 0.18 + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.18 + 0.45);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now + i * 0.18);
    osc.stop(now + i * 0.18 + 0.5);
  });

  const stopBtn = document.getElementById('stopAlarmBtn');
  if (stopBtn) stopBtn.classList.remove('hidden');
}

function stopAlarm() {
  if (audioCtx) {
    audioCtx.close().then(() => {
      audioCtx = null;
    });
  }
  const stopBtn = document.getElementById('stopAlarmBtn');
  if (stopBtn) stopBtn.classList.add('hidden');
}

// ==========================================================================
// 4. STUDY FOCUS POMODORO TIMER
// ==========================================================================
function setFocusDuration(minutes) {
  stopFocusTimer();
  timerSecondsRemaining = minutes * 60;
  initTimerDisplay();
}

function toggleFocusTimer() {
  const btn = document.getElementById('timerToggleBtn');
  if (isTimerRunning) {
    stopFocusTimer();
    if (btn) btn.innerText = 'Start Focus';
  } else {
    isTimerRunning = true;
    if (btn) btn.innerText = 'Pause Focus';
    timerInterval = setInterval(() => {
      if (timerSecondsRemaining > 0) {
        timerSecondsRemaining--;
        initTimerDisplay();
      } else {
        stopFocusTimer();
        playAlarmSound();
        alert('🎉 Focus Session Completed! Take a productive 5-minute break.');
        if (btn) btn.innerText = 'Start Focus';
      }
    }, 1000);
  }
}

function stopFocusTimer() {
  isTimerRunning = false;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
}

function resetFocusTimer() {
  stopFocusTimer();
  timerSecondsRemaining = 25 * 60;
  initTimerDisplay();
  const btn = document.getElementById('timerToggleBtn');
  if (btn) btn.innerText = 'Start Focus';
}

function initTimerDisplay() {
  const display = document.getElementById('focusTimerDisplay');
  if (!display) return;
  const m = Math.floor(timerSecondsRemaining / 60).toString().padStart(2, '0');
  const s = (timerSecondsRemaining % 60).toString().padStart(2, '0');
  display.innerText = `${m}:${s}`;
}

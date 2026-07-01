let audioCtx;
let alarmOscillator; // Store this globally to stop it later

function playAlarmSound() {
    // 1. Initialize context
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // 2. Resume if suspended
    if (audioCtx.state === 'suspended') {
        audioCtx.resume();
    }

    // 3. Create sound chain
    const oscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    oscillator.type = 'square';
    oscillator.frequency.setValueAtTime(880, audioCtx.currentTime); 
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

    // 4. Play
    oscillator.start();
    oscillator.stop(audioCtx.currentTime + 2); // 2-second beep
}

function stopAlarm() {
    if (alarmOscillator) {
        alarmOscillator.stop();
    }
    document.getElementById('stopAlarmBtn').classList.add('hidden');
    alert("Alarm Stopped!");
}

// Update your setAlarm loop to trigger the new sound
function setAlarm(alarmTime) {
    if (window.alarmInterval) clearInterval(window.alarmInterval);

    window.alarmInterval = setInterval(() => {
        const now = new Date();
        const currentTime = now.getHours().toString().padStart(2, '0') + ":" + 
                            now.getMinutes().toString().padStart(2, '0');
        
        if (currentTime === alarmTime) {
            playAlarmSound();
            clearInterval(window.alarmInterval);
        }
    }, 1000);
}
function checkLocalTime() {
    console.log("Check Local Time button clicked!"); // Check this in F12 Console
    
    const display = document.getElementById('currentTimeDisplay');
    if (!display) {
        console.error("Could not find element with ID 'currentTimeDisplay'");
        return;
    }

    const now = new Date();
    const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    display.innerText = "Current local time is: " + timeString;
    console.log("Time displayed:", timeString);
}
let audioCtx;
let alarmOscillator; // Store this globally to stop it later

function playAlarmSound() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    const now = audioCtx.currentTime;

    // Create a rhythmic alarm pattern (10 pulses)
    for (let i = 0; i < 10; i++) {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        // Alternate frequencies for an "urgent" warble sound
        oscillator.frequency.setValueAtTime(i % 2 === 0 ? 880 : 660, now + (i * 0.2));
        
        // Fast attack/release for a sharp, urgent "beep"
        gainNode.gain.setValueAtTime(0, now + (i * 0.2));
        gainNode.gain.linearRampToValueAtTime(0.2, now + (i * 0.2) + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, now + (i * 0.2) + 0.15);

        oscillator.start(now + (i * 0.2));
        oscillator.stop(now + (i * 0.2) + 0.2);
    }
    
    // Show the "Stop Alarm" button to allow user interaction
    document.getElementById('stopAlarmBtn').classList.remove('hidden');
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
function stopAlarm() {
    // This stops the sound immediately
    if (audioCtx) {
        audioCtx.close().then(() => {
            audioCtx = null; // Reset context
        });
    }
    document.getElementById('stopAlarmBtn').classList.add('hidden');
    alert("Alarm Stopped!");
}
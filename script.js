let audioCtx;
let alarmOscillator; // Store this globally to stop it later

function playAlarmSound() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Create a loop to simulate "beep-beep"
    for (let i = 0; i < 5; i++) {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);

        oscillator.type = 'square';
        oscillator.frequency.setValueAtTime(880, audioCtx.currentTime + (i * 0.5));
        
        // Envelope: Fade in/out quickly to make it sound like a "beep"
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime + (i * 0.5));
        gainNode.gain.linearRampToValueAtTime(0.1, audioCtx.currentTime + (i * 0.5) + 0.05);
        gainNode.gain.linearRampToValueAtTime(0, audioCtx.currentTime + (i * 0.5) + 0.2);

        oscillator.start(audioCtx.currentTime + (i * 0.5));
        oscillator.stop(audioCtx.currentTime + (i * 0.5) + 0.2);
    }
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
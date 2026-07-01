let audioCtx;
let alarmOscillator; // Store this globally to stop it later

function playAlarmSound() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Create the sound pipeline
    alarmOscillator = audioCtx.createOscillator();
    const gainNode = audioCtx.createGain();

    alarmOscillator.connect(gainNode);
    gainNode.connect(audioCtx.destination);

    alarmOscillator.type = 'square';
    alarmOscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
    gainNode.gain.setValueAtTime(0.1, audioCtx.currentTime);

    alarmOscillator.start();
    
    // Show the button so the user can interact with the page
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
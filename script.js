let audioCtx;
let alarmInterval; // Keeps track of the infinite beeping

// Confirmation sound when the user clicks "Set"
function playConfirmSound() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    osc.connect(audioCtx.destination);
    osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A note
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1); // Short pulse
}

// Continuous Alarm Sound
function startContinuousAlarm() {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    if (audioCtx.state === 'suspended') audioCtx.resume();

    // Use setInterval to repeat the beep pattern infinitely
    window.alarmLoop = setInterval(() => {
        const now = audioCtx.currentTime;
        // Play two-tone pattern
        [880, 660].forEach((freq, i) => {
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            osc.frequency.setValueAtTime(freq, now + (i * 0.1));
            gain.gain.setValueAtTime(0.2, now + (i * 0.1));
            gain.gain.exponentialRampToValueAtTime(0.01, now + (i * 0.1) + 0.1);
            osc.start(now + (i * 0.1));
            osc.stop(now + (i * 0.1) + 0.1);
        });
    }, 300); // Repeat every 300ms
}

function stopAlarm() {
    clearInterval(window.alarmLoop); // Stops the infinite beeping loop
    document.getElementById('stopAlarmBtn').classList.add('hidden');
    alert("Alarm Stopped!");
}

function activateAlarm() {
    const time = document.getElementById('alarmInput').value;
    if (time) {
        playConfirmSound(); // Beep when set
        alert("Alarm set for " + time);
        
        // Monitoring loop
        alarmInterval = setInterval(() => {
            const now = new Date();
            const currentTime = now.getHours().toString().padStart(2, '0') + ":" + 
                                now.getMinutes().toString().padStart(2, '0');
            
            if (currentTime === time) {
                startContinuousAlarm();
                document.getElementById('stopAlarmBtn').classList.remove('hidden');
                clearInterval(alarmInterval); // Stop monitoring once alarm starts
            }
        }, 1000);
    }
}
let timer;
let totalTime, remainingTime;
let isRunning = false;

function updateDisplay(time) {
    let hrs = Math.floor(time / 3600);
    let mins = Math.floor((time % 3600) / 60);
    let secs = time % 60;
    document.getElementById("display").textContent =
        `${String(hrs).padStart(2, "0")}:${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function toggleTimer() {
    if (isRunning) {
        pauseTimer();
    } else {
        startTimer();
    }
}

function startTimer() {
    if (!remainingTime) {
        let hrs = parseInt(document.getElementById("hours").value) || 0;
        let mins = parseInt(document.getElementById("minutes").value) || 0;
        let secs = parseInt(document.getElementById("seconds").value) || 0;
        totalTime = hrs * 3600 + mins * 60 + secs;
        remainingTime = totalTime;
    }

    if (remainingTime <= 0) return;

    isRunning = true;
    document.getElementById("startPauseBtn").textContent = "⏸ Pause";
    document.getElementById("startPauseBtn").classList.replace("bg-green-600", "bg-yellow-500");

    timer = setInterval(() => {
        if (remainingTime <= 0) {
            clearInterval(timer);
            isRunning = false;
            document.getElementById("startPauseBtn").textContent = "▶ Start";
            document.getElementById("startPauseBtn").classList.replace("bg-yellow-500", "bg-green-600");
            alert("⏰ Time's up!");
            return;
        }
        remainingTime--;
        updateDisplay(remainingTime);

        let progressPercent = ((totalTime - remainingTime) / totalTime) * 100;
        document.getElementById("progress").style.width = progressPercent + "%";
    }, 1000);
}

function pauseTimer() {
    clearInterval(timer);
    isRunning = false;
    document.getElementById("startPauseBtn").textContent = "▶ Play";
    document.getElementById("startPauseBtn").classList.replace("bg-yellow-500", "bg-green-600");
}

function resetTimer() {
    clearInterval(timer);
    isRunning = false;
    remainingTime = 0;
    document.getElementById("display").textContent = "00:00:00";
    document.getElementById("progress").style.width = "0%";
    document.getElementById("startPauseBtn").textContent = "▶ Start";
    document.getElementById("startPauseBtn").classList.replace("bg-yellow-500", "bg-green-600");
    document.getElementById("hours").value = "";
    document.getElementById("minutes").value = "";
    document.getElementById("seconds").value = "";
}
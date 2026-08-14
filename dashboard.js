// ===============================
// LOGIN CHECK
// ===============================

if (
    localStorage.getItem(
        "fireRobotLoggedIn"
    ) !== "true"
) {

    window.location.href =
    "login.html";

}


// ===============================
// LOGOUT
// ===============================

function logout() {

    localStorage.removeItem(
        "fireRobotLoggedIn"
    );

    window.location.href =
    "login.html";

}


// ===============================
// ROBOT CONTROL
// ===============================

function sendCommand(command) {

    console.log(
        "Robot Command:",
        command
    );


    addEvent(
        "Robot command: " + command
    );


    // ESP32-CAM API
    // Actual connection ke liye:
    //
    // fetch(
    // "http://ESP32_IP/command?cmd="
    // + command
    // );

}


// ===============================
// PUMP CONTROL
// ===============================

function pumpControl(status) {

    const pump =
    document.getElementById(
        "pumpStatus"
    );

    const water =
    document.getElementById(
        "waterStatus"
    );


    if (status === "ON") {

        pump.innerHTML = "ON";
        pump.style.color = "#00ff88";

        water.innerHTML = "ON";
        water.style.color = "#00ff88";

        addEvent(
            "Water Pump turned ON"
        );

    } else {

        pump.innerHTML = "OFF";
        pump.style.color = "white";

        water.innerHTML = "OFF";
        water.style.color = "white";

        addEvent(
            "Water Pump turned OFF"
        );

    }

}


// ===============================
// EVENT LOG
// ===============================

function addEvent(message) {

    const log =
    document.getElementById(
        "eventLog"
    );

    const time =
    new Date().toLocaleTimeString();


    const div =
    document.createElement(
        "div"
    );


    div.innerHTML =
    "[" + time + "] " + message;


    log.prepend(div);

    // keep log from growing forever
    while (log.children.length > 25) {
        log.removeChild(log.lastChild);
    }

}


// ===============================
// ANIMATED NUMBER COUNT-UP
// ===============================

function animateNumber(el, from, to, suffix) {

    const duration = 600;
    const start = performance.now();

    function step(now) {
        const progress = Math.min((now - start) / duration, 1);
        const value = Math.round(from + (to - from) * progress);
        el.innerHTML = value + suffix;
        if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);

}


// ===============================
// SIGNAL BARS
// ===============================

function updateSignalBars(dbm) {

    // dBm closer to 0 = stronger signal
    const bars = document.querySelectorAll("#signalBars span");
    let activeCount = 1;

    if (dbm > -50) activeCount = 4;
    else if (dbm > -60) activeCount = 3;
    else if (dbm > -75) activeCount = 2;
    else activeCount = 1;

    bars.forEach((bar, i) => {
        bar.classList.toggle("active", i < activeCount);
    });

}


// ===============================
// TEMPERATURE SPARKLINE CHART
// ===============================

const tempHistory = [32, 32, 32, 32, 32];
const chartCanvas = document.getElementById("tempChart");
const chartCtx = chartCanvas ? chartCanvas.getContext("2d") : null;

function resizeChart() {
    if (!chartCanvas) return;
    const ratio = window.devicePixelRatio || 1;
    chartCanvas.width = chartCanvas.clientWidth * ratio;
    chartCanvas.height = chartCanvas.clientHeight * ratio;
    chartCtx.setTransform(ratio, 0, 0, ratio, 0, 0);
}

function drawChart() {

    if (!chartCtx) return;

    const w = chartCanvas.clientWidth;
    const h = chartCanvas.clientHeight;

    chartCtx.clearRect(0, 0, w, h);

    const min = Math.min(...tempHistory) - 1;
    const max = Math.max(...tempHistory) + 1;
    const range = Math.max(max - min, 1);

    const points = tempHistory.map((t, i) => {
        const x = (i / (tempHistory.length - 1)) * w;
        const y = h - ((t - min) / range) * h;
        return [x, y];
    });

    // gradient fill under line
    const grad = chartCtx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, "rgba(255, 106, 61, 0.35)");
    grad.addColorStop(1, "rgba(255, 106, 61, 0)");

    chartCtx.beginPath();
    chartCtx.moveTo(points[0][0], h);
    points.forEach(p => chartCtx.lineTo(p[0], p[1]));
    chartCtx.lineTo(points[points.length - 1][0], h);
    chartCtx.closePath();
    chartCtx.fillStyle = grad;
    chartCtx.fill();

    // line
    chartCtx.beginPath();
    points.forEach((p, i) => {
        if (i === 0) chartCtx.moveTo(p[0], p[1]);
        else chartCtx.lineTo(p[0], p[1]);
    });
    chartCtx.strokeStyle = "#ff6a3d";
    chartCtx.lineWidth = 2;
    chartCtx.stroke();

    // last point dot
    const last = points[points.length - 1];
    chartCtx.beginPath();
    chartCtx.arc(last[0], last[1], 3.5, 0, Math.PI * 2);
    chartCtx.fillStyle = "#ffb347";
    chartCtx.fill();

}

window.addEventListener("resize", () => {
    resizeChart();
    drawChart();
});


// ===============================
// FIRE / DANGER SIMULATION STATE
// ===============================

let dangerActive = false;
let currentTemp = 32;
let currentBattery = 85;
let currentSignal = -45;

function setDangerState(active) {

    dangerActive = active;

    const alertBox = document.getElementById("fireAlert");
    const fireStatus = document.getElementById("fireStatus");
    const smokeLevel = document.getElementById("smokeLevel");
    const flameSensor = document.getElementById("flameSensor");
    const smokeSensor = document.getElementById("smokeSensor");
    const flameRow = document.getElementById("flameRow");
    const smokeRow = document.getElementById("smokeRow");

    if (active) {

        document.body.classList.add("danger-mode");

        alertBox.className = "alert danger";
        alertBox.innerHTML = "🚨 FIRE DETECTED — AUTOMATED RESPONSE ACTIVE";

        fireStatus.innerHTML = "FIRE!";
        fireStatus.style.color = "#ff4d4d";

        smokeLevel.innerHTML = "HIGH";
        smokeLevel.style.color = "#ff4d4d";

        flameSensor.innerHTML = "FIRE DETECTED";
        flameSensor.className = "";
        flameSensor.style.color = "#ff4d4d";
        flameRow.classList.add("alert-state");

        smokeSensor.innerHTML = "HIGH";
        smokeSensor.className = "";
        smokeSensor.style.color = "#ff4d4d";
        smokeRow.classList.add("alert-state");

        addEvent("⚠️ Flame detected by sensor array!");

    } else {

        document.body.classList.remove("danger-mode");

        alertBox.className = "alert normal";
        alertBox.innerHTML = "✅ SYSTEM NORMAL — NO FIRE DETECTED";

        fireStatus.innerHTML = "NO FIRE";
        fireStatus.style.color = "white";

        smokeLevel.innerHTML = "NORMAL";
        smokeLevel.style.color = "white";

        flameSensor.innerHTML = "SAFE";
        flameSensor.className = "green";
        flameRow.classList.remove("alert-state");

        smokeSensor.innerHTML = "NORMAL";
        smokeSensor.className = "green";
        smokeRow.classList.remove("alert-state");

        addEvent("✅ Area clear — system back to normal");

    }

}


// ===============================
// DEMO REAL-TIME DATA (random-walk, feels more "live" than pure random jumps)
// ===============================

function updateDashboard() {

    // --- temperature: random walk, spikes during danger mode ---
    const drift = dangerActive ? (Math.random() * 3) : (Math.random() - 0.5) * 1.5;
    currentTemp = Math.max(26, Math.min(dangerActive ? 65 : 36, currentTemp + drift));
    const temp = Math.round(currentTemp);

    const tempEl = document.getElementById("temperature");
    const tempSensorEl = document.getElementById("tempSensor");
    const prevTemp = parseInt(tempEl.innerHTML) || temp;

    animateNumber(tempEl, prevTemp, temp, "°C");
    tempSensorEl.innerHTML = temp + "°C";
    tempSensorEl.style.color = temp > 45 ? "#ff4d4d" : "white";

    tempHistory.push(temp);
    if (tempHistory.length > 20) tempHistory.shift();
    drawChart();


    // --- battery: slow drain ---
    currentBattery = Math.max(15, currentBattery - Math.random() * 0.15);
    const battery = Math.round(currentBattery);

    const batteryEl = document.getElementById("battery");
    const prevBattery = parseInt(batteryEl.innerHTML) || battery;
    animateNumber(batteryEl, prevBattery, battery, "%");

    const batteryBar = document.getElementById("batteryBar");
    batteryBar.style.width = battery + "%";
    batteryBar.style.background = battery > 40 ? "#00ff88" : battery > 20 ? "#ffb347" : "#ff4d4d";


    // --- wifi signal: small fluctuation ---
    currentSignal = Math.max(-90, Math.min(-35, currentSignal + (Math.random() - 0.5) * 4));
    const signal = Math.round(currentSignal);
    document.getElementById("wifi").innerHTML = signal + " dBm";
    updateSignalBars(signal);


    // --- update time ---
    document.getElementById("lastUpdate").innerHTML =
    new Date().toLocaleTimeString();

}


// ===============================
// OCCASIONAL RANDOM FIRE SIMULATION (demo only)
// ===============================

function maybeToggleDanger() {

    if (!dangerActive && Math.random() < 0.05) {
        setDangerState(true);
        // auto-resolve after a while
        setTimeout(() => setDangerState(false), 9000);
    }

}


// ===============================
// EMBER PARTICLE BACKGROUND
// ===============================

(function initEmbers() {

    const canvas = document.getElementById("emberCanvas");
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let particles = [];

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }

    function spawnParticle() {
        return {
            x: Math.random() * canvas.width,
            y: canvas.height + 10,
            r: 1 + Math.random() * 2.5,
            speed: 0.4 + Math.random() * 1.2,
            drift: (Math.random() - 0.5) * 0.6,
            alpha: 0.2 + Math.random() * 0.6,
            hue: Math.random() > 0.5 ? "255,106,61" : "255,179,71"
        };
    }

    function initParticles() {
        const count = Math.min(70, Math.floor((canvas.width * canvas.height) / 22000));
        particles = Array.from({ length: count }, () => {
            const p = spawnParticle();
            p.y = Math.random() * canvas.height;
            return p;
        });
    }

    function tick() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach(p => {
            p.y -= p.speed;
            p.x += p.drift;

            if (p.y < -10) Object.assign(p, spawnParticle(), { y: canvas.height + 10 });

            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${p.hue}, ${p.alpha})`;
            ctx.shadowColor = `rgba(${p.hue}, 0.8)`;
            ctx.shadowBlur = 6;
            ctx.fill();
        });

        requestAnimationFrame(tick);
    }

    window.addEventListener("resize", () => {
        resize();
        initParticles();
    });

    resize();
    initParticles();
    tick();

})();


// ===============================
// INIT
// ===============================

resizeChart();
drawChart();

// Update sensor/telemetry data every 2 seconds
setInterval(updateDashboard, 2000);
updateDashboard();

// Check for a simulated fire event every 6 seconds (demo purposes)
setInterval(maybeToggleDanger, 6000);

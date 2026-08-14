const loginForm =
document.getElementById("loginForm");

const loginCard =
document.getElementById("loginCard");

const loginBtn =
document.getElementById("loginBtn");

loginForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();

        const username =
        document.getElementById("username").value;

        const password =
        document.getElementById("password").value;

        const message =
        document.getElementById("loginMessage");

        loginBtn.classList.add("loading");
        loginBtn.innerHTML = "CHECKING...";

        // small delay so the button state is actually visible (feels more "real")
        setTimeout(() => {

            if (
                username === "FFR01" &&
                password === "fire123"
            ) {

                message.innerHTML = "✅ Access granted — loading dashboard...";
                message.style.color = "#00ff88";
                loginBtn.innerHTML = "SUCCESS";

                localStorage.setItem(
                    "fireRobotLoggedIn",
                    "true"
                );

                setTimeout(() => {
                    window.location.href = "dashboard.html";
                }, 500);

            } else {

                message.innerHTML =
                "❌ Invalid Username or Password";

                message.style.color =
                "#ff4d4d";

                loginBtn.classList.remove("loading");
                loginBtn.innerHTML = "LOGIN TO DASHBOARD";

                loginCard.classList.remove("shake");
                // force reflow so the animation can replay
                void loginCard.offsetWidth;
                loginCard.classList.add("shake");

            }

        }, 450);

    }
);


// ===============================
// EMBER PARTICLE BACKGROUND (shared visual language with dashboard)
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
        const count = Math.min(60, Math.floor((canvas.width * canvas.height) / 22000));
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

<script>
        const canvas = document.getElementById("solarSystemCanvas");
        const ctx = canvas.getContext("2d");
        const pauseButton = document.getElementById("pauseButton");
        const slowerButton = document.getElementById("slowerButton");
        const fasterButton = document.getElementById("fasterButton");
        const resetButton = document.getElementById("resetButton");

        const sun = { x: 500, y: 400, radius: 50 };
        let earth = { angle: 0, semiMajorAxis: 300, eccentricity: 0.0167, size: 20, isDragging: false };
        const moon = { angle: 0, radius: 50, size: 10, rotations: 0 };
        let isPaused = false;
        let speedMultiplier = 0.7;

        // Monthly distances in AU (Astronomical Units), where 1 AU is approx. 149.6 million km
        const monthlyDistances = [
            0.983, // January (perihelion)
            0.987, // February
            0.992, // March
            0.999, // April
            1.006, // May
            1.014, // June
            1.017, // July (aphelion)
            1.016, // August
            1.011, // September
            1.003, // October
            0.994, // November
            0.986  // December
        ];

        function drawSun() {
            ctx.beginPath();
            ctx.arc(sun.x, sun.y, sun.radius, 0, Math.PI * 2);
            ctx.fillStyle = "yellow";
            ctx.fill();
            ctx.font = "20px Arial";
            ctx.fillStyle = "black";
            ctx.textAlign = "center";
            ctx.fillText("Sun", sun.x, sun.y + 8);
        }

        function drawEarth() {
            const monthIndex = Math.floor((earth.angle / (2 * Math.PI)) * 12) % 12;
            const distance = earth.semiMajorAxis * monthlyDistances[monthIndex];
            const semiMinorAxis = distance * Math.sqrt(1 - earth.eccentricity ** 2);
            const earthX = sun.x + distance * Math.cos(earth.angle);
            const earthY = sun.y + semiMinorAxis * Math.sin(earth.angle);
            earth.x = earthX;
            earth.y = earthY;
            ctx.beginPath();
            ctx.arc(earthX, earthY, earth.size, 0, Math.PI * 2);
            ctx.fillStyle = "blue";
            ctx.fill();

            // Label the month and distance below Earth
            ctx.font = "14px Arial";
            ctx.fillStyle = "black";
            const distanceInMillionKm = (distance / 300) * 149.6; // Scale distance to million km
            ctx.fillText(`${getMonthName(monthIndex)}: ${distanceInMillionKm.toFixed(1)} million km`, earthX - 30, earthY + 40);
        }

        function drawMoon() {
            const moonRotationsPerYear = 13; // Moon completes approximately 13 rotations around Earth per year
            if (!isPaused && !earth.isDragging) {
                moon.angle += 0.005 * moonRotationsPerYear * speedMultiplier; // Update moon angle relative to Earth's movement
                if (moon.angle >= 2 * Math.PI) {
                    moon.angle -= 2 * Math.PI;
                    moon.rotations += 1;
                }
                if (earth.angle >= 2 * Math.PI) {
                    moon.rotations = 0; // Reset moon rotations at the beginning of each year
                }
            }
            const moonX = earth.x + moon.radius * Math.cos(moon.angle);
            const moonY = earth.y + moon.radius * Math.sin(moon.angle);
            ctx.beginPath();
            ctx.arc(moonX, moonY, moon.size, 0, Math.PI * 2);
            ctx.fillStyle = "gray";
            ctx.fill();

            // Label the moon rotation count below the moon
            ctx.fillText(`Rotation Count: ${moon.rotations}`, moonX - 30, moonY + 20);
        }

        function drawOrbit() {
            ctx.beginPath();
            ctx.ellipse(sun.x, sun.y, earth.semiMajorAxis, earth.semiMajorAxis * Math.sqrt(1 - earth.eccentricity ** 2), 0, 0, Math.PI * 2);
            ctx.strokeStyle = "black";
            ctx.lineWidth = 1;
            ctx.stroke();
        }

        function drawLegend() {
            // Draw Earth legend
            ctx.beginPath();
            ctx.arc(900, 700, 10, 0, Math.PI * 2);
            ctx.fillStyle = "blue";
            ctx.fill();
            ctx.font = "14px Arial";
            ctx.fillStyle = "black";
            ctx.fillText("Earth", 933, 705);

            // Draw Moon legend
            ctx.beginPath();
            ctx.arc(900, 730, 10, 0, Math.PI * 2);
            ctx.fillStyle = "gray";
            ctx.fill();
            ctx.fillText("Moon", 933, 735);
        }

        function drawSpeed() {
            ctx.font = "15px Arial";
            ctx.fillStyle = "black";
            ctx.fillText(`Simulation Speed: ${(speedMultiplier / 0.7).toFixed(1)}`, 100, canvas.height - 75);
        }

        function draw() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            drawOrbit();
            drawSun();
            drawEarth();
            drawMoon();
            drawLegend();
            drawSpeed();
        }

        function getMousePos(canvas, evt) {
            const rect = canvas.getBoundingClientRect();
            return {
                x: evt.clientX - rect.left,
                y: evt.clientY - rect.top
            };
        }

        function getMonthName(index) {
            const months = [
                "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"
            ];
            return months[index];
        }

        

        canvas.addEventListener("mousedown", (e) => {
            const pos = getMousePos(canvas, e);
            const distance = Math.sqrt((pos.x - earth.x) ** 2 + (pos.y - earth.y) ** 2);
            if (distance < earth.size) {
                earth.isDragging = true;
            }
        });

        canvas.addEventListener("mousemove", (e) => {
            if (earth.isDragging) {
                const pos = getMousePos(canvas, e);
                earth.angle = Math.atan2(pos.y - sun.y, pos.x - sun.x);
                if (earth.angle < 0) {
                    earth.angle += 2 * Math.PI;
                }
                moon.angle = earth.angle * 13; // Update moon angle to match Earth's movement during dragging
                moon.rotations = Math.floor(moon.angle / (2 * Math.PI)); // Update moon rotations during dragging
                draw();
            }
        });

        canvas.addEventListener("mouseup", () => {
            earth.isDragging = false;
            moon.angle = (earth.angle * 13) % (2 * Math.PI);
        });

        canvas.addEventListener("mouseleave", () => {
            earth.isDragging = false;
            moon.angle = (earth.angle * 13) % (2 * Math.PI);
        });

        pauseButton.addEventListener("click", () => {
            isPaused = !isPaused;
            pauseButton.textContent = isPaused ? "Resume" : "Pause";
        });

        slowerButton.addEventListener("click", () => {
            speedMultiplier = Math.max(0.1, speedMultiplier - 0.1);
        });

        fasterButton.addEventListener("click", () => {
            speedMultiplier += 0.1;
        });

        resetButton.addEventListener("click", () => {
            window.location.reload();
        });


        function animate() {
            if (!isPaused && !earth.isDragging) {
                earth.angle += 0.005 * speedMultiplier;
                if (earth.angle >= 2 * Math.PI) {
                    earth.angle -= 2 * Math.PI;
                    moon.rotations = -1; // Reset moon rotations at the beginning of each year
                }
            }
            draw();
            requestAnimationFrame(animate);
        }

        animate();
    </script>

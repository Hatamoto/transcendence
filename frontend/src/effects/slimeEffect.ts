export const startSlimeEffect = () => {
	const canvas = document.getElementById("slime-bg") as HTMLCanvasElement;
	if (!canvas) return;

	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// ctx.fillStyle = "green";
	// ctx.fillStyle = "lawngreen";
	// ctx.fillStyle = "lime";
	// ctx.fillStyle = "white";
	// ctx.fillStyle = "yellow";
	// ctx.fillStyle = "black";
	// ctx.fillStyle = "#00ff00"; // bright green
	// ctx.fillStyle = "#ff00ff"; // pink
	// ctx.fillStyle = "#333333"; // dark gray
	// ctx.fillStyle = "rgb(0,255,0)";    // green
	// ctx.fillStyle = "rgba(0,255,0,0.4)"; // translucent green

	// 🎨 Slime visual theme — change these to customize the effect
	const SLIME_COLOR = "lime";                          // Color of the blobs
	const SLIME_STROKE_COLOR = "rgba(0,255,0,0.4)";    // Color of the lines between blobs
	const SLIME_TRAIL_FILL = "rgba(0, 0, 0, 0.1)";     // Background trail fade
	const SPEEDX = 0.1;                                   // Speed of the blobs in the x direction
	const SPEEDY = 0.2;                                   // Speed of the blobs
	const GRAVITY = 0.005;                                 // Gravity effect on the blobs
	
	// 🟢 MAIN SLIME COLOR — This sets the color of the "drip" circles.
	ctx.fillStyle = SLIME_COLOR;
	// 🟡 CONNECTION LINE COLOR — Used in connectParticles() to draw lines between close drips.
	ctx.strokeStyle = SLIME_STROKE_COLOR;
	ctx.lineWidth = 50;
	ctx.lineCap = "round";
	ctx.lineJoin = "round";

	class Drip {
		radius: number;
		x: number;
		y: number;
		speedX: number;
		speedY: number;
		angle: number;
		va: number;
		range: number;
		gravity: number;
		vy: number;
		effect: DrippingEffect;

		constructor(effect: DrippingEffect) {
			this.effect = effect;
			this.radius = Math.random() * 80 + 20;
			this.x = 2 * this.radius + Math.random() * (this.effect.width - this.radius * 4);
			this.y = -this.radius;
			this.speedX = Math.random() * SPEEDX - 0.1;
			this.speedY = Math.random() * SPEEDY + 0.2;
			this.angle = 0;
			this.va = Math.random() * 0.1 - 0.05;
			this.range = Math.random() * 10;
			this.gravity = Math.random() * GRAVITY;
			this.vy = 0;
		}

		update() {
			if (this.x < this.radius || this.x > this.effect.width - this.radius) this.speedX *= -1;
			if (this.y > this.effect.height + this.radius) this.reset();
			if (this.y > this.radius) {
				this.vy += this.gravity;
				this.speedY += this.vy;
				this.angle += this.va;
			}
			if (this.y > this.radius * 2) {
				this.radius -= 0.15;
			}
			this.x += this.speedX * Math.cos(this.angle) * this.range;
			this.y += this.speedY;
		}

		draw(context: CanvasRenderingContext2D) {
			context.beginPath();
			context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
			context.fill();
		}

		reset() {
			this.radius = Math.random() * 120 + 30;
			this.x = this.radius * 2 + Math.random() * (this.effect.width - this.radius * 4);
			this.y = -this.radius;
			this.vy = 0;
			this.speedY = Math.random() * SPEEDY + 0.2;
			this.va = Math.random() * 0.1 - 0.05;
		}
	}

	class DrippingEffect {
		width: number;
		height: number;
		drips: Drip[] = [];

		constructor(width: number, height: number) {
			this.width = width;
			this.height = height;
		}

		init(numberOfDrops: number) {
			for (let i = 0; i < numberOfDrops; i++) {
				this.drips.push(new Drip(this));
			}
		}

		update() {
			this.drips.forEach(drip => drip.update());
		}

		draw(context: CanvasRenderingContext2D) {
			this.drips.forEach(drip => drip.draw(context));
		}

		connectParticles(context: CanvasRenderingContext2D) {
			const maxDistance = 150;
			for (let a = 0; a < this.drips.length; a++) {
				for (let b = a; b < this.drips.length; b++) {
					const dx = this.drips[a].x - this.drips[b].x;
					const dy = this.drips[a].y - this.drips[b].y;
					const distance = Math.hypot(dx, dy);
					if (distance < maxDistance) {
						context.beginPath();
						context.moveTo(this.drips[a].x, this.drips[a].y);
						context.lineTo(this.drips[b].x, this.drips[b].y);
						context.stroke();
					}
				}
				if (this.drips[a].radius < 20 && this.drips[a].y > this.height) {
					this.drips[a] = new Drip(this); // Replace it instead of removing
				}
			}
		}

		reset(newWidth: number, newHeight: number) {
			this.width = newWidth;
			this.height = newHeight;
			this.drips.forEach(drip => drip.reset());
		}
	}

	const effect = new DrippingEffect(canvas.width, canvas.height);
	effect.init(20);

	function restartSlime() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		lastTimestamp = performance.now();
		frameCount = 0;
		effect.reset(canvas.width, canvas.height);
		animate(); // start fresh
	}

	let frameCount = 0;
	let lastTimestamp = performance.now();

	const animate = () => {
		frameCount++;
		const now = performance.now();
		const delta = now - lastTimestamp;
		lastTimestamp = now
		// Detect freeze (no frames for 1s)
		if (delta > 1000) {
			console.warn("Slime effect frozen. Restarting...");
			restartSlime();
		return;
	}
		if (frameCount % 600 === 0) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}
		ctx.fillStyle = SLIME_TRAIL_FILL;
		ctx.fillRect(0, 0, canvas.width, canvas.height);
		// 🟢 REDRAW DRIPS — Must reset to blob color before each frame.
		ctx.fillStyle = SLIME_COLOR;
		effect.update();
		effect.draw(ctx);
		if (frameCount % 4 === 0) {
			effect.connectParticles(ctx);
		}
		requestAnimationFrame(animate);
	};

	animate();

	// 🟣 OPTIONAL: Pulses the --liquid-factor for dynamic gooeyness
	let t = 0;
	function pulseLiquidFactor() {
		t += 0.02;
		const value = 20 + Math.sin(t) * 5;
		document.documentElement.style.setProperty("--liquid-factor", value.toFixed(2));
		requestAnimationFrame(pulseLiquidFactor);
	}
	pulseLiquidFactor();

	window.addEventListener("resize", () => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		// 🟢 Again, set the blob color after resize
		ctx.fillStyle = SLIME_COLOR;
		effect.reset(canvas.width, canvas.height);
	});
};

export const startSlimeEffect = () => {
	const canvas = document.getElementById("slime-bg") as HTMLCanvasElement;
	if (!canvas) return;

	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;

	// 🧠 Track current animation frame ID for cancellation
	let animationId: number;

	// 🎨 Slime visual theme — change these to customize the effect
	const SLIME_CORE_COLOR = "rgba(155, 201, 20, 0.86)";                              // Core blob color
	const SLIME_GLOW_COLOR = "rgba(222, 251, 5, 0.3)";
	const SLIME_STROKE_COLOR = "rgba(139, 176, 30, 0.8)";      // Lines between blobs
	const SLIME_TRAIL_FILL = "rgba(0, 0, 0, 0.1)";           // Canvas-wide fade effect
	const SPEEDX = 0.05;                                      // X-axis jitter
	const SPEEDY = 0.1;                                      // Initial downward drip speed
	const GRAVITY = 0.01;                                   // Drip acceleration
	const LIQUID_PULSE_SPEED = 0.02;   // How fast the goo pulses
	const LIQUID_PULSE_BASE = 20;      // Minimum base blur factor
	const LIQUID_PULSE_RANGE = 5;      // Amplitude of pulsing

	ctx.fillStyle = SLIME_CORE_COLOR;
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
			this.speedX = Math.random() * SPEEDX;
			this.speedY = Math.random() * SPEEDY;
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
			// Draw the glow layer — larger and semi-transparent
			context.beginPath();
			context.fillStyle = SLIME_GLOW_COLOR;
			context.arc(this.x, this.y, this.radius * 1.4, 0, Math.PI * 2); // glow is bigger
			context.fill();
		
			// Draw the core layer — solid and centered
			context.beginPath();
			context.fillStyle = SLIME_CORE_COLOR;
			context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
			context.fill();
		}

		reset() {
			this.radius = Math.random() * 120 + 30;
			this.x = this.radius * 2 + Math.random() * (this.effect.width - this.radius * 4);
			this.y = -this.radius;
			this.vy = 0;
			this.speedY = Math.random() * SPEEDY;
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
					this.drips[a] = new Drip(this);
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
	effect.init(40);

	effect.update = function () {
		this.drips.forEach(drip => drip.update());
	
		// Slowly reduce to 30 drips over time
		if (this.drips.length > 20 && Math.random() < 0.2) {
			this.drips.pop(); // remove one occasionally
		}
	};

	let frameCount = 0;
	let lastTimestamp = performance.now();

	function restartSlime() {
		// 🛑 Cancel current animation loop
		cancelAnimationFrame(animationId);

		// 🔁 Reset timing and state
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		lastTimestamp = performance.now();
		frameCount = 0;
		effect.reset(canvas.width, canvas.height);

		// ▶️ Start new loop
		animate();
	}

	const animate = () => {
		frameCount++;
		const now = performance.now();
		const delta = now - lastTimestamp;
		lastTimestamp = now;

		// ❄️ Detect a freeze (>1s between frames)
		if (delta > 1000) {
			console.warn("Slime effect frozen. Restarting...");
			restartSlime();
			return;
		}

		// 🧼 Occasionally deep clear the canvas
		if (frameCount % 600 === 0) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}

		ctx.fillStyle = SLIME_TRAIL_FILL;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		ctx.fillStyle = SLIME_CORE_COLOR;
		effect.update();
		effect.draw(ctx);

		if (frameCount % 4 === 0) {
			effect.connectParticles(ctx);
		}

		animationId = requestAnimationFrame(animate);
	};

	animate();

	// 🌊 Pulse gooiness with CSS variable
	let t = 0;
	function pulseLiquidFactor() {
		t += LIQUID_PULSE_SPEED;
		const value = LIQUID_PULSE_BASE + Math.sin(t) * LIQUID_PULSE_RANGE;
		document.documentElement.style.setProperty("--liquid-factor", value.toFixed(2));
		requestAnimationFrame(pulseLiquidFactor);
	}
	pulseLiquidFactor();

	// 🪟 Reset on resize
	window.addEventListener("resize", () => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;
		ctx.fillStyle = SLIME_CORE_COLOR;
		effect.reset(canvas.width, canvas.height);
	});
};
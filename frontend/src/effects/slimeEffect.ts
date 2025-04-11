export const startSlimeEffect = () => {
	const canvas = document.getElementById("slime-bg") as HTMLCanvasElement;
	const header = document.querySelector("header") as HTMLElement;

	console.log("🟢 startSlimeEffect initialized");

	if (!canvas || !header) return;

	const HEADER_HEIGHT = header.offsetHeight;

	console.log("Header height:", HEADER_HEIGHT);

	// Position canvas below the header
	canvas.style.position = "fixed";
	canvas.style.top = `${HEADER_HEIGHT}px`;
	canvas.style.left = "0";
	canvas.style.width = "100vw";
	canvas.style.height = `calc(100vh - ${HEADER_HEIGHT}px)`;
	canvas.style.zIndex = "-1";
	canvas.style.backgroundColor = "black";
	canvas.style.pointerEvents = "none";
	canvas.style.filter = "blur(calc(var(--liquid-factor, 20) * 1px)) contrast(calc(var(--liquid-factor, 20) * 3))";
	canvas.style.scale = "1.1";

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight - HEADER_HEIGHT;

	// Style constants
	const SLIME_CORE_COLOR = "#00ff88";
	const SLIME_GLOW_COLOR = "rgba(0, 255, 150, 0.15)";
	const SLIME_STROKE_COLOR = "rgba(0, 255, 100, 0.2)";
	const SLIME_TRAIL_FILL = "rgba(0, 0, 0, 0.08)";
	const SPEEDX = 0.04;
	const MIN_SPEEDY = 0.2;  // enforce minimum downward speed
	const MAX_SPEEDY = 0.3;
	const GRAVITY = 0.005;
	const LINE_WIDTH = 60;
	const LIQUID_PULSE_SPEED = 0.02;
	const LIQUID_PULSE_BASE = 20;
	const LIQUID_PULSE_RANGE = 5;
	const GLOW_RADIUS_FACTOR = 1.8;
	const DRIP_COUNT_INITIAL = 100;

	let glowRadiusFactor = GLOW_RADIUS_FACTOR;

	const ctx = canvas.getContext("2d");
	if (!ctx) return;

	ctx.fillStyle = SLIME_CORE_COLOR;
	ctx.strokeStyle = SLIME_STROKE_COLOR;
	ctx.lineWidth = LINE_WIDTH;
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
			this.x = 2 * this.radius + Math.random() * (effect.width - this.radius * 4);
			this.y = this.radius + HEADER_HEIGHT + Math.random() * (effect.height - this.radius * 2); // full space, center always below top
			this.speedX = Math.random() * SPEEDX - SPEEDX / 2;
			this.speedY = Math.max(Math.random() * MAX_SPEEDY, MIN_SPEEDY);
			this.angle = 0;
			this.va = Math.random() * 0.1 - 0.05; // angular velocity (wobble/drift)
			this.range = Math.random() * 10;
			this.gravity = Math.random() * GRAVITY;
			this.vy = Math.random() * GRAVITY; // Vertical acceleration - gravity influences this
		}

		update() {
			if (this.x < this.radius || this.x > this.effect.width - this.radius) this.speedX *= -1;
			if (this.y > this.effect.height + this.radius) this.reset();
			if (this.y < this.radius + HEADER_HEIGHT) this.y = this.radius + HEADER_HEIGHT; // never go above top
			this.vy += this.gravity;
			this.speedY += this.vy;
			this.angle += this.va;

			this.x += this.speedX * Math.cos(this.angle) * this.range;
			this.y += Math.max(this.speedY, MIN_SPEEDY);
		}

		draw(ctx: CanvasRenderingContext2D) {
			ctx.beginPath();
			ctx.fillStyle = SLIME_GLOW_COLOR;
			ctx.arc(this.x, this.y, this.radius * glowRadiusFactor, 0, Math.PI * 2);
			ctx.fill();

			ctx.beginPath();
			ctx.fillStyle = SLIME_CORE_COLOR;
			ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
			ctx.fill();
		}

		reset() {


			this.radius = Math.random() * 80 + 20;
		
			this.x = 2 * this.radius + Math.random() * (this.effect.width - this.radius * 4);
			this.y = this.radius + HEADER_HEIGHT;
		
			this.vy = this.gravity;
		
			this.speedY = Math.max(Math.random() * MAX_SPEEDY, MIN_SPEEDY);

		
			this.va = Math.random() * 0.1 - 0.05;


			// this.radius = Math.random() * 80 + 20;
			// this.x = 2 * this.radius + Math.random() * (this.effect.width - this.radius * 4);
			// this.y = this.radius + HEADER_HEIGHT;
			// this.vy = Math.random() * GRAVITY;
			// this.speedY = Math.max(Math.random() * MAX_SPEEDY, MIN_SPEEDY);
			// this.va = Math.random() * 0.1 - 0.05;
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

		init(count: number) {
			for (let i = 0; i < count; i++) {
				this.drips.push(new Drip(this));
			}
		}

		update() {
			this.drips.forEach(d => d.update());
		}

		draw(ctx: CanvasRenderingContext2D) {
			this.drips.forEach(d => d.draw(ctx));
		}
	}

	const effect = new DrippingEffect(canvas.width, canvas.height);
	effect.init(DRIP_COUNT_INITIAL);

	let frameCount = 0;
	let lastTimestamp = performance.now();
	let animationId: number;

	const animate = () => {
		frameCount++;
		const now = performance.now();
		const delta = now - lastTimestamp;
		lastTimestamp = now;

		if (delta > 1000) {
			console.warn("Restarting due to freeze...");
			effect.drips = [];
			effect.init(DRIP_COUNT_INITIAL);
			return animate();
		}

		if (frameCount % 600 === 0) {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
		}

		ctx.fillStyle = SLIME_TRAIL_FILL;
		ctx.fillRect(0, 0, canvas.width, canvas.height);

		effect.update();
		effect.draw(ctx);

		animationId = requestAnimationFrame(animate);
	};

	animate();

	let t = 0;
	const pulseLiquidFactor = () => {
		t += LIQUID_PULSE_SPEED;
		const val = LIQUID_PULSE_BASE + Math.sin(t) * LIQUID_PULSE_RANGE;
		document.documentElement.style.setProperty("--liquid-factor", val.toFixed(2));
		requestAnimationFrame(pulseLiquidFactor);
	};
	pulseLiquidFactor();

	let glowT = 0;
	const pulseGlow = () => {
		glowT += 0.02;
		glowRadiusFactor = 1.6 + Math.sin(glowT) * 0.4;
		requestAnimationFrame(pulseGlow);
	};
	pulseGlow();

	window.addEventListener("resize", () => {
		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight - header.offsetHeight;
		effect.width = canvas.width;
		effect.height = canvas.height;
	});
};

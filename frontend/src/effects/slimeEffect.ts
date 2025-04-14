import { EFFECTS } from "../config/env-config";

let isSlimeEffectRunning = false;

export const startSlimeEffect = () => {

	if (EFFECTS === false) {
		console.log("🟢 Slime effect disabled via configuration");
		return;
	  }
	
	if (isSlimeEffectRunning) {
		console.log("🟢 Slime effect already running, skipping initialization");
		return;
	}
	isSlimeEffectRunning = true;


	console.log("🟢 startSlimeEffect initialized");

	const canvas = document.getElementById("slime-bg") as HTMLCanvasElement;
	const header = document.querySelector("header") as HTMLElement;

	if (!canvas || !header) return;

	const HEADER_HEIGHT = header.offsetHeight;

	console.log("Header height:", HEADER_HEIGHT);

	canvas.width = window.innerWidth;
	canvas.height = window.innerHeight;;

	// Style constants
	const SLIME_CORE_COLOR = "#00ff88";
	const SLIME_GLOW_COLOR = "rgba(0, 255, 150, 0.15)";
	const SLIME_STROKE_COLOR = "rgba(5, 5, 5, 0.85)";
	const SLIME_TRAIL_FILL = "rgba(0, 0, 0, 0.4)";
	const SPEEDX = 0.002;
	const SPEEDY = 0.0005;
	const GRAVITY = 0.00001;
	const LINE_WIDTH = 60;
	const LIQUID_PULSE_SPEED = 0.02;
	const LIQUID_PULSE_BASE = 20;
	const LIQUID_PULSE_RANGE = 5;
	const GLOW_RADIUS_FACTOR = 1.0;
	const DRIP_COUNT_INITIAL = 50;
	const RADIUS_FACTOR = 70;

	let glowRadiusFactor = GLOW_RADIUS_FACTOR;
	let dripCount = DRIP_COUNT_INITIAL;

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
			this.radius = Math.random() * (RADIUS_FACTOR / 2) + (RADIUS_FACTOR / 4);
			this.x = 2 * this.radius + Math.random() * (effect.width - this.radius * 4);
			this.y = this.radius + Math.random() * (effect.height - this.radius * 2); // full space, center always below top
			this.speedX = Math.random() * SPEEDX - SPEEDX / 4;
			this.speedY = Math.max(Math.random() * SPEEDY);
			this.angle = 0;
			this.va = Math.random() * 0.02 - 0.05; // angular velocity (wobble/drift)
			this.range = Math.random() * 10;
			this.gravity = Math.random() * GRAVITY;
			this.vy = this.gravity; // Vertical acceleration - gravity influences this
		}

		update() {
			if (this.x < this.radius || this.x > this.effect.width - this.radius) this.speedX *= -1;
			if (this.y > this.effect.height + this.radius) this.reset();
			if (this.y < this.radius) this.y = this.radius; // never go above top
			this.vy += this.gravity;
			this.speedY += this.vy;
			this.angle += this.va;

			this.x += this.speedX * Math.cos(this.angle) * this.range;
			this.y += Math.max(this.speedY + this.vy, 0.02);
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
			this.radius = Math.random() * RADIUS_FACTOR + (RADIUS_FACTOR / 4);
			this.x = 2 * this.radius + Math.random() * (this.effect.width - this.radius * 4);
			this.y = HEADER_HEIGHT - this.radius * Math.random(); // full space, center always below top
			this.vy = this.gravity;
			this.speedY = Math.max(Math.random() * SPEEDY);
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
		if (document.querySelector("#game-container canvas")) {
			cancelAnimationFrame(animationId);
			console.info("🎮 Game started — slime effect disabled");
			return;
		}
		frameCount++;
		const now = performance.now();
		const delta = now - lastTimestamp;
		lastTimestamp = now;

		if (delta > 1000) {
			console.warn("Restarting due to freeze...");
			effect.drips = [];
			dripCount = Math.max(10, dripCount - 5);
			effect.init(dripCount);
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
		glowRadiusFactor = GLOW_RADIUS_FACTOR + Math.sin(glowT) * 0.1;
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

// Add this export to slimeEffect.ts
export const restartSlimeEffect = () => {
	if (EFFECTS === false) {
		console.log("🟢 Slime effect disabled via configuration");
		return;
	  }
	// Only try to restart if it was previously running
	if (isSlimeEffectRunning) {
	  // Reset the flag so startSlimeEffect will run again
	  isSlimeEffectRunning = false;
	  
	  // Start it again
	  startSlimeEffect();
	  console.log("🟢 Slime effect restarted");
	}
  };

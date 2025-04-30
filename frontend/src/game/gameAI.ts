import { Ball } from "./frontEndGame"

export interface PredictedPath {
	finalY: number;
	points: [number, number][];
}

export class GameAI {
	private ctx: CanvasRenderingContext2D = null;
	private canvasHeight: number = 0;
	private targetX: number = 0;
	private timer

	constructor(
		ctx: CanvasRenderingContext2D,
		canvasHeight: number = 480,
		targetX: number = 690
	) {
		this.ctx = ctx;
		this.canvasHeight = canvasHeight;
		this.targetX = targetX;
	}

// This now accepts your real class instance
public predict(ball: Ball): PredictedPath {
	let simulatedXVel = ball.xVel * ball.speed;
	let simulatedYVel = ball.yVel * ball.speed;
	let simulatedX = ball.xPos;
	let simulatedY = ball.yPos;
	const radius = ball.width; // assuming square ball

	const pathPoints: [number, number][] = [[simulatedX, simulatedY]];

	while (simulatedX !== this.targetX) {
		const nextX =
			simulatedXVel > 0
				? Math.min(simulatedX + simulatedXVel, this.targetX)
				: Math.max(simulatedX + simulatedXVel, this.targetX);

		let nextY = simulatedY + simulatedYVel;

		if (nextY - radius < 0 || nextY + radius > this.canvasHeight) {
			simulatedYVel *= -1;
			nextY = simulatedY + simulatedYVel;
		}

		pathPoints.push([nextX, nextY]);
		simulatedX = nextX;
		simulatedY = nextY;
	}

	this.drawPrediction(pathPoints);

	return {
		finalY: simulatedY,
		points: pathPoints
	};
}


	private drawPrediction(pathPoints: [number, number][]) {
		this.ctx.strokeStyle = "red";
		this.ctx.lineWidth = 2;
		this.ctx.beginPath();

		for (let i = 0; i < pathPoints.length - 1; i++) {
			const [x1, y1] = pathPoints[i];
			const [x2, y2] = pathPoints[i + 1];
			this.ctx.moveTo(x1, y1);
			this.ctx.lineTo(x2, y2);
		}

		this.ctx.stroke();
	}
}

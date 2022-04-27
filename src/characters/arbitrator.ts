import { Arbitrator, ArbitratorInstance } from '../ai/behaviour/arbitrator';
import { Scene } from './scene';
import Slime from './slime';

export class ArbitratorCharacter {
	private instance: ArbitratorInstance;
	public location: { x: number; y: number };

	constructor(
		private scene: Scene,
		tile: { x: number; y: number },
		soul: Arbitrator
	) {
		this.instance = new ArbitratorInstance(soul, tile);
		this.location = scene.tilesToPixels(tile);
	}

	getTarget(): { x: number; y: number } | null {
		const tile = this.instance.getTarget();
		if (!tile) return null;
		return this.scene.tilesToPixels(tile);
	}

	visitedBySlime(slime: Slime) {
		this.instance.visitedBySlime(slime);
	}
}

import Phaser from 'phaser';
import { Scene } from './scene';

export default class Portal extends Phaser.Physics.Arcade.Sprite {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		name: string,
		frame: number,
		private timeToClose: number,
		readonly animations: string[]
	) {
		super(scene, x, y, name, frame);
		scene.physics.world.enable(this);
		scene.add.existing(this);
	}
	timer = 0;

	update() {
		if (this.timer > this.timeToClose) {
			this.destroy();
		} else this.timer += 1;
	}
}

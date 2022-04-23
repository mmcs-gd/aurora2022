import Phaser from 'phaser';
import Portal from './portal';

export default class Seed extends Phaser.Physics.Arcade.Sprite {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		name: string,
		frame: number,
		private timeToClose: number,
		readonly animations: string[],
	) {
		super(scene, x, y, name, frame);
		scene.physics.world.enable(this);
		scene.add.existing(this);
	}
	timer = 0;
	destroySeed() {
		this.destroy();
	}

	update() {
		if (this.timer > this.timeToClose) {
			// const portal = new Portal(
			// 	this.scene,
			// 	this.x,
			// 	this.y,
			// 	'portal',
			// 	-1,
			// 	400,
			// 	5,
			// 	[]
			// );
			// portal.setCollideWorldBounds(true);
			this.destroy();
		} else this.timer += 1;
	}
}

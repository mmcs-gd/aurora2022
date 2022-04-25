import Phaser from 'phaser';
import CharacterFactory from './character_factory';

export default class Seed extends Phaser.Physics.Arcade.Sprite {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		name: string,
		private timeToClose: number,
		readonly factory: CharacterFactory
	) {
		super(scene, x, y, name);
		scene.physics.world.enable(this);
		scene.add.existing(this);
	}
	timer = 0;
	flag = false;

	update() {
		if (this.timer > this.timeToClose && !this.flag) {
			this.factory.buildPortal(this.x, this.y, 5);
			this.timer = 0;
			this.flag = true;
			this.destroy();
		} else {
			this.timer += 1;
		}
	}
}

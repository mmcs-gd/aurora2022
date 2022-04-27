import Phaser from 'phaser';
import Slime from './slime';

export default class Portal extends Phaser.Physics.Arcade.Sprite {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		name: string,
		private timeToClose: number,
		public capacity: number
	) {
		super(scene, x, y, name);
		scene.physics.world.enable(this);
		scene.add.existing(this);
	}
	timer = 0;
	count = 0;

	slimes: Slime[] = [];

	addSlime(input: Slime) {
		if (this.count < this.capacity) {
			console.log(`Add slime ${this.count + 1}/${this.capacity}`);
			this.slimes.push(input);
			this.count += 1;
			return true;
		}
		return false;
	}

	destroyWithSlimes() {
		this.slimes.forEach(element => {
			element.destroy();
		});
		this.destroy();
	}

	update() {
		if (this.count === this.capacity) {
			if (this.timer > this.timeToClose) {
				this.destroyWithSlimes();
			} else this.timer += 1;
		}
	}
}

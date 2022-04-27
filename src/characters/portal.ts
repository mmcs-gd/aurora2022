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

	get count(): number {
		return this.slimes.length;
	}

	slimes: Slime[] = [];

	addSlime(input: Slime) {
		if (this.count < this.capacity) {
			console.log(`Add slime ${this.count + 1}/${this.capacity}`);
			this.slimes.push(input);
			input.portal = this;
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

	deleteJelly(jelly: Slime) {
		this.slimes = this.slimes.filter(it => it != jelly);
	}

	update() {
		if (this.count === this.capacity) {
			if (this.timer > this.timeToClose) {
				this.destroyWithSlimes();
			} else this.timer += 1;
		}
	}
}

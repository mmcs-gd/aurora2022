import Phaser from 'phaser';
import Slime from './slime';

export default class Portal extends Phaser.Physics.Arcade.Sprite {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		name: string,
		frame: number,
		private timeToClose: number,
		private maxSlime: number,
		readonly animations: string[]
	) {
		super(scene, x, y, name, frame);
		scene.physics.world.enable(this);
		scene.add.existing(this);
	}
	timer = 0;
	currentSlime = 0;

	slimes: Slime[] = [];

	addSlime(input: Slime) {
		if (this.currentSlime < this.maxSlime) {
			this.slimes.push(input);
			input.inPortal = true;
			this.currentSlime += 1;
			return true;
		}
		return false;
	}

	destroyPortalWithoutSlime() {
		this.slimes.forEach(element => {
			element.inPortal = false;
		});
		this.destroy();
	}

	update() {
		if (this.currentSlime === this.maxSlime) {
			if (this.timer > this.timeToClose) {
				this.slimes.forEach(element => {
					element.destroy();
				});
				this.destroy();
			} else this.timer += 1;
		}
	}
}

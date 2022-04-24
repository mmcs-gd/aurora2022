import Phaser from 'phaser';
import Sprite = Phaser.Physics.Arcade.Sprite;
import CharacterFactory from './character_factory';


export default class Seed extends Phaser.Physics.Arcade.Sprite {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		name: string,
		frame: number,
		private timeToClose: number,
		readonly animations: string[],
		private gameObjects: Sprite[],
		private characterFactory: CharacterFactory,

	) {
		super(scene, x, y, name, frame);
		scene.physics.world.enable(this);
		scene.add.existing(this);
	}
	timer = 0;
	flag = false;

	update() {
		if (this.timer > this.timeToClose && !this.flag) {
			this.destroy();
			const portal = this.characterFactory.buildPortal(this.x, this.y, 5);
			this.gameObjects.push(portal);
			//this.scene.physics.add.collider(portal, this.worldLayer);
			this.timer = 0;
			this.flag = true;
		} else {
			this.timer += 1;
		}
	}
}

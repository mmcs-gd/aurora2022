import Phaser from 'phaser';
import Sprite = Phaser.Physics.Arcade.Sprite;
import CharacterFactory from './character_factory';
import Physics = Phaser.Physics.Arcade.ArcadePhysics;
import WorldLayer = Phaser.Tilemaps.TilemapLayer;

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
		private physics: Physics,
		private worldLayer: WorldLayer

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
			const portal = this.characterFactory.buildPortal(this.x, this.y, 5);
			this.gameObjects.push(portal);
			this.physics.add.collider(portal, this.worldLayer);
			this.destroy();
			this.timer=0;
		} else this.timer += 1;
	}
}

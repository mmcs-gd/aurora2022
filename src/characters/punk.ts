import Steering from '../ai/steerings/steering';

import Sprite = Phaser.Physics.Arcade.Sprite;
import CharacterFactory from './character_factory';
import Physics = Phaser.Physics.Arcade.ArcadePhysics;
import WorldLayer = Phaser.Tilemaps.TilemapLayer;
import { Wander } from '../ai/steerings/wander';

export default class Punk extends Phaser.Physics.Arcade.Sprite {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		name: string,
		frame: string | number,
		readonly maxSpeed: number,
		readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys,
		readonly animationSets: Map<string, string[]>,
		private gameObjects: Sprite[],
		private characterFactory: CharacterFactory,
		private physics: Physics,
		private worldLayer: WorldLayer
	) {
		super(scene, x, y, name, frame);
		scene.physics.world.enable(this);
		scene.add.existing(this);
		this.setVelocity(1);
	}

	protected steerings: Steering[] = [new Wander(this, this.gameObjects, 1)];
	protected last = Date.now();

	update() {
		const body = this.body as Phaser.Physics.Arcade.Body;
		let imp;
		this.steerings.forEach(st => {
			imp = st.calculateImpulse();
			body.velocity.x += imp.x * st.force;
			body.velocity.y += imp.y * st.force;
		});

		body.velocity.normalize().scale(this.maxSpeed);

		//ограничиваем частоту обновления анимаций
		if (Date.now() - this.last > 600) {
			this.updateAnimation();
			this.last = Date.now();
		}
	}

	addSteering(steering: Steering) {
		this.steerings.push(steering);
	}

	updateAnimation() {
		const animations = this.animationSets.get('Walk')!;
		const animsController = this.anims;
		const x = this.body.velocity.x;
		const y = this.body.velocity.y;
		if (x < 0) {
			animsController.play(animations[0], true);
		} else if (x > 0) {
			animsController.play(animations[1], true);
		} else if (y < 0) {
			animsController.play(animations[2], true);
		} else if (y > 0) {
			animsController.play(animations[3], true);
		} else {
			const currentAnimation = animsController.currentAnim;
			if (currentAnimation) {
				const frame = currentAnimation.getLastFrame();
				this.setTexture(frame.textureKey, frame.textureFrame);
			}
		}
	}
}

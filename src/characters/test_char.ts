import { Vector } from 'matter';
import Vector2 = Phaser.Math.Vector2;
import Steering from '../ai/steerings/steering';
import { Wander } from '../ai/steerings/wander';

export default class TesterCh extends Phaser.Physics.Arcade.Sprite {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		name: string,
		frame: string | number,

		readonly maxSpeed: number,
		readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys,
		readonly animationSets: Map<string, string[]>
	) {
		super(scene, x, y, name, frame);
		scene.physics.world.enable(this);
		scene.add.existing(this);
		this.setVelocity(1);
	}

	protected steerings: Steering[] = [];

	addSteering(steering: Steering) {
		this.steerings.push(steering);
	}

	update() {
		const body = this.body as Phaser.Physics.Arcade.Body;
		let imp;
		this.steerings.forEach(st => {
			imp = st.calculateImpulse();
			if (Phaser.Math.Difference(imp.x, 0) < 0.0) {
				body.velocity.x = 0;
			} else {
				body.velocity.x += imp.x * st.force;
			}

			body.velocity.y += imp.y;
		});

		body.velocity.normalize().scale(this.maxSpeed);
		this.updateAnimation();
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

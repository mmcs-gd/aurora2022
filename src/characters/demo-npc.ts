import Steering from '../ai/steerings/steering';

export default class DemoNPC extends Phaser.Physics.Arcade.Sprite {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		name: string,
		frame: string | number,

		readonly maxSpeed: number,
		readonly animationSets: Map<string, string[]>
	) {
		super(scene, x, y, name, frame);
		scene.physics.world.enable(this);
		scene.add.existing(this);
		this.setVelocity(1);
	}

	protected steerings: Steering[] = [];
	protected last = Date.now();

	addSteering(steering: Steering) {
		this.steerings.push(steering);
	}

	update() {
		const body = this.body as Phaser.Physics.Arcade.Body;
		let imp;
		this.steerings.forEach(st => {
			imp = st.calculateImpulse();
			body.velocity.x += imp.x * st.force;
			body.velocity.y += imp.y * st.force;
			body.velocity.normalize().scale(this.maxSpeed);
		});

		//ограничиваем частоту обновления анимаций
		if (Date.now() - this.last > 600) {
			this.updateAnimation();
			this.last = Date.now();
		}
	}

	updateAnimation() {
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const animations = this.animationSets.get('Walk')!;
		const animsController = this.anims;
		const x = this.body.velocity.x;
		const y = this.body.velocity.y;

		const eps = 40;

		if (x < -eps) {
			animsController.play(animations[0], true);
		} else if (x > eps) {
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

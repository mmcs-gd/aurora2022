import Vector from '../utils/vector';
import CharacterFactory from './character_factory';
import { Scene } from './scene';
import Slime from './slime';

export default class Player extends Phaser.Physics.Arcade.Sprite {
	nearestJelly?: Slime;
	jellyInHands?: Slime;
	radius = 60;

	constructor(
		scene: Scene,
		x: number,
		y: number,
		name: string,
		frame: string | number,
		readonly factory: CharacterFactory,
		readonly maxSpeed: number,
		readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys,
		readonly animationSets: Map<string, string[]>
	) {
		super(scene, x, y, name, frame);
		scene.physics.world.enable(this);
		scene.add.existing(this);

		const camera = scene.cameras.main;
		camera.zoom = 1.5; // если нужно приблизить камеру к авроре, чтобы увидеть перемещение камеры
		camera.useBounds = true;
		const size = scene.getSize();
		camera.setBounds(0, 0, size.x, size.y);
		camera.startFollow(this);

		this.pickJelly();
		this.controlCorral();
		// this.scarePunk();
		// TODO
		this.scene.input.keyboard.on('keydown-E', () => {
			factory.punks.forEach(punk => punk.hateAurora());
		});
	}

	update() {
		console.log(this.isInCorral());
		const body = this.body as Phaser.Physics.Arcade.Body;
		body.setVelocity(0);
		const speed = this.maxSpeed;
		const cursors = this.cursors;

		if (cursors.left.isDown) {
			body.velocity.x -= speed;
		} else if (cursors.right.isDown) {
			body.velocity.x += speed;
		}

		// Vertical movement
		if (cursors.up.isDown) {
			body.setVelocityY(-speed);
		} else if (cursors.down.isDown) {
			body.setVelocityY(speed);
		}

		this.jellyInHands?.body.position.set(
			this.body.position.x,
			this.body.position.y + 3
		);
		// Normalize and scale the velocity so that player can't move faster along a diagonal
		body.velocity.normalize().scale(speed);
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
	// костыльная но работающая проверка на нахождение в загоне
	isInCorral() {
		if (this.x > 912 && this.x < 1109.5 && this.y > 172.5 && this.y < 273.5) {
			return true;
		}
		return false;
	}

	//First element in list - Aurora.
	private updateNearestJelly() {
		const spriteOffset = Vector.create(15, 15);
		const jellySpriteOffset = Vector.create(15, 16);
		const playerPosition = Vector.create(
			this.x + spriteOffset.x,
			this.y + spriteOffset.y
		);
		const factory = this.factory;
		for (let i = 0; i < factory.slimes.length; i++) {
			const position = Vector.create(
				factory.slimes[i].body.position.x,
				factory.slimes[i].body.position.y
			);
			const distanceSqr =
				Math.pow(position.x + jellySpriteOffset.x - playerPosition.x, 2) +
				Math.pow(position.y + jellySpriteOffset.y - playerPosition.y, 2);
			const inRadius = distanceSqr <= this.radius * this.radius;
			if (inRadius == false) continue;

			this.nearestJelly = factory.slimes[i];
			return;
		}
	}

	pickJelly() {
		this.scene.input.keyboard.on('keydown-Q', () => {
			if (this.jellyInHands != undefined) {
				this.jellyInHands.setActive(true);
				this.jellyInHands = undefined;
				return;
			}

			this.updateNearestJelly();

			if (this.nearestJelly == null) return;

			this.jellyInHands = this.nearestJelly;
			this.jellyInHands.setActive(false);
		});
	}

	controlCorral() {
		this.scene.input.keyboard.on('keydown-T', () => {
			const corral = this.factory.corral;
			if (!corral) {
				console.log('Corral not found!');
				return;
			}
			const spriteOffset = Vector.create(15, 15);
			const playerPosition = Vector.create(
				this.x + spriteOffset.x,
				this.y + spriteOffset.y
			);
			const position = Vector.create(
				corral.fence.body.position.x,
				corral.fence.body.position.y
			);
			const distanceSqr =
				Math.pow(position.x + corral.fence.width / 2 - playerPosition.x, 2) +
				Math.pow(position.y + corral.fence.height / 2 - playerPosition.y, 2);

			const inRadius = distanceSqr <= this.radius * this.radius;
			if (inRadius == false) return;

			if (corral.fence.isClosed == true) {
				corral.fence.openFence();
			} else {
				corral.fence.closeFence();
			}
		});
	}
}

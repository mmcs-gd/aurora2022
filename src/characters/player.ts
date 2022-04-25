
import Vector from "../utils/vector";
import { Scene } from "./scene";
import Slime from "./slime";

export default class Player extends Phaser.Physics.Arcade.Sprite {

	nearestJelly: Slime;
	jellyInHands?: Slime = undefined;
	radius = 60;

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

		const camera = scene.cameras.main;
		camera.zoom = 1.5; // если нужно приблизить камеру к авроре, чтобы увидеть перемещение камеры
		camera.useBounds = true;
		const _scene = scene as Scene;
		const size = _scene.getSize();
		camera.setBounds(0, 0, size.x, size.y);
		camera.startFollow(this);

		this.pickJelly();
		this.controlCorral();
		this.scarePunk();
	}

	update() {
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

		this.jellyInHands?.body.position.set(this.body.position.x, this.body.position.y + 3);
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

	//First element in list - Aurora.
	private updateNearestJelly() {

		const spriteOffset = Vector.create(15, 15);
		const jellySpriteOffset = Vector.create(15, 16);
		const playerPosition = Vector.create(this.x + spriteOffset.x, this.y + spriteOffset.y);
		const _scene = this.scene as Scene;
		if (_scene instanceof Phaser.Scene == false)
			return;

		for (let i = 0; i < _scene.slimes.length; i++) {
			const position = Vector.create(_scene.slimes[i].body.position.x, _scene.slimes[i].body.position.y)
			const distanceSqr =
				Math.pow(position.x + jellySpriteOffset.x - playerPosition.x, 2) +
				Math.pow(position.y + jellySpriteOffset.y - playerPosition.y, 2);
			const inRadius = distanceSqr <= this.radius * this.radius;
			if (inRadius == false)
				continue;

			this.nearestJelly = _scene.slimes[i];
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

			if (this.nearestJelly == null)
				return;

			this.jellyInHands = this.nearestJelly;
			this.jellyInHands.setActive(false);
		}
	}

	controlCorral() {
		this.scene.input.keyboard.on('keydown-T', () => {
			const _scene = this.scene as Scene;
			if (_scene instanceof Phaser.Scene == false)
				return;

			const spriteOffset = Vector.create(15, 15);
			const playerPosition = Vector.create(this.x + spriteOffset.x, this.y + spriteOffset.y);
			const position = Vector.create(_scene.corral.fenceCorral.body.position.x, _scene.corral.fenceCorral.body.position.y);
			const distanceSqr =
				Math.pow(position.x + _scene.corral.fenceCorral.width / 2 - playerPosition.x, 2) +
				Math.pow(position.y + _scene.corral.fenceCorral.height / 2 - playerPosition.y, 2);

			const inRadius = distanceSqr <= this.radius * this.radius;
			if (inRadius == false)
				return;

			if (_scene.corral.fenceCorral.isClosed == true) {
				_scene.corral.fenceCorral.openFence();
			}
			else {
				_scene.corral.fenceCorral.closeFence();
			}
		});
	}

	scarePunk() {

	}
}

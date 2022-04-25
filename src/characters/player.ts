
import Vector from "../utils/vector";
import { Scene } from "./scene";
import Slime from "./slime";

export default class Player extends Phaser.Physics.Arcade.Sprite {

	nearestObject: Phaser.GameObjects.GameObject[] = [];
	jellyInHands?: Slime = undefined;

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
		this.updateListNearestObjects();
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
	private updateListNearestObjects() {
		this.nearestObject = [];
		const radius = 60;
		const spriteOffset = Vector.create(15, 15);
		const jellySpriteOffset = Vector.create(15, 16);
		const playerPosition = Vector.create(this.x + spriteOffset.x, this.y + spriteOffset.y);
		const _scene = this.scene as Scene;
		if (_scene instanceof Phaser.Scene == false)
			return;

		this.scene.children.list.forEach(element => {
			if (this == element)
				return;
			if (element.body == null)
				return;
			const position = Vector.create(element.body.position.x, element.body.position.y)
			const distanceSqr =
				Math.pow(position.x + jellySpriteOffset.x - playerPosition.x, 2) +
				Math.pow(position.y + jellySpriteOffset.y - playerPosition.y, 2);
			const inRadius = distanceSqr <= radius * radius;
			if (inRadius == false)
				return;

			this.nearestObject.push(element);
		});
	}

	pickJelly() {
		this.scene.input.keyboard.on('keydown-Q', () => {
			if (this.jellyInHands != undefined) {
				this.jellyInHands.setActive(true);
				this.jellyInHands = undefined;
				return;
			}

			if (this.nearestObject.length == 0)
				return;

			for (let i = 0; i < this.nearestObject.length; i++) {
				const element = this.nearestObject[i];
				if (element instanceof Slime == false)
					continue;

				const nearSlime = element as Slime;
				this.jellyInHands = nearSlime;
				this.jellyInHands.setActive(false);
				break;
			}

		});
	}

	controlCorral() {

	}

	scarePunk() {
		
	}
}

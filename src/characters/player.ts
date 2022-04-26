import Vector from '../utils/vector';
import CharacterFactory from './character_factory';
import { Scene } from './scene';
import Slime from './slime';

export default class Player extends Phaser.Physics.Arcade.Sprite {
	nearestJelly?: Slime;
	jellyInHands?: Slime;
	radius = 60;
	textAuroraScream?: Phaser.GameObjects.Text;

	//Фразы надо придумать геймдизам и нарративщикам
	variousPhrases: string[] = 
	[
		"Гуляй отсюда.",
		"Это мои Желешки!!!!",
		"Ты куда лезешь?",
		"Крути педали, пока не дали..."
	];

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
		this.scarePunk();
		//this.destroyPortal(); - Ниже описан метод - нет порталов, не работает метод. Нужен на факторке.
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

	scarePunk() {
		this.scene.input.keyboard.on('keydown-E', () => {
			const factory = this.factory;
			for (let i = 0; i < factory.punks.length; i++) {
				if (!factory.punks[i]) {
					console.log('Punk not found!');
					continue;
				}
				
				const spriteOffset = Vector.create(15, 15);
				const playerPosition = Vector.create(
					this.x + spriteOffset.x,
					this.y + spriteOffset.y
				);
				const position = Vector.create(
					factory.punks[i].body.position.x,
					factory.punks[i].body.position.y
				);
				const distanceSqr =
					Math.pow(position.x + factory.punks[i].width / 2 - playerPosition.x, 2) +
					Math.pow(position.y + factory.punks[i].height / 2 - playerPosition.y, 2);

				const inRadius = distanceSqr <= this.radius * this.radius;
				if (inRadius == false) continue;

				this.textAuroraScream = this.scene.add.text(position.x,position.y, this.variousPhrases[Math.floor((Math.random() * this.variousPhrases.length))]);
				const triggerTimer = this.scene.time.addEvent({
					callback: this.timerEvent,
					callbackScope: this,
					delay: 3000, // 1000 = 1 second
					loop: true
				});

				
				factory.punks[i].hateAurora();
				return;
			}
		});
	}

	public timerEvent(): void {
        this.textAuroraScream?.destroy();
    }

	//Готовый метод уничтожения порталов, просто вставьте сюда функции уничтожения порталов, больше ничего не нужно.

	// destroyPortal() {
	// 	this.scene.input.keyboard.on('keydown-R', () => {
	// 		const factory = this.factory;
	// 		for (let i = 0; i < factory.portals.length; i++) {
	// 			if (!factory.portals[i]) {
	// 				console.log('Portal not found!');
	// 				continue;
	// 			}
				
	// 			const spriteOffset = Vector.create(15, 15);
	// 			const playerPosition = Vector.create(
	// 				this.x + spriteOffset.x,
	// 				this.y + spriteOffset.y
	// 			);
	// 			const position = Vector.create(
	// 				factory.portals[i].body.position.x,
	// 				factory.portals[i].body.position.y
	// 			);
	// 			const distanceSqr =
	// 				Math.pow(position.x + factory.portals[i].width / 2 - playerPosition.x, 2) +
	// 				Math.pow(position.y + factory.portals[i].height / 2 - playerPosition.y, 2);

	// 			const inRadius = distanceSqr <= this.radius * this.radius;
	// 			if (inRadius == false) continue;

	// 			Вот здесь и находится уничтожние порталов - только прописать нужную функцию.

	// 			factory.portal[i].destroyPortal();
	// 		}
	// 	});
	// }
}

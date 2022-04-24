import Steering from '../ai/steerings/steering';

import Sprite = Phaser.Physics.Arcade.Sprite;
import CharacterFactory from './character_factory';
import Physics = Phaser.Physics.Arcade.ArcadePhysics;
import WorldLayer = Phaser.Tilemaps.TilemapLayer;
import { Wander } from '../ai/steerings/wander';
import { GoInPoint } from '../ai/steerings/go-point';
import { Escape } from '../ai/steerings/escape';

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
		private worldLayer: WorldLayer,
		private gate: Sprite, // class Gate
		private player: Sprite // class Aurora
	) {
		super(scene, x, y, name, frame);
		scene.physics.world.enable(this);
		scene.add.existing(this);
		this.setVelocity(1);
	}

	// eslint-disable-next-line @typescript-eslint/ban-ts-comment
	// @ts-ignore
	protected steerings: Steering[] = [
		new Wander(this, 1),
		new GoInPoint(this, this.gate, 1),
		new Escape(this, this.player, 1),
		new Escape(this, this.gate, 1),
	];
	protected last = Date.now();

	timeToCreateSeed = 500;
	radiusDetectionGate = 300;

	radiusOpenGate = 80;

	statePank = 0;

	timeNow = 0;

	timeToEscape = 300;

	currentEscapeTime = 0;

	createSeed() {
		const seed = this.characterFactory.buildSeed(
			this.x,
			this.y,
			this.gameObjects,
			this.characterFactory,
			this.physics,
			this.worldLayer
		);
		this.gameObjects.push(seed);
	}

	wander() {
		this.useSteering(0);
		this.timeNow += 1;
		if (this.timeNow > this.timeToCreateSeed) {
			this.createSeed();
			this.timeNow = 0;
		}
	}

	hateAurora() {
		this.statePank = 3;
	}

	useSteering(index: number) {
		const body = this.body as Phaser.Physics.Arcade.Body;

		const imp = this.steerings[index].calculateImpulse();
		body.velocity.x += imp.x * this.steerings[index].force;
		body.velocity.y += imp.y * this.steerings[index].force;
		body.velocity.normalize().scale(this.maxSpeed);
	}

	moveToGate() {
		this.useSteering(1);
	}

	moveOutGate() {
		this.useSteering(3);
	}

	moveOutAurora() {
		this.useSteering(2);
	}

	// 0 - блуждание
	// 1- движение к загону
	// 2 - побег от загона
	// 3 - побег от овроры
	update() {
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore
		switch (this.statePank) {
			case 0: {
				this.wander();
				console.log('wander');
				if (
					Phaser.Math.Distance.Between(
						this.x,
						this.y,
						this.gate.x,
						this.gate.y
					) <= this.radiusDetectionGate
				)
					this.statePank = 1;
				break;
			}
			case 1: {
				this.moveToGate();
				console.log('moveToGate');
				// if(this.gate.  ){
				// 	this.statePank=1
				// }
				// eslint-disable-next-line @typescript-eslint/ban-ts-comment
				// @ts-ignore
				if (
					Phaser.Math.Distance.Between(
						this.x,
						this.y,
						this.gate.x,
						this.gate.y
					) <= this.radiusOpenGate
				) {
					//this.gate.open()
					console.log('openGate');
					this.statePank = 2;
				}
				break;
			}
			case 2: {
				this.moveOutGate();
				if (this.currentEscapeTime > this.timeToEscape) {
					this.statePank = 0;
					this.currentEscapeTime = 0;
				}
				this.currentEscapeTime += 1;
				console.log('moveOutGate');
				break;
			}
			case 3: {
				this.moveOutAurora();
				if (this.currentEscapeTime > this.timeToEscape) {
					this.statePank = 0;
					this.currentEscapeTime = 0;
				}
				this.currentEscapeTime += 1;
				break;
			}
		}

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

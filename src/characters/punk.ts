import Steering from '../ai/steerings/steering';

import Sprite = Phaser.Physics.Arcade.Sprite;
import CharacterFactory from './character_factory';
import { Wander } from '../ai/steerings/wander';
import { GoInPoint } from '../ai/steerings/go-point';
import { Escape } from '../ai/steerings/escape';
import { StateTable } from '../ai/behaviour/state';

type PunkStates = 'wander' | 'moveToGate' | 'moveOutGate' | 'moveOutAurora';

export default class Punk extends Phaser.Physics.Arcade.Sprite {
	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		name: string,
		frame: string | number,
		readonly maxSpeed: number,
		readonly animationSets: Map<string, string[]>,
		private factory: CharacterFactory,
		private gate: Sprite, // class Gate
		private player: Sprite // class Aurora
	) {
		super(scene, x, y, name, frame);
		scene.physics.world.enable(this);
		scene.add.existing(this);
		this.setBodySize(40, 30, true);
		this.setVelocity(1);
		const stateTable = new StateTable<PunkStates, this>(this);
		stateTable.addState('wander', this.seeGate, 'moveToGate', () =>
			console.log('see gate, start move to it')
		);
		stateTable.addState('moveToGate', this.canOpenGate, 'moveOutGate', () => {
			console.log('gate opened, run away');
			// this.gate.open();
		});
		stateTable.addState('moveOutGate', this.moveLongEnouth, 'wander', () => {
			this.currentEscapeTime = 0;
		});
		stateTable.addState('moveOutAurora', this.moveLongEnouth, 'wander', () => {
			this.currentEscapeTime = 0;
		});
		this.stateTable = stateTable;
	}

	private seeGate(): boolean {
		return (
			Phaser.Math.Distance.Between(this.x, this.y, this.gate.x, this.gate.y) <=
			this.radiusDetectionGate
		);
	}

	private canOpenGate(): boolean {
		return (
			Phaser.Math.Distance.Between(this.x, this.y, this.gate.x, this.gate.y) <=
			this.radiusOpenGate
		);
	}

	private moveLongEnouth(): boolean {
		return this.currentEscapeTime > this.timeToEscape;
	}

	protected stateTable: StateTable<PunkStates, this>;

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

	statePank: PunkStates = 'wander';

	timeNow = 0;

	timeToEscape = 300;

	currentEscapeTime = 0;

	createSeed() {
		this.factory.buildSeed(this.x, this.y);
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
		this.statePank = 'moveOutAurora';
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
		this.currentEscapeTime += 1;
	}

	moveOutAurora() {
		this.useSteering(2);
		this.currentEscapeTime += 1;
	}

	update() {
		this.statePank = this.stateTable.getNextState(this.statePank);
		// ts проверит, что PunkStates входит в подмножество keyof Punk
		this[this.statePank]();
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

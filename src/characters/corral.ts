import { Vector } from 'matter';
import Fence from './fence';
import Player from './player';
import { Scene } from './scene';

export default class Corral extends Phaser.Physics.Arcade.Sprite {
	constructor(
		scene: Phaser.Scene,
		position: Vector,
		size: Vector,
		name: string,
		readonly fence: Fence,
		readonly player: Player
	) {
		super(scene, position.x, position.y, name);
		scene.physics.world.enable(this, Phaser.Physics.Arcade.STATIC_BODY);
		scene.add.existing(this);
		this.body.setSize(size.x, size.y);
		this.visible = false;
	}

	update() {
		this.fence.auroraInCorral = false;
		this.standInCorral();
	}

	standInCorral() {
		const _scene = this.scene as Scene;
		if (_scene instanceof Phaser.Scene == false) {
			return;
		}

		const auroraOverlap = _scene.physics.add.overlap(
			this,
			this.player,
			(o1, o2) => {
				this.fence.auroraInCorral = true;
			}
		);

		auroraOverlap.update();
	}
}

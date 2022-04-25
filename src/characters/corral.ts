import { Vector } from "matter";
import Fence from "./fence";
import { Scene } from "./scene";
import Slime from "./slime";

export default class Corral extends Phaser.Physics.Arcade.Sprite {

	fenceCorral: Fence;

	constructor(
		scene: Phaser.Scene,
		position: Vector,
		size: Vector,
		name: string,
		fence: Fence,
		frame: string | number,
		readonly animationSets: Map<string, string[]>,
	) {
		super(scene, position.x, position.y, name, frame);
		scene.physics.world.enable(this, Phaser.Physics.Arcade.STATIC_BODY);
		scene.add.existing(this);
		this.body.setSize(size.x, size.y);
		this.visible = false;
		this.fenceCorral = fence;
	}

	update() {
		this.fenceCorral.auroraInCorral = false;
		this.standInCorral();
	}

	standInCorral() {

		const _scene = this.scene as Scene;
		if (_scene instanceof Phaser.Scene == false) {
			return;
		}

		const auroraOverlap = _scene.physics.add.overlap(this, _scene.player, (o1, o2) => {
			this.fenceCorral.auroraInCorral = true;
		});

		auroraOverlap.update();
	}
}
import { Vector } from "matter";
import Fence from "./fence";
import { Scene } from "./scene";
import Slime from "./slime";

export default class Corral extends Phaser.Physics.Arcade.Sprite {

	closed = true;
	fence: Fence;

	constructor(
		scene: Scene,
		position: Vector,
		size: Vector,
		name: string,
		frame: string | number,
		fence: Fence,
		readonly animationSets: Map<string, string[]>,
	) {
		super(scene, position.x, position.y, name, frame);
		scene.physics.world.enable(this, Phaser.Physics.Arcade.STATIC_BODY);
		scene.add.existing(this);
		this.body.setSize(size.x, size.y);
		this.fence = fence;
	}

	update() {
		this.closeCorral();
	}

	closeCorral() {
		//if (closed == true)
		//	return;
		const _scene = this.scene as Scene;
		const slimesOverlap = _scene.physics.add.overlap(this, _scene.slimesGroup, (o1, o2) => {
			const slime = o2 as Slime;
			slime.activeJelly = false;
			slimesOverlap.active = false;
			//slime.setActive(false);
			slime.body.stop();
		});
	}

	openCorral() {
		//if (closed == false)
		//	return;
		const _scene = this.scene as Scene;
		const slimesOverlap = _scene.physics.add.overlap(this, _scene.slimesGroup, (o1, o2) => {
			const slime = o2 as Slime;
			slime.activeJelly = true;
			slimesOverlap.active = true;
			//slime.setActive(true);
		});
	}
}
import { Scene } from "./scene";
import Slime from "./slime";

export default class Corral extends Phaser.Physics.Arcade.Sprite {

	closed = true;

	constructor(
		scene: Scene,
		x: number,
		y: number,
		name: string,
		frame: string | number,
		width: number,
		height: number,
		readonly animationSets: Map<string, string[]>,
	) {
		super(scene, x, y, name, frame);
		scene.physics.world.enable(this, Phaser.Physics.Arcade.STATIC_BODY);
		scene.add.existing(this);
		this.body.setSize(width, height);

	}

	update() {
		this.closeCorral();
	}
	
	closeCorral() {
		//if (closed == true)
		//return;
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
			//return;
		const _scene = this.scene as Scene;
		const slimesOverlap = _scene.physics.add.overlap(this, _scene.slimesGroup, (o1, o2) => {
			const slime = o2 as Slime;
			slime.activeJelly = true;
			slimesOverlap.active = true;
			//slime.setActive(true);
		});
	}

}
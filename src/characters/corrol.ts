import { Scene } from "./scene";
import Slime from "./slime";

export default class Corrol extends Phaser.Physics.Arcade.Sprite {
    constructor(
		scene: Scene,
		x: number,
		y: number,
		name: string,
		frame: string | number,
        width: number,
        height: number,
		readonly animationSets: Map<string, string[]>,
		readonly closed: boolean
	) {
		super(scene, x, y, name, frame);
		scene.physics.world.enable(this, Phaser.Physics.Arcade.STATIC_BODY);
		scene.add.existing(this);
		closed = true;
		this.body.setSize(width, height);
		const slimesOverlap = scene.physics.add.overlap(this, scene.slimesGroup, (o1, o2) => {
			const slime = o2 as Slime; // todo check type
			slime.activeJelly = false
			slimesOverlap.active = false
		});
		// slimesOverlap
	}

	createWalls() {
		
	}
}
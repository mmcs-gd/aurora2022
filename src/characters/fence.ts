import { Scene } from "./scene";
import Slime from "./slime";

export default class Fence extends Phaser.Physics.Arcade.Sprite {
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
		// slimesOverlap
	}
}
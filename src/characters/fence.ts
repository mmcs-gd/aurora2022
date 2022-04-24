
import Vector from "../utils/vector";
import { Scene } from "./scene";
import Slime from "./slime";

export default class Fence extends Phaser.Physics.Arcade.Sprite {
	closed = true;

    constructor(
		scene: Scene,
		position: Vector,
		size: Vector,
		name: string,
		frame: string | number,
		readonly animationSets: Map<string, string[]>,
	) {
		super(scene, position.x, position.y, name, frame);
		scene.physics.world.enable(this, Phaser.Physics.Arcade.STATIC_BODY);
		scene.add.existing(this);
		this.body.setSize(size.x, size.y);
	}
}

import Vector from "../utils/vector";
import Corral from "./corral";
import { Scene } from "./scene";
import Slime from "./slime";

export default class Fence extends Phaser.Physics.Arcade.Sprite {

	isClosed = true;
	auroraInCorral = false;
	collider: Phaser.Physics.Arcade.Collider;

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
		this.visible = false;
		const _scene = this.scene as Scene;
		if (_scene instanceof Phaser.Scene == false) {
			return;
		}
		this.collider = _scene.physics.add.collider(_scene.player, this);
	}

	closeFence() {
		const _scene = this.scene as Scene;
		if (_scene instanceof Phaser.Scene == false) {
			return;
		}
		this.collider = _scene.physics.add.collider(_scene.player, this);
		this.isClosed = true;
	}

	openFence() {
		const _scene = this.scene as Scene;
		if (_scene instanceof Phaser.Scene == false) {
			return;
		}
		_scene.physics.world.removeCollider(this.collider);
		this.isClosed = false;
	}
}
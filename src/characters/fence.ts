import Vector from '../utils/vector';
import Player from './player';
import { Scene } from './scene';

export default class Fence extends Phaser.Physics.Arcade.Sprite {
	isClosed = true;
	auroraInCorral = false;
	colliderPlayer: Phaser.Physics.Arcade.Collider;
	colliderJelly: Phaser.Physics.Arcade.Collider;
	map?: Phaser.Tilemaps.Tilemap;

	constructor(
		scene: Scene,
		position: Vector,
		size: Vector,
		readonly player: Player,
		readonly slimes: Phaser.Physics.Arcade.Group
	) {
		super(scene, position.x, position.y, 'none');
		scene.physics.world.enable(this, Phaser.Physics.Arcade.STATIC_BODY);
		scene.add.existing(this);
		this.body.setSize(size.x, size.y);
		this.visible = false;
		this.colliderPlayer = scene.physics.add.collider(player, this);
		this.colliderJelly = scene.physics.add.collider(slimes, this);
		const map = scene.make.tilemap({ key: 'map' });
		const tileset = map.addTilesetImage('Green_Meadow_Tileset', 'tiles');
	}

	closeFence() {
		const _scene = this.scene;
		this.colliderPlayer = _scene.physics.add.collider(this.player, this);
		this.colliderJelly = _scene.physics.add.collider(this.slimes, this);
		this.isClosed = true;
	}

	openFence() {
		const _scene = this.scene;
		_scene.physics.world.removeCollider(this.colliderPlayer);
		_scene.physics.world.removeCollider(this.colliderJelly);
		this.isClosed = false;
	}
}

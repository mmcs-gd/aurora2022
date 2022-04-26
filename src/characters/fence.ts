import Player from './player';
import { Scene } from './scene';

export default class Fence extends Phaser.Physics.Arcade.Sprite {
	isClosed = true;
	auroraInCorral = false;
	colliderPlayer: Phaser.Physics.Arcade.Collider;
	colliderJelly: Phaser.Physics.Arcade.Collider;
	tiles = this.map.filterTiles((tile: Phaser.Tilemaps.Tile) => {
		return tile.index === this.tileIndexClose;
	});
	constructor(
		scene: Scene,
		readonly map: Phaser.Tilemaps.TilemapLayer,
		readonly tileIndexClose: number,
		readonly tileIndexOpen: number,
		readonly player: Player,
		readonly slimes: Phaser.Physics.Arcade.Group
	) {
		super(scene, 0, 0, 'none');
		this.setX(
			this.tiles.map(tile => tile.pixelX).reduce((sum, x) => sum + x) /
				this.tiles.length +
				scene.tileSize / 2
		);
		this.setY(
			this.tiles.map(tile => tile.pixelY).reduce((sum, y) => sum + y) /
				this.tiles.length +
				scene.tileSize / 2
		);
		scene.physics.world.enable(this, Phaser.Physics.Arcade.STATIC_BODY);
		scene.add.existing(this);
		this.body.setSize(this.tiles.length * scene.tileSize, scene.tileSize);
		this.visible = false;
		this.colliderPlayer = scene.physics.add.collider(player, this);
		this.colliderJelly = scene.physics.add.collider(slimes, this);
	}

	closeFence() {
		const _scene = this.scene;
		this.colliderPlayer = _scene.physics.add.collider(this.player, this);
		this.colliderJelly = _scene.physics.add.collider(this.slimes, this);
		this.isClosed = true;
		this.tiles.forEach(tile => (tile.index = this.tileIndexClose));
	}

	openFence() {
		const _scene = this.scene;
		_scene.physics.world.removeCollider(this.colliderPlayer);
		_scene.physics.world.removeCollider(this.colliderJelly);
		this.isClosed = false;
		this.tiles.forEach(tile => (tile.index = this.tileIndexOpen));
	}
}

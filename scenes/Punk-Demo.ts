import EasyStar from 'easystarjs';
import tilemapPng from '../assets/tileset/Dungeon_Tileset.png';
import dungeonRoomJson from '../assets/dungeon_room.json';
import { Scene } from '../src/characters/scene';
import CharacterFactory from '../src/characters/character_factory';
import { RawPortal } from '../src/ai/scouting_map/cells';
import Vector2 = Phaser.Math.Vector2;
import Vector from '../src/utils/vector';

export class PunkDemoScene extends Phaser.Scene implements Scene {
	public readonly finder = new EasyStar.js();
	tileSize = 32;
	characterFactory?: CharacterFactory;
	constructor() {
		super({ key: 'PunkDemoScene' });
	}
	width = 0;
	height = 0;
	getSize() {
		return Vector.create(this.width, this.height);
	}

	preload() {
		this.load.image('tiles', tilemapPng);
		this.load.tilemapTiledJSON('map', dungeonRoomJson);
	}

	create() {
		const map = this.make.tilemap({ key: 'map' });

		// Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
		// Phaser's cache (i.e. the name you used in preload)
		const tileset = map.addTilesetImage('Dungeon_Tileset', 'tiles');

		// Parameters: layer name (or index) from Tiled, tileset, x, y
		const belowLayer = map.createLayer('Floor', tileset, 0, 0);
		const worldLayer = map.createLayer('Walls', tileset, 0, 0);
		const aboveLayer = map.createLayer('Upper', tileset, 0, 0);
		this.width = map.widthInPixels;
		this.height = map.heightInPixels;
		// Setup for A-star
		// this.finder = new EasyStar.js();
		const grid = [];
		for (let y = 0; y < worldLayer.tilemap.height; y++) {
			const col = [];
			for (let x = 0; x < worldLayer.tilemap.width; x++) {
				const tile = worldLayer.tilemap.getTileAt(x, y);
				col.push(tile ? tile.index : 0);
			}
			grid.push(col);
		}

		this.finder.setGrid(grid);
		this.finder.setAcceptableTiles([0]);

		// Setup for collisions
		worldLayer.setCollisionBetween(1, 500);
		aboveLayer.setDepth(10);

		this.physics.world.bounds.width = map.widthInPixels;
		this.physics.world.bounds.height = map.heightInPixels;

		const characterFactory = new CharacterFactory(this);
		this.characterFactory = characterFactory;
		const player = characterFactory.buildPlayerCharacter('aurora', 100, 100);
		this.physics.add.collider(player, worldLayer);

		const npcGroup = this.physics.add.group();
		const fence = characterFactory.buildFence(
			Vector.create(100, 100),
			Vector.create(32, 32)
		);
		characterFactory.buildCorral(
			Vector.create(100, 100),
			Vector.create(32, 32),
			fence
		);
		const punk = characterFactory.buildPunk(400, 400);
		npcGroup.add(punk);

		this.physics.add.collider(npcGroup, player);
		this.physics.add.collider(npcGroup, npcGroup);
		this.physics.add.collider(npcGroup, worldLayer, (player, obstacle) => {
			if (!(player instanceof Phaser.Physics.Arcade.Sprite)) return;
			if (!(obstacle instanceof Phaser.Tilemaps.Tile)) return;
			avoidObstacles(this.tileSize, player, obstacle);
		});

		this.input.keyboard.on('keydown-D', () => {
			// Turn on physics debugging to show player's hitbox
			this.physics.world.createDebugGraphic();
			this.add.graphics().setAlpha(0.75).setDepth(20);
		});
	}

	update() {
		if (this.characterFactory) {
			this.characterFactory.gameObjects.forEach(function (element) {
				element.update();
			});
		}
	}

	tilesToPixels(tile: { x: number; y: number }): Phaser.Math.Vector2 {
		return new Phaser.Math.Vector2(
			tile.x * this.tileSize,
			tile.y * this.tileSize
		);
	}

	pixelsToTiles(pixels: { x: number; y: number }): Phaser.Math.Vector2 {
		return new Phaser.Math.Vector2(
			Math.floor(pixels.x / this.tileSize),
			Math.floor(pixels.y / this.tileSize)
		);
	}

	getPortal(tile: { x: number; y: number }): RawPortal | null {
		return null;
	}
}

function avoidObstacles(
	tileSize: number,
	playerChar: Phaser.Physics.Arcade.Sprite,
	obstacleBody: Phaser.Tilemaps.Tile
) {
	if (playerChar.body.y < 100) {
		const ahead = playerChar.body.velocity.scale(tileSize);
		const obstacleCenter = new Vector2(
			obstacleBody.x * tileSize,
			obstacleBody.y * tileSize
		);
		const avoidenceForce = obstacleCenter
			.subtract(ahead)
			.normalize()
			.scale(tileSize);
		const avoidenceForceNorm = avoidenceForce.normalize().scale(tileSize);
		playerChar.body.velocity
			.add(avoidenceForceNorm)
			.normalize()
			.scale(tileSize);
		playerChar.body.velocity.normalize().scale(tileSize);
	} else {
		const ahead = playerChar.body.velocity.scale(tileSize);
		const obstacleCenter = new Vector2(
			obstacleBody.x * tileSize,
			obstacleBody.y * tileSize
		);
		const avoidenceForce = ahead.subtract(obstacleCenter).scale(tileSize);
		const avoidenceForceNorm = avoidenceForce.normalize().scale(tileSize);
		playerChar.body.velocity.add(avoidenceForceNorm);
	}
}

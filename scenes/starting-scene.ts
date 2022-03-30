/// <reference path='./module_types.d.ts'/>
import EasyStar from 'easystarjs';

import tilemapPng from '../assets/tileset/Dungeon_Tileset.png';
import dungeonRoomJson from '../assets/dungeon_room.json';
import auroraSpriteSheet from '../assets/sprites/characters/aurora.png';
import punkSpriteSheet from '../assets/sprites/characters/punk.png';
import blueSpriteSheet from '../assets/sprites/characters/blue.png';
import yellowSpriteSheet from '../assets/sprites/characters/yellow.png';
import greenSpriteSheet from '../assets/sprites/characters/green.png';
import slimeSpriteSheet from '../assets/sprites/characters/slime.png';
import CharacterFactory, {
	BuildSlimeOptions,
} from '../src/characters/character_factory';
import { Scene } from '../src/characters/scene';

class StartingScene extends Phaser.Scene implements Scene {
	public readonly finder = new EasyStar.js();
	gameObjects: Phaser.Physics.Arcade.Sprite[] = [];
	tileSize = 32;

	initialize() {
		Phaser.Scene.call(this, { key: 'StartingScene' });
	}

	preload() {
		const characterFrameConfig = { frameWidth: 31, frameHeight: 31 };
		const slimeFrameConfig = { frameWidth: 32, frameHeight: 32 };
		//loading map tiles and json with positions
		this.load.image('tiles', tilemapPng);
		this.load.tilemapTiledJSON('map', dungeonRoomJson);

		//loading spitesheets
		this.load.spritesheet('aurora', auroraSpriteSheet, characterFrameConfig);
		this.load.spritesheet('blue', blueSpriteSheet, characterFrameConfig);
		this.load.spritesheet('green', greenSpriteSheet, characterFrameConfig);
		this.load.spritesheet('yellow', yellowSpriteSheet, characterFrameConfig);
		this.load.spritesheet('punk', punkSpriteSheet, characterFrameConfig);
		this.load.spritesheet('slime', slimeSpriteSheet, slimeFrameConfig);
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
		// Creating characters
		const player = characterFactory.buildPlayerCharacter('aurora', 100, 100);
		this.gameObjects.push(player);
		this.physics.add.collider(player, worldLayer);

		const slimes = this.physics.add.group();
		const params: BuildSlimeOptions = { slimeType: 0 };
		for (let i = 0; i < 30; i++) {
			const x = Phaser.Math.RND.between(
				50,
				this.physics.world.bounds.width - 50
			);
			const y = Phaser.Math.RND.between(
				50,
				this.physics.world.bounds.height - 50
			);
			params.slimeType = Phaser.Math.RND.between(0, 4);

			const slime = characterFactory.buildSlime(x, y, params);
			slimes.add(slime);
			this.physics.add.collider(slime, worldLayer);
			this.gameObjects.push(slime);
		}
		this.physics.add.collider(player, slimes);

		this.input.keyboard.on('keydown-D', () => {
			// Turn on physics debugging to show player's hitbox
			this.physics.world.createDebugGraphic();

			this.add.graphics().setAlpha(0.75).setDepth(20);
		});
	}

	/*
    Хотя метод update у спрайтов встроен в Phaser и в v2 вызывался автоматически (что логично ожидать),
    в v3 из-за новых архитектурных решений это изменилось https://github.com/photonstorm/phaser/pull/3379.
    Поэтому нужно обновлять спрайты в сцене самостоятельно.
    В v4 обещают опять переделать.
    */
	update() {
		if (this.gameObjects) {
			this.gameObjects.forEach(function (element) {
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
}

export default StartingScene;

/// <reference path='./module_types.d.ts'/>
import EasyStar from 'easystarjs';
import tilemapPng from '../assets/tileset/Dungeon_Tileset.png';
import dungeonRoomJson from '../assets/dungeon_room.json';
import { Scene } from '../src/characters/scene';
import CharacterFactory from '../src/characters/character_factory';
import Steering from '../src/ai/steerings/steering';
import { Wander } from '../src/ai/steerings/wander';

export class SteeringDemoScene extends Phaser.Scene implements Scene {
	public readonly finder = new EasyStar.js();
	gameObjects: Phaser.Physics.Arcade.Sprite[] = [];
	tileSize = 32;
	steerings: Steering[] = [];

	constructor() {
		super({ key: 'SteeringDemo' });
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
		//Creating characters
		const player = characterFactory.buildTestCharacter('punk', 100, 100);
		this.gameObjects.push(player);
		this.physics.add.collider(player, worldLayer);

		// add Portal
		const portal = characterFactory.buildPortal(50, 50, 5);
		this.gameObjects.push(portal);
		this.physics.add.collider(portal, worldLayer);


		// add Seed
		const seed = characterFactory.buildSeed(150, 50);
		this.gameObjects.push(seed);
		this.physics.add.collider(seed, worldLayer);

		//Adding Steering
		player.addSteering(new Wander(player, this.gameObjects, 1));

		this.input.keyboard.on('keydown-D', () => {
			// Turn on physics debugging to show player's hitbox
			this.physics.world.createDebugGraphic();
			this.add.graphics().setAlpha(0.75).setDepth(20);
		});
	}

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

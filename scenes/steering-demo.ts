/// <reference path='./module_types.d.ts'/>
import EasyStar from 'easystarjs';
import tilemapPng from '../assets/tileset/Dungeon_Tileset.png';
import dungeonRoomJson from '../assets/dungeon_room.json';
import { Scene } from '../src/characters/scene';
import CharacterFactory, {
	HumanSpriteSheetName,
} from '../src/characters/character_factory';
import Steering from '../src/ai/steerings/steering';
import { Wander } from '../src/ai/steerings/wander';
import { GoInPoint } from '../src/ai/steerings/go-point';
import { RawPortal } from '../src/ai/scouting_map/cells';
import Vector2 = Phaser.Math.Vector2;
import Player from '../src/characters/player';
import DemoNPC from '../src/characters/demo-npc';
import { Escape } from '../src/ai/steerings/escape';
import { Pursuit } from '../src/ai/steerings/pursuit';

import PortalPng from '../assets/sprites/characters/portal.png';
import SeedPng from '../assets/sprites/characters/seed.png';

export class SteeringDemoScene extends Phaser.Scene implements Scene {
	public readonly finder = new EasyStar.js();
	gameObjects: Phaser.Physics.Arcade.Sprite[] = [];
	tileSize = 32;
	steerings: Steering[] = [];
	playerPrefab?: Player;

	constructor() {
		super({ key: 'SteeringDemo' });
	}

	preload() {
		this.load.image('tiles', tilemapPng);
		this.load.tilemapTiledJSON('map', dungeonRoomJson);
		this.load.image('seed', SeedPng);
		this.load.image('portal', PortalPng)

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

		const player = characterFactory.buildPlayerCharacter('aurora', 100, 100);
		this.gameObjects.push(player);
		this.physics.add.collider(player, worldLayer);




		//Creating characters
		const steerings: [
			color: HumanSpriteSheetName,
			steeringMaker: (npc: DemoNPC) => Steering
		][] = [
			['blue', npc => new Wander(npc, 1)],
			['green', npc => new GoInPoint(npc, player, 1)],
			['yellow', npc => new Escape(npc, player, 1)],
			['punk', npc => new Pursuit(npc, player, 1, 1, 1)],
		];
		const npcGroup = this.physics.add.group();
		// for (let i = 0; i < steerings.length; i++) {
		// 	const [skin, steering] = steerings[i];
		// 	const npc = characterFactory.buildTestCharacter(skin, 100, 200 + 100 * i);
		// 	npc.setBodySize(40, 30, true);
		// 	npc.setCollideWorldBounds(true);
		// 	this.gameObjects.push(npc);
		// 	npcGroup.add(npc);
		// 	npc.addSteering(steering(npc));
		// }



		const punk = characterFactory.buildPunkCharacter(
			'punk',
			400,
			400,
			this.gameObjects,
			this.physics,
			worldLayer,
			player,
			player
		);
		punk.setBodySize(40, 30, true);
		punk.setCollideWorldBounds(true);
		this.gameObjects.push(punk);
		npcGroup.add(punk);


		this.physics.add.collider(npcGroup, player);
		this.physics.add.collider(npcGroup, npcGroup);
		this.physics.add.collider(npcGroup, worldLayer, (player, obstacle) => {
			if (!(player instanceof Phaser.Physics.Arcade.Sprite)) return;
			if (!(obstacle instanceof Phaser.Tilemaps.Tile)) return;
			avoidObstacles(this.tileSize, player, obstacle);
		});


		const seed = characterFactory.buildSeed(150, 150, this.gameObjects, characterFactory, this.physics, worldLayer);
		this.gameObjects.push(seed);
		this.physics.add.collider(seed, worldLayer);

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

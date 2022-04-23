/// <reference path='./module_types.d.ts'/>
import EasyStar from 'easystarjs';
import tilemapPng from '../assets/tileset/Dungeon_Tileset.png';
import dungeonRoomJson from '../assets/dungeon_room.json';
import { Scene } from '../src/characters/scene';
import CharacterFactory from '../src/characters/character_factory';
import Steering from '../src/ai/steerings/steering';
import { Wander } from '../src/ai/steerings/wander';
import { GoInPoint } from '../src/ai/steerings/go-point';
import { RawPortal } from '../src/ai/scouting_map/cells';
import Vector2 = Phaser.Math.Vector2;
import Player from '../src/characters/player';
import DemoNPC from '../src/characters/demo-npc';
import { Escape } from '../src/ai/steerings/escape';

export class SteeringDemoScene extends Phaser.Scene implements Scene {
	public readonly finder = new EasyStar.js();
	gameObjects: Phaser.Physics.Arcade.Sprite[] = [];
	tileSize = 32;
	steerings: Steering[] = [];
	playerPrefab?:Player;
	
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

		 const player1 = characterFactory.buildPlayerCharacter('aurora', 100, 100);
		 this.gameObjects.push(player1);
		 this.physics.add.collider(player1, worldLayer);
		//Creating characters
		const player = characterFactory.buildTestCharacter('punk', 100, 100);
		player.setBodySize(40,30,true);
		player.setCollideWorldBounds(true);
		this.playerPrefab=player1;
		this.gameObjects.push(player);
		this.physics.add.collider(player, player1);
		//this.physics.add.collider(player, worldLayer);
		//this.physics.add.collider(player, worldLayer, this.avoidObstacles(player,worldLayer));
		this.physics.add.collider(player, worldLayer, (player:object, worldLayer:object)=>{
			
			
			const obstacleBody = worldLayer as Phaser.Physics.Arcade.Sprite;
			
			const playerChar = player as Phaser.Physics.Arcade.Sprite;
			
			if(playerChar.body.y<100)
			{
				const ahead = playerChar.body.velocity.scale(this.tileSize);
				const obstacleCenter = new Vector2(obstacleBody.x*this.tileSize, obstacleBody.y*this.tileSize);
				const avoidenceForce = obstacleCenter.subtract(ahead).normalize().scale(this.tileSize);
				const avoidenceForceNorm=avoidenceForce.normalize().scale(this.tileSize);
				playerChar.body.velocity.add(avoidenceForceNorm).normalize().scale(this.tileSize);
				playerChar.body.velocity.normalize().scale(this.tileSize);
			}
			else
			{
				const ahead = playerChar.body.velocity.scale(this.tileSize);
				const obstacleCenter = new Vector2(obstacleBody.x*this.tileSize, obstacleBody.y*this.tileSize);
				const avoidenceForce = ahead.subtract(obstacleCenter).scale(this.tileSize);
				const avoidenceForceNorm=avoidenceForce.normalize().scale(this.tileSize);
				playerChar.body.velocity.add(avoidenceForceNorm);
			}
			
			
			//const playerBody= player as Phaser.Physics.Arcade.Body;
			//if(playerBody.blocked.up){
				//if(playerBody.onCeiling()||playerBody.onFloor())
			//	{
			//		playerBody.checkCollision.right=false;
			//		playerBody.checkCollision.left=false;
			//	}
			
		//	}
			//playerChar.body.checkCollision()
		

		/*	const ahead = playerChar.body.velocity.scale(this.tileSize);
		const obstacleCenter = new Vector2(obstacleBody.x*this.tileSize, obstacleBody.y*this.tileSize);
		const avoidenceForce = ahead.subtract(obstacleCenter).scale(this.tileSize);
		const avoidenceForceNorm=avoidenceForce.normalize().scale(this.tileSize);
		playerChar.body.velocity.add(avoidenceForceNorm);
			
			playerBody.checkCollision.right=true;
			playerBody.checkCollision.left=true;*/
			 

				// console.log("стена сверху",obstacleBody.body.position.y);
			 
			// const ahead = playerChar.body.velocity.scale(this.tileSize);
			// const obstacleCenter = new Vector2(obstacleBody.x*this.tileSize, obstacleBody.y*this.tileSize);
			//  const ahead = playerChar.body.velocity.scale(this.tileSize);
			//  const obstacleCenter = new Vector2(obstacleBody.x*this.tileSize, obstacleBody.y*this.tileSize);
			// // const avoidenceForce = ahead.subtract(obstacleCenter).scale(this.tileSize);
			// const avoidenceForce = obstacleCenter.subtract(ahead).normalize().scale(this.tileSize);
			//  const avoidenceForceNorm=avoidenceForce.normalize().scale(this.tileSize);
			//  console.log("x avoidenceForce: "+avoidenceForceNorm.x+" y avoidenceForce: "+avoidenceForceNorm.y);
			//  playerChar.body.velocity.add(avoidenceForceNorm).normalize().scale(this.tileSize);
			//  playerChar.body.velocity.normalize().scale(this.tileSize);
			 //playerChar.body.velocity.add(avoidenceForceNorm);
			 //console.log("x: "+playerChar.body.velocity.x+" y: "+playerChar.body.velocity.y);
		});

		//Adding Steering
		//player.addSteering(new Wander(player, this.gameObjects, 1));
		//player.addSteering(new GoInPoint(player, player1, 1));
		player.addSteering(new Escape(player, player1, 1));

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

	 avoidObstacles (player:object, worldLayer:object)
	 {
		const obstacleBody = worldLayer as Phaser.Physics.Arcade.Sprite;
			
		const playerChar = player as Phaser.Physics.Arcade.Sprite;
		
		if(playerChar.body.y<100)
		{
			const ahead = playerChar.body.velocity.scale(this.tileSize);
			const obstacleCenter = new Vector2(obstacleBody.x*this.tileSize, obstacleBody.y*this.tileSize);
			const avoidenceForce = obstacleCenter.subtract(ahead).normalize().scale(this.tileSize);
			const avoidenceForceNorm=avoidenceForce.normalize().scale(this.tileSize);
			playerChar.body.velocity.add(avoidenceForceNorm).normalize().scale(this.tileSize);
			playerChar.body.velocity.normalize().scale(this.tileSize);
		}
		else
		{
			const ahead = playerChar.body.velocity.scale(this.tileSize);
			const obstacleCenter = new Vector2(obstacleBody.x*this.tileSize, obstacleBody.y*this.tileSize);
			const avoidenceForce = ahead.subtract(obstacleCenter).scale(this.tileSize);
			const avoidenceForceNorm=avoidenceForce.normalize().scale(this.tileSize);
			playerChar.body.velocity.add(avoidenceForceNorm);
		}
	 }
}

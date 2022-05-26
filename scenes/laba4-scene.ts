import EasyStar from 'easystarjs';

import tilemapPng from '../assets/tileset/Green_Meadow_Tileset.png';
import tilemapJson from '../assets/green_meadow.json';
import CharacterFactory, {
} from '../src/characters/character_factory';
import { Scene } from '../src/characters/scene';
import Vector from '../src/utils/vector';

type LayerDescription = {
	depth?: number;
	collide?: boolean;
};

export class Laba4Scene extends Phaser.Scene implements Scene {
	public readonly finder = new EasyStar.js();

	tileSize = 36;
	constructor() {
		super({ key: 'Laba4Scene' });
	}

	width = 0;
	height = 0;
	characterFactory?: CharacterFactory;

	getSize() {
		return Vector.create(this.width, this.height);
	}

	preload() {
		this.load.image('tiles', tilemapPng);
		this.load.tilemapTiledJSON('map', tilemapJson);
	}

	generateNoise(density: number) {
		var rand = Math.floor((Math.random() * 100) + 1);
		if (density < rand)
			return 0;
		else
			return 1;
	}

	getSurroundingWallCount(gridX: number, gridY: number, grid: number[][], stateCell: number) {

		let wallCount: number = 0;

		for (let neighbourX = gridX - 1; neighbourX <= gridX + 1; neighbourX++) {
			for (let neighbourY = gridY - 1; neighbourY <= gridY + 1; neighbourY++) {
				if (neighbourX >= 0 && neighbourY >= 0 && neighbourX < grid.length && neighbourY < grid[0].length) {
					if (neighbourX != gridX && neighbourY != gridY) {
						if (grid[neighbourX][neighbourY] == stateCell) {
							wallCount++;
						}
					}
				} else {
					wallCount++;
				}
			}
		}

		return wallCount;
	}
	

	applyCellularAutomation(grid: number[][]) {

		let buffer_grid: number[][] = [];
		for (let i: number = 0; i < grid.length; i++) {
			buffer_grid[i] = [];
			for (let j: number = 0; j < grid[i].length; j++) {
				buffer_grid[i][j] = grid[i][j];
			}
		}

		for (let i = 0; i < grid.length; i++) {
			for (let j = 0; j < grid[i].length; j++) {
				var neighbours = this.getSurroundingWallCount(i, j, grid, 1);
				if (neighbours > 4 && buffer_grid[i][j] == 0) {
					buffer_grid[i][j] = 1;
				} else if (neighbours < 3 && buffer_grid[i][j] == 1) {
					buffer_grid[i][j] = 0;
				}
			}
		}

		return buffer_grid;
	}

	dilate(grid: number[][]) {
		let buffer_grid: number[][] = [];
		for (let i: number = 0; i < grid.length; i++) {
			buffer_grid[i] = [];
			for (let j: number = 0; j < grid[i].length; j++) {
				buffer_grid[i][j] = grid[i][j];
			}
		}

		//Написать дилатацию
		for (var i = 0; i < grid.length; i++) {
			for (var j = 0; j < grid[i].length; j++) {
				if (grid[i][j] == 1) {
					for (let neighbourX = i - 1; neighbourX <= i + 1; neighbourX++) {
						for (let neighbourY = j - 1; neighbourY <= j + 1; neighbourY++) {
							if (neighbourX >= 0 && neighbourY >= 0 && neighbourX < grid.length && neighbourY < grid[0].length) {
								buffer_grid[neighbourX][neighbourY] = 1;
							}
						}
					}
				}
			}
		}

		return buffer_grid;
	}

	erode(grid: number[][]) {
		//Написать эрозию
		let buffer_grid: number[][] = [];
		for (let i: number = 0; i < grid.length; i++) {
			buffer_grid[i] = [];
			for (let j: number = 0; j < grid[i].length; j++) {
				buffer_grid[i][j] = grid[i][j];
			}
		}

		for (var i = 0; i < grid.length; i++) {
			for (var j = 0; j < grid[i].length; j++) {
				if (grid[i][j] == 0) {
					if(i!=0)
					{
						buffer_grid[i-1][j]=0;
					}
					if(i!=grid.length)
					{
						buffer_grid[i+1][j]=0;
					}
					if(j!=0)
					{
						buffer_grid[i][j-1]=0;
					}
					if(j!=grid.length)
					{
						buffer_grid[i][j+1]=0;
					}

					/*for (let neighbourX = i - 1; neighbourX <= i + 1; neighbourX++) {
						for (let neighbourY = j - 1; neighbourY <= j + 1; neighbourY++) {
							if (neighbourX >= 0 && neighbourY >= 0 && neighbourX < grid.length && neighbourY < grid[0].length) {
								buffer_grid[neighbourX][neighbourY] = 1;
							}
						}
					}*/
				}
			}
		}

		return buffer_grid;
	}


	region_labeling(grid: number[][])
	{
		var label_grid: number[][] = [];
		var number_region=1;
		for (let i: number = 0; i < grid.length; i++) {
			label_grid[i] = [];
			for (let j: number = 0; j < grid[i].length; j++) {
				label_grid[i][j] = 0;
			}
		}
		console.log(grid);
		for (var i = 0; i < grid.length; i++) {
			for (var j = 0; j < grid[i].length; j++){
				if(grid[i][j]==0){
					var k=0;
					if(i!=0 && label_grid[i-1][j]!=0)
					{
						label_grid[i][j]=label_grid[i-1][j];
						k++;
					}
					if(i!=grid.length && label_grid[i+1][j]!=0)
					{
						label_grid[i][j]=label_grid[i+1][j];
						k++;
					}
					if(j!=0 && label_grid[i][j-1]!=0)
					{
						label_grid[i][j]=label_grid[i][j-1];
						k++;
					}
					if(j!= grid[i].length && label_grid[i][j+1]!=0)
					{
						label_grid[i][j]=label_grid[i][j+1];
						k++;
					}
					if(k==0)
					{
						label_grid[i][j]=number_region;
						number_region++;
					}
				}
			}
		}
				for (var k=0;k<100;k++){
				for (var i = 0; i < label_grid.length; i++) 
					for (var j = 0; j < label_grid[i].length; j++){
							if(label_grid[i][j]!=0){
								if(i!=0 && label_grid[i-1][j]<=label_grid[i][j]&&label_grid[i-1][j]!=0)
								{
									label_grid[i][j]=label_grid[i-1][j];
								}
								if(i!=grid.length-1 && label_grid[i+1][j]<=label_grid[i][j] && label_grid[i+1][j]!=0)
								{
									label_grid[i][j]=label_grid[i+1][j];
								}
								if(j!=0 && label_grid[i][j-1]<=label_grid[i][j]&&label_grid[i][j-1]!=0)
								{
									label_grid[i][j]=label_grid[i][j-1];
								}
								if(j!= grid[i].length-1 && label_grid[i][j+1]<=label_grid[i][j]&& label_grid[i][j+1]!=0)
								{
									label_grid[i][j]=label_grid[i][j+1];
								}
						}
							
						}
					}
		return label_grid;
	}

	remove_region_labeling(grid: number[][])
	{
		let buffer_grid: number[][] = [];
	
		for (let i: number = 0; i < grid.length; i++) {
			buffer_grid[i] = [];
			for (let j: number = 0; j < grid[i].length; j++) {
				buffer_grid[i][j] = grid[i][j];
			}
		}
		for (var i = 0; i < buffer_grid.length; i++) 
		for (var j = 0; j < buffer_grid[i].length; j++){
			if(buffer_grid[i][j]>0){
				buffer_grid[i][j]=1;
			}
			else buffer_grid[i][j]=0;
		}

		
		return buffer_grid;
	}

	enumeration_of_regions(grid:number[][]){
		var regionAndCountTile: number[][] = [];
		var counter=0;
		var flag=false;
		for (var i: number = 0; i < 10; i++) {
			regionAndCountTile[i] = [];
			regionAndCountTile[i][0] = -1;
			regionAndCountTile[i][1] = 1;
		}
		for (var i: number = 0; i < grid.length; i++) {
			for (var j: number = 0; j < grid[i].length; j++) {
				flag=false;
				if(grid[i][j]!=0){
					for (var k=0;k<10;k++)
					{
						if(grid[i][j]==regionAndCountTile[k][0])
						{	regionAndCountTile[k][1]++;
							flag=true;
							break;
						}
					}
					if(flag==false)
					{
						regionAndCountTile[counter][0]=grid[i][j];
						counter++;
					}
				}
			}
		}
		console.log(regionAndCountTile);
		return regionAndCountTile;
	}

	create_bridge(grid:number[][],startX:number,startY:number,endX:number,endY:number)
	{
		var buffer_grid: number[][] = [];
		var label_grid:number[][]=[]
		for (let i: number = 0; i < grid.length; i++) {
			buffer_grid[i] = [];
			label_grid[i]=[];
			for (let j: number = 0; j < grid[i].length; j++) {
				buffer_grid[i][j] = -1;
				label_grid[i][j]=grid[i][j];
			}
		}
		var localX=startX;
		var localY=startY;
		buffer_grid[localX][localY]=0;
		var counter=1;
		while(localX!=endY && localY!=endY)
		{
			var distanceTile=this.distance(localX,localY,endX,endY)
			if(this.distance(localX+1,localY,endX,endY)<distanceTile)
			{
				buffer_grid[localX+1][localY]=counter;
				localX=localX+1;
				localY=localY;
				distanceTile=this.distance(localX,localY,endX,endY);
				counter++;
			}	
			if(this.distance(localX-1,localY,endX,endY)<distanceTile)
			{
				buffer_grid[localX-1][localY]=counter;
				localX=localX-1;
				localY=localY;
				distanceTile=this.distance(localX,localY,endX,endY);
				counter++;
			}	
			if(this.distance(localX,localY+1,endX,endY)<distanceTile)
			{
				buffer_grid[localX][localY+1]=counter;
				localX=localX;
				localY=localY+1;
				distanceTile=this.distance(localX,localY,endX,endY);
				counter++;
			}	
			if(this.distance(localX,localY-1,endX,endY)<distanceTile)
			{
				buffer_grid[localX][localY+1]=counter;
				localX=localX;
				localY=localY-1;
				distanceTile=this.distance(localX,localY,endX,endY);
				counter++;
			}	
		}
		console.log(buffer_grid);
		for (var i = 0; i < buffer_grid.length; i++) 
		for (var j = 0; j < buffer_grid[i].length; j++){
			if(buffer_grid[i][j]!=-1)
			{
				label_grid[i][j]=10;
			}
		}
		console.log(label_grid);

		return label_grid;
	}

	distance(startX:number,startY:number,endX:number,endY:number)
	{
		var distance=Math.abs(endX-startX)+Math.abs(endY-startY);
		return distance;
	}

	create() {
		var array: number[][] = [];
		for (var i: number = 0; i < 50; i++) {
			array[i] = [];
			for (var j: number = 0; j < 50; j++) {
				array[i][j] = 0;
			}
		}

		const map = this.make.tilemap({ data: array });

		const tileset = map.addTilesetImage('Green_Meadow_Tileset', 'tiles', 32, 32, 2, 6);
		//const layers = createLayers(map, tileset, layersSettings);
		const layer = map.createBlankLayer('floor', tileset);
		


		
		this.width = map.widthInPixels;
		this.height = map.heightInPixels;

		this.physics.world.bounds.width = map.widthInPixels;
		this.physics.world.bounds.height = map.heightInPixels;

		var things: number[][] = [];

		for (var i: number = 0; i < map.width; i++) {
			things[i] = [];
			for (var j: number = 0; j < map.height; j++) {
				if (i == 0 || i == map.width - 1 || j == 0 || j == map.height - 1) {
					things[i][j] = 1;
				} else
					things[i][j] = this.generateNoise(60);
			}
		}


		layer.putTilesAt(things, 0, 0);


		// Creating characters
		const characterFactory = new CharacterFactory(this);
		this.characterFactory = characterFactory;

		characterFactory.buildPlayerCharacter('aurora', 800, 300);

		this.input.keyboard.on('keydown-O', () => {

			things = this.applyCellularAutomation(things);
			layer.putTilesAt(things, 0, 0);

		});

		this.input.keyboard.on('keydown-Z', () => {
			layer.replaceByIndex(0, 5);
			layer.replaceByIndex(1, 3);
		});
		this.input.keyboard.on('keydown-X', () => {
			layer.replaceByIndex(5, 0);
			layer.replaceByIndex(3, 1);
		});

		this.input.keyboard.on('keydown-D', () => {
			things = this.dilate(things);
			layer.putTilesAt(things, 0, 0);
		});


		this.input.keyboard.on('keydown-A', () => {
			things = this.region_labeling(things);
			console.log("Это работает");
			console.log(things);
			layer.putTilesAt(things,0,0);
					layer.replaceByIndex(0,100);
					for(var i=11;i<99;i++)
					{
						var t=Math.floor(Math.random()*10)+1
						layer.replaceByIndex(i,t);
					}
		});


		this.input.keyboard.on('keydown-Q', () => {
			//things = this.remove_region_labeling(things);
			var region=this.enumeration_of_regions(things);
			
			var random=Math.floor(Math.random()*6)+1;
			var countRegion=0;
			for(var i=0;i<region.length;i++)
			{
				if(region[i][0]!=-1)
				countRegion++;
			}
			var random=Math.floor(Math.random()*countRegion);
			for(var i=0;i<random;i++){
				
				things=this.create_bridge(things,10,10,20,20);
			}
			layer.putTilesAt(things,0,0);
			layer.replaceByIndex(0,100);
					for(var i=11;i<99;i++)
					{
						var t=Math.floor(Math.random()*10)+1
						layer.replaceByIndex(i,t);
					}
			//console.log("Также");
			//console.log(things);
		});
		

		

		this.input.keyboard.on('keydown-E', () => {
			things = this.erode(things);
			layer.putTilesAt(things, 0, 0);
		});

		this.input.keyboard.on('keydown-R', () => {
			let density = Math.floor((Math.random() * 100) + 1);
			for (var i: number = 0; i < map.width; i++) {
				things[i] = [];
				for (var j: number = 0; j < map.height; j++) {
					if (i == 0 || i == map.width - 1 || j == 0 || j == map.height - 1) {
						things[i][j] = 1;
					} else
						things[i][j] = this.generateNoise(density);
				}
			}
			layer.putTilesAt(things, 0, 0);
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
}
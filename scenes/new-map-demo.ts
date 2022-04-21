/// <reference path='./module_types.d.ts'/>
import EasyStar from 'easystarjs';

import tilemapPng from '../assets/tileset/Green_Meadow_Tileset.png';
import tilemapJson from '../assets/green_meadow.json';
import CharacterFactory, {
	BuildSlimeOptions,
} from '../src/characters/character_factory';
import { Scene } from '../src/characters/scene';

type LayerDesctiption = {
	depth?: number;
	astar?: boolean;
};

const layersSettings = {
	/** Нижний слой с землёй и декором */
	Ground: {} as LayerDesctiption,
	/** Стены, вода */
	Walls: { astar: true } as LayerDesctiption,
	/** Одиночные препятствия (камни, пни) */
	Obstacles: { astar: true } as LayerDesctiption,
	/** Стены загона  - возможно, отдельный слой не нужен */
	'Corral.Walls': { astar: true } as LayerDesctiption,
	/** Двери загона  - возможно, отдельный слой не нужен */
	'Corral.Doors': {} as LayerDesctiption,
	/** Арбитр в загоне - возможно, отдельный слой не нужен */
	'Corral.Arbitrator': { depth: 10 } as LayerDesctiption,
	/** Арбитр снаружи - возможно, отдельный слой не нужен */
	Arbitrator: { depth: 10 } as LayerDesctiption,
	/** Декор сверху (кроны деревьев) */
	Transparent: { depth: 10 } as LayerDesctiption,
};

/**
 * Вспомогательная функция для создания слоёв по описанию в виде объекта,
 * потому что мне надоело хардкодить-копипастить
 */
function createLayers<T extends string>(
	map: Phaser.Tilemaps.Tilemap,
	tileset: Phaser.Tilemaps.Tileset,
	layersSettings: Record<T, LayerDesctiption>
): Record<T, Phaser.Tilemaps.TilemapLayer> {
	const layers = {} as Record<T, Phaser.Tilemaps.TilemapLayer>;
	for (const layerID in layersSettings) {
		layers[layerID] = map.createLayer(layerID, tileset, 0, 0);
		const depth = layersSettings[layerID].depth;
		if (depth !== undefined) layers[layerID].setDepth(depth);
	}
	return layers;
}

function setupFinder(
	finder: EasyStar.js,
	tilemap: Phaser.Tilemaps.Tilemap,
	collidesLayers: string[]
): void {
	const grid = [];
	for (let y = 0; y < tilemap.height; y++) {
		const col = [];
		for (let x = 0; x < tilemap.width; x++) {
			const tile = collidesLayers.reduce(
				(tile, layer) => tile || tilemap.getTileAt(x, y, false, layer),
				null as Phaser.Tilemaps.Tile | null
			);
			col.push(tile ? tile.index : 0);
		}
		grid.push(col);
	}

	finder.setGrid(grid);
	finder.setAcceptableTiles([0]);
}

export class NewMapScene extends Phaser.Scene implements Scene {
	public readonly finder = new EasyStar.js();
	gameObjects: Phaser.Physics.Arcade.Sprite[] = [];
	tileSize = 36;
	constructor() {
		super({ key: 'MapDemo' });
	}

	preload() {
		//loading map tiles and json with positions
		this.load.image('tiles', tilemapPng);
		this.load.tilemapTiledJSON('map', tilemapJson);
	}

	create() {
		const map = this.make.tilemap({ key: 'map' });

		// Parameters are the name you gave the tileset in Tiled and then the key of the tileset image in
		// Phaser's cache (i.e. the name you used in preload)
		// const tileset = map.addTilesetImage('Dungeon_Tileset(new)', 'tiles');
		const tileset = map.addTilesetImage('Green_Meadow_Tileset', 'tiles');

		// Parameters: layer name (or index) from Tiled, tileset, x, y
		// const belowLayer = map.createLayer('Floor', tileset, 0, 0);
		const layers = createLayers(map, tileset, layersSettings);
		const collidesLayers = Object.entries<LayerDesctiption>(layersSettings)
			.filter(([, { astar }]) => astar)
			.map(([key]) => key as keyof typeof layersSettings);
		setupFinder(this.finder, map, collidesLayers);
		// Setup for collisions
		console.log(collidesLayers);

		this.physics.world.bounds.width = map.widthInPixels;
		this.physics.world.bounds.height = map.heightInPixels;

		const characterFactory = new CharacterFactory(this);
		// Creating characters
		const player = characterFactory.buildPlayerCharacter('aurora', 200, 100);
		this.gameObjects.push(player);

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
			this.gameObjects.push(slime);
		}
		this.physics.add.collider(player, slimes);

		this.input.keyboard.on('keydown-D', () => {
			// Turn on physics debugging to show player's hitbox
			this.physics.world.createDebugGraphic();

			this.add.graphics().setAlpha(0.75).setDepth(20);
		});

		collidesLayers.forEach(layerID => {
			layers[layerID].setCollisionBetween(1, 500);
			this.physics.add.collider(player, layers[layerID]);
			this.physics.add.collider(slimes, layers[layerID]);
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

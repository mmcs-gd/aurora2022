/// <reference path='./module_types.d.ts'/>
import EasyStar from 'easystarjs';
import Portal from '../src/characters/portal';

import tilemapPng from '../assets/tileset/Green_Meadow_Tileset.png';
import tilemapJson from '../assets/green_meadow.json';
import CharacterFactory, {
	BuildSlimeOptions,
} from '../src/characters/character_factory';
import { Scene } from '../src/characters/scene';
import { Arbitrator, ArbitratorInstance } from '../src/ai/behaviour/arbitrator';
import Vector from '../src/utils/vector';
import Fence from '../src/characters/fence';
import Player from '../src/characters/player';

type LayerDescription = {
	depth?: number;
	collide?: boolean;
};

const layersSettings = {
	/** Нижний слой с землёй и декором */
	Ground: {} as LayerDescription,
	/** Стены, вода */
	Walls: { collide: true } as LayerDescription,
	/** Одиночные препятствия (камни, пни) */
	Obstacles: { collide: true } as LayerDescription,
	/** Стены загона  - возможно, отдельный слой не нужен */
	'Corral.Walls': { collide: true } as LayerDescription,
	/** Двери загона  - возможно, отдельный слой не нужен */
	'Corral.Doors': {} as LayerDescription,
	/** Арбитр в загоне - возможно, отдельный слой не нужен */
	'Corral.Arbitrator': { depth: 10 } as LayerDescription,
	/** Арбитр снаружи - возможно, отдельный слой не нужен */
	Arbitrator: { depth: 10 } as LayerDescription,
	/** Декор сверху (кроны деревьев) */
	Transparent: { depth: 10 } as LayerDescription,
};

/**
 * Вспомогательная функция для создания слоёв по описанию в виде объекта,
 * потому что мне надоело хардкодить-копипастить
 */
function createLayers<T extends string>(
	map: Phaser.Tilemaps.Tilemap,
	tileset: Phaser.Tilemaps.Tileset,
	layersSettings: Record<T, LayerDescription>
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
				(tile, layer) => tile || tilemap.getTileAt(x, y, false, layer)?.index,
				null as number | null
			);
			col.push(tile ? tile : 0);
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

	width = 0;
	height = 0;
	characterFactory?: CharacterFactory;
	fence!: Fence;
	getSize() {
		return Vector.create(this.width, this.height);
	}

	getPortal(pos: { x: number; y: number }): Portal | null {
		let res = null;
		this.gameObjects.forEach(e => {
			if (!(e instanceof Portal)) return;
			if (e.x == pos.x && e.y == pos.y) res = e;
		});
		return res;
	}
	getclosestPortal(pos: { x: number; y: number }): Portal | null {
		const res: Portal[] = [];
		this.gameObjects.forEach(e => {
			if (e instanceof Portal) res.push(e);
		});
		if (res.length == 0) return null;

		let p = res[0];
		let d = Phaser.Math.Distance.BetweenPoints(pos, p);
		res.forEach(e => {
			const _d = Phaser.Math.Distance.BetweenPoints(pos, e);
			if (_d >= d) return;
			p = e;
			d = _d;
		});
		return p;
	}

	preload() {
		this.load.image('tiles', tilemapPng);
		this.load.tilemapTiledJSON('map', tilemapJson);
	}

	create() {
		const map = this.make.tilemap({ key: 'map' });

		const tileset = map.addTilesetImage('Green_Meadow_Tileset', 'tiles');

		const layers = createLayers(map, tileset, layersSettings);
		const collidesLayers = Object.entries<LayerDescription>(layersSettings)
			.filter(([, { collide: astar }]) => astar)
			.map(([key]) => key as keyof typeof layersSettings);
		setupFinder(this.finder, map, collidesLayers);

		this.width = map.widthInPixels;
		this.height = map.heightInPixels;

		this.physics.world.bounds.width = map.widthInPixels;
		this.physics.world.bounds.height = map.heightInPixels;

		// Creating characters

		const characterFactory = new CharacterFactory(this);
		this.characterFactory = characterFactory;
		// Создаем глобального арбитра
		const arbitrator = new Arbitrator();
		// Создаем локальных арбитров
		// Координаты арбитров
		const outerArbitratorCoords = { x: 496.7504208861624, y: 365.5 };
		const innerArbitratorCoords = { x: 915, y: 200 };
		// Инстансы арбитров
		const outerArbitrator = new ArbitratorInstance(
			arbitrator,
			outerArbitratorCoords
		);

		const innerArbitrator = new ArbitratorInstance(
			arbitrator,
			innerArbitratorCoords
		);

		const player = characterFactory.buildPlayerCharacter('aurora', 800, 300);
		this.gameObjects.push(player);
		// Создаем желешек
		const slimes = this.physics.add.group();
		const params: BuildSlimeOptions = { slimeType: 0 };
		for (let i = 0; i < 20; i++) {
			const x = Phaser.Math.RND.between(
				50,
				this.physics.world.bounds.width - 50
			);
			const y = Phaser.Math.RND.between(
				50,
				this.physics.world.bounds.height - 50
			);
			params.slimeType = Phaser.Math.RND.between(0, 4);

			const slime = characterFactory.buildSlime(
				x,
				y,
				params,
				outerArbitrator,
				innerArbitrator
			);

			slimes.add(slime);
			this.gameObjects.push(slime);
		}
		this.physics.add.collider(slimes, slimes);
		this.physics.add.collider(player, slimes);

		const positionFence = Vector.create(995, 305);
		const sizeFence = Vector.create(62, 30);

		this.fence = characterFactory.buildFence(positionFence, sizeFence);

		const positionCorral = Vector.create(1012, 225);
		const sizeCorral = Vector.create(225, 150);

		const corral = characterFactory.buildCorral(
			positionCorral,
			sizeCorral,
			this.fence
		);

		characterFactory.buildPunk(100, 200);
		characterFactory.buildPunk(700, 350);
		this.input.keyboard.on('keydown-D', () => {
			// Turn on physics debugging to show player's hitbox
			this.physics.world.createDebugGraphic();

			this.add.graphics().setAlpha(0.75).setDepth(20);
		});
		// Устанавливаем коллизии с окружением для игрока и npc
		collidesLayers.forEach(layerID => {
			layers[layerID].setCollisionBetween(1, 5000);
			this.physics.add.collider(characterFactory.dynamicGroup, layers[layerID]);
		});
		this.physics.add.collider(
			characterFactory.dynamicGroup,
			characterFactory.dynamicGroup
		);
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

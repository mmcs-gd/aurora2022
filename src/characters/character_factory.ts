import Slime from './slime';
import Player from './player';
import Corral from './corral';
import cyberpunkConfigJson from '../../assets/animations/cyberpunk.json';
import slimeConfigJson from '../../assets/animations/slime.json';
import AnimationLoader from '../utils/animation-loader';
import { Scene } from './scene';
import Fence from './fence';
import DemoNPC from './demo-npc';
import Sprite = Phaser.Physics.Arcade.Sprite;
import Punk from './punk';
import Portal from './portal';
import Seed from './seed';
import Vector from '../utils/vector';

export interface BuildSlimeOptions {
	slimeType?: number;
}

const cyberSpritesheets = [
	'aurora',
	'blue',
	'yellow',
	'green',
	'punk',
] as const;
const slimeSpriteSheet = 'slime' as const;

enum DepthLayers {
	Stuff = 1,
	Characters = 2,
}

export type HumanSpriteSheetName = typeof cyberSpritesheets[number];
export type SpriteSheetName = typeof slimeSpriteSheet | HumanSpriteSheetName;
// на самом деле SpriteFactory, но переименовывать пока не будем
export default class CharacterFactory {
	animationLibrary = {} as Record<SpriteSheetName, Map<string, string[]>>;
	readonly gameObjects = new Array<Sprite>();
	readonly slimes = new Array<Slime>();
	readonly slimesGroup: Phaser.Physics.Arcade.Group;
	readonly dynamicGroup: Phaser.Physics.Arcade.Group;
	player?: Player;
	corral?: Corral;
	readonly punks = new Array<Punk>();
	readonly portals = new Array<Portal>();
	constructor(public scene: Scene) {
		cyberSpritesheets.forEach(element => {
			this.animationLibrary[element] = new AnimationLoader(
				scene,
				element,
				cyberpunkConfigJson,
				element
			).createAnimations();
		});
		this.animationLibrary[slimeSpriteSheet] = new AnimationLoader(
			scene,
			slimeSpriteSheet,
			slimeConfigJson,
			slimeSpriteSheet
		).createAnimations();
		this.slimesGroup = scene.physics.add.group();
		this.dynamicGroup = scene.physics.add.group();
	}

	addSprite(
		sprite: Sprite,
		dynamic = true,
		depth: DepthLayers = dynamic ? DepthLayers.Characters : DepthLayers.Stuff
	) {
		if (dynamic) {
			sprite.setCollideWorldBounds(true);
			this.dynamicGroup.add(sprite);
		}
		sprite.setDepth(depth);
		this.gameObjects.push(sprite);
		sprite.on('destroy', () => {
			const i = this.gameObjects.findIndex(entity => entity === sprite);
			if (i != -1) {
				this.gameObjects[i] = this.gameObjects[this.gameObjects.length - 1];
				this.gameObjects.pop();
			}
		});
		return sprite;
	}

	buildPlayerCharacter(
		spriteSheetName: HumanSpriteSheetName,
		x: number,
		y: number
	) {
		const maxSpeed = 100;
		const cursors = this.scene.input.keyboard.createCursorKeys();
		const animationSets = this.animationLibrary['aurora'];
		if (animationSets === undefined)
			throw new Error(`Not found animations for aurora`);
		if (this.player) throw new Error(`Game does not support two players`);
		const character = new Player(
			this.scene,
			x,
			y,
			spriteSheetName,
			2,
			this,
			maxSpeed,
			cursors,
			animationSets
		);
		this.player = character;
		this.addSprite(character);
		return character;
	}

	buildPunk(x: number, y: number) {
		const maxSpeed = 100;
		const animationSets = this.animationLibrary['punk'];
		if (animationSets === undefined)
			throw new Error(`Not found animations for punk`);
		if (!this.player) throw new Error(`Player should be created before punk!`);
		if (!this.corral) throw new Error(`Corral should be created before punk!`);
		const character = new Punk(
			this.scene,
			x,
			y,
			'punk',
			2,
			maxSpeed,
			animationSets,
			this,
			this.corral.fence,
			this.player
		);
		this.addSprite(character);
		this.punks.push(character);
		return character;
	}

	buildPortal(x: number, y: number, maxSlime: number) {
		const timeToClose = 400;
		const portal = new Portal(
			this.scene,
			x,
			y,
			'portal',
			timeToClose,
			maxSlime
		);
		this.addSprite(portal, false);
		this.portals.push(portal);
		portal.on('destroy', () => {
			const i = this.portals.findIndex(entity => entity === portal);
			if (i != -1) {
				this.portals[i] = this.portals[this.portals.length - 1];
				this.portals.pop();
			}
		});
		return portal;
	}

	buildSeed(x: number, y: number) {
		const timeToClose = 300;
		const seed = new Seed(this.scene, x, y, 'seed', timeToClose, this);
		this.addSprite(seed, false);
		return seed;
	}

	buildTestCharacter(
		spriteSheetName: HumanSpriteSheetName,
		x: number,
		y: number
	) {
		const maxSpeed = 50;
		const animationSets = this.animationLibrary[spriteSheetName];
		if (animationSets === undefined)
			throw new Error(`Not found animations for test`);
		const character = new DemoNPC(
			this.scene,
			x,
			y,
			spriteSheetName,
			2,
			maxSpeed,
			animationSets
		);
		this.addSprite(character);
		return character;
	}

	buildSlime(x: number, y: number, { slimeType = 0 }: BuildSlimeOptions) {
		const speed = 40;
		// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
		const animations = this.animationLibrary[slimeSpriteSheet].get(
			this.slimeNumberToName(slimeType)
		)!;
		const slime = new Slime(
			this.scene,
			x,
			y,
			slimeSpriteSheet,
			9 * slimeType,
			speed,
			animations,
			2
		);
		this.addSprite(slime);
		this.slimes.push(slime);
		this.slimesGroup.add(slime);
		slime.on('destroy', () => {
			const i = this.slimes.findIndex(entity => entity === slime);
			if (i != -1) {
				this.slimes[i] = this.slimes[this.slimes.length - 1];
				this.slimes.pop();
			}
		});
		return slime;
	}

	buildCorral(corralPosition: Vector, corralSize: Vector, fenceCorral: Fence) {
		if (!this.player)
			throw new Error(`Player should be created before corral!`);
		if (this.corral) throw new Error(`Game does not support two corrals`);
		const corral = new Corral(
			this.scene,
			corralPosition,
			corralSize,
			'none',
			fenceCorral,
			this.player
		);
		this.addSprite(corral, false);
		this.corral = corral;
		return corral;
	}

	buildFence(
		position: Vector,
		size: Vector,
		tileLayer: Phaser.Tilemaps.TilemapLayer,
		tileIndexClose: number,
		tileIndexOpen: number
	) {
		if (!this.player) throw new Error(`Player should be created before fence!`);
		const fence = new Fence(
			this.scene,
			position,
			size,
			tileLayer,
			tileIndexClose,
			tileIndexOpen,
			this.player,
			this.slimesGroup
		);
		this.addSprite(fence, false);
		return fence;
	}

	slimeNumberToName(n: number): string {
		switch (n) {
			case 0:
				return 'Blue';
			case 1:
				return 'Green';
			case 2:
				return 'Orange';
			case 3:
				return 'Pink';
			case 4:
				return 'Violet';
		}
		throw new Error(`Unknown slime with number ${n}`);
	}
}

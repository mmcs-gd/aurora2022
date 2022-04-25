import Slime from './slime';
import Player from './player';
import cyberpunkConfigJson from '../../assets/animations/cyberpunk.json';
import slimeConfigJson from '../../assets/animations/slime.json';
import AnimationLoader from '../utils/animation-loader';
import { Scene } from './scene';
import DemoNPC from './demo-npc';
import Sprite = Phaser.Physics.Arcade.Sprite;
import Punk from './punk';
import Portal from './portal';
import Seed from './seed';

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
export default class CharacterFactory {
	animationLibrary = {} as Record<SpriteSheetName, Map<string, string[]>>;
	readonly gameObjects = new Array<Sprite>();
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
	}

	addSprite(
		sprite: Sprite,
		dynamic = true,
		depth: DepthLayers = dynamic ? DepthLayers.Characters : DepthLayers.Stuff
	) {
		if (dynamic) sprite.setCollideWorldBounds(true);
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
		const character = new Player(
			this.scene,
			x,
			y,
			spriteSheetName,
			2,
			maxSpeed,
			cursors,
			animationSets
		);
		this.addSprite(character);
		return character;
	}

	buildPunkCharacter(
		spriteSheetName: HumanSpriteSheetName,
		x: number,
		y: number,
		gate: Sprite,
		player: Sprite
	) {
		const maxSpeed = 100;
		const animationSets = this.animationLibrary['punk'];
		if (animationSets === undefined)
			throw new Error(`Not found animations for punk`);
		const character = new Punk(
			this.scene,
			x,
			y,
			spriteSheetName,
			2,
			maxSpeed,
			animationSets,
			this,
			gate,
			player
		);
		this.addSprite(character);
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
		return portal;
	}

	buildSeed(x: number, y: number) {
		const timeToClose = 1;
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
		return slime;
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

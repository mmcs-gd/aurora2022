import Slime from './slime';
import Player from './player';
import Corral from './corral';
import cyberpunkConfigJson from '../../assets/animations/cyberpunk.json';
import slimeConfigJson from '../../assets/animations/slime.json';
import AnimationLoader from '../utils/animation-loader';
import { Scene } from './scene';

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

type HumanSpriteSheetName = typeof cyberSpritesheets[number];
type SpriteSheetName = typeof slimeSpriteSheet | HumanSpriteSheetName;
export default class CharacterFactory {
	animationLibrary = {} as Record<SpriteSheetName, Map<string, string[]>>;
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
		character.setCollideWorldBounds(true);
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
			animations
		);
		slime.setCollideWorldBounds(true);
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

	buildCorral(
		x: number,
		y: number, 
		width: number, 
		height: number,
		fenceSize: number,
	) {
		const animationSets = this.animationLibrary['aurora'];
		if (animationSets === undefined)
			throw new Error(`Not found animations for corrol`);
		const character = new Corral(
			this.scene,
			x,
			y,
			"aurora",
			4,
			width,
			height,
			fenceSize,
			animationSets
		);
		return character;
	}
}

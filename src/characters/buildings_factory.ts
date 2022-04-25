import Slime from './slime';
import Player from './player';
import Corral from './corral';
import cyberpunkConfigJson from '../../assets/animations/cyberpunk.json';
import slimeConfigJson from '../../assets/animations/slime.json';
import AnimationLoader from '../utils/animation-loader';
import { Scene } from './scene';
import Fence from './fence';
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
const nameSpritePlayer = "aurora";

type HumanSpriteSheetName = typeof cyberSpritesheets[number];
type SpriteSheetName = typeof slimeSpriteSheet | HumanSpriteSheetName;
export default class BuildingsFactory {
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

	buildCorral(
		corralPosition: Vector,
		corralSize: Vector,
		fenceCorral: Fence,
	) {
		const animationSets = this.animationLibrary[nameSpritePlayer];
		if (animationSets === undefined)
			throw new Error(`Not found animations for corrol`);

		const character = new Corral(
			this.scene,
			corralPosition,
			corralSize,
			nameSpritePlayer,
			fenceCorral,
			4,
			animationSets
		);
		return character;
	}

	buildFence(position: Vector, size: Vector) {
		const animationSets = this.animationLibrary[nameSpritePlayer];
		if (animationSets === undefined)
			throw new Error(`Not found animations for corrol`);
		return new Fence(
			this.scene,
			position,
			size,
			nameSpritePlayer,
			4,
			animationSets
		);
	}
}
import Slime from "./slime";
import Player from "./player";
import cyberpunkConfigJson from "../../assets/animations/cyberpunk.json";
import slimeConfigJson from "../../assets/animations/slime.json";
import AnimationLoader from "../utils/animation-loader";
import { Scene } from "./scene";

export interface BuildSlimeOptions {
    slimeType?: number
}

const cyberSpritesheets = ['aurora', 'blue', 'yellow', 'green', 'punk'] as const;
const slimeSpriteSheet = 'slime' as const;

type HumanSpriteSheetName = typeof cyberSpritesheets[number]

export default class CharacterFactory {

    animationLibrary = new Map<string, Map<string, string[]>>();
    constructor(public scene: Scene) {
        cyberSpritesheets.forEach(
            (element) => {
                this.animationLibrary.set(element, new AnimationLoader(scene,
                    element,
                    cyberpunkConfigJson,
                    element).createAnimations());
            }
        );
        this.animationLibrary.set(slimeSpriteSheet,
            new AnimationLoader(scene, slimeSpriteSheet, slimeConfigJson, slimeSpriteSheet).createAnimations());
    }

    buildPlayerCharacter(spriteSheetName: HumanSpriteSheetName, x: number, y: number) {
        const maxSpeed = 100
        const cursors = this.scene.input.keyboard.createCursorKeys();
        const animationSets = this.animationLibrary.get('aurora')!;
        let character = new Player(this.scene, x, y, spriteSheetName, 2, maxSpeed, cursors, animationSets);
        character.setCollideWorldBounds(true);
        return character;
    }

    buildSlime(x: number, y: number, { slimeType = 0 }: BuildSlimeOptions) {
        const speed = 40;
        const animations = this.animationLibrary.get(slimeSpriteSheet)!.get(this.slimeNumberToName(slimeType))!;
        let slime = new Slime(this.scene, x, y, slimeSpriteSheet, 9 * slimeType, speed, animations);
        slime.setCollideWorldBounds(true);
        return slime;
    }

    slimeNumberToName(n: number): string {
        switch (n) {
            case 0: return 'Blue';
            case 1: return 'Green';
            case 2: return 'Orange';
            case 3: return 'Pink';
            case 4: return 'Violet';
        }
        throw new Error(`Unknown slime with number ${n}`)
    }
}
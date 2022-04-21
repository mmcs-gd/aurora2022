import { Scene } from "./scene";
import Slime from "./slime";

export default class Corral extends Phaser.Physics.Arcade.Sprite {
	closed = true;
	

    constructor(
		scene: Scene,
		x: number,
		y: number,
		name: string,
		frame: string | number,
        width: number,
        height: number,
		fenceSize: number,
		readonly animationSets: Map<string, string[]>,
	) {
		super(scene, x, y, name, frame);
		scene.physics.world.enable(this, Phaser.Physics.Arcade.STATIC_BODY);
		scene.add.existing(this);
		this.body.setSize(width, height);
		const slimesOverlap = scene.physics.add.overlap(this, scene.slimesGroup, (o1, o2) => {
			const slime = o2 as Slime; // todo check type
			slime.activeJelly = false
			slimesOverlap.active = false
		});
		this.createWalls(fenceSize);
		// slimesOverlap
	}

	createWalls(fenceSize: number) {
		this.createLeftWall();
		this.createRighttWall();
		this.createUpWall();
		this.createDownWall(fenceSize);
		this.createFence(fenceSize);
	}

	private createLeftWall() {

	}
	private createRighttWall() {
		
	}
	private createUpWall() {
		
	}
	private createDownWall(fenceSize: number) {
		
	}
	private createFence(fenceSize: number){

	}
}
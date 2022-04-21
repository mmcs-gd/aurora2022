import Steering from './steering';
import Phaser from 'phaser';
import Vector2 = Phaser.Math.Vector2;
import Sprite = Phaser.Physics.Arcade.Sprite;

export class GoInPoint extends Steering {
	constructor(
		owner: Sprite,
		objects: Sprite[],
		force: number
	) {
		super(owner, objects, force);
	}

	calculateImpulse() {
		console.log("Бегу");
		
		//const target = this.objects[0].body.position;
		const target = this.objects[0];
		console.log("x:"+ target.x+"y:" +target.y);
		const toTarget = new Vector2(
			//this.owner.body.position.x - target.x,
			//this.owner.body.position.y - target.y
			this.owner.x - target.x,
			this.owner.y - target.y
			// для стринга убегать
			//target.x-this.owner.x,
			//target.y-this.owner.y
		);



		if (isNaN(toTarget.x)) return new Vector2(0, 0);
		const x =
			Math.abs(toTarget.x) < 1 ? 0 : -Math.sign(toTarget.x);
		const y =
			Math.abs(toTarget.y) < 1 ? 0 : -Math.sign(toTarget.y);

		return new Vector2(x, y);
	}
}
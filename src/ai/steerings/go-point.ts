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
		
		const target = this.objects[0];
		
		const toTarget = new Vector2(
			
			this.owner.x - target.x,
			this.owner.y - target.y
			
		);



		if (isNaN(toTarget.x)) return new Vector2(0, 0);
		const x =
			Math.abs(toTarget.x) < 1 ? 0 : -Math.sign(toTarget.x);
		const y =
			Math.abs(toTarget.y) < 1 ? 0 : -Math.sign(toTarget.y);

		return new Vector2(x, y);
	}
}
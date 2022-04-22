import Steering from './steering';
import Phaser from 'phaser';
import Vector2 = Phaser.Math.Vector2;
import Sprite = Phaser.Physics.Arcade.Sprite;

export class Escape extends Steering {
	constructor(
		owner: Sprite,
		objects: Sprite[],
		force: number
	) {
		super(owner, objects, force);
	}

	calculateImpulse() {
		
		const target = this.objects[0];
        const owner=this.owner.body;
		const targetPos = this.objects[0].body.position;
        const ownerPos= this.owner.body.position;
        const dist=targetPos.distance(ownerPos);
            const toTarget = new Vector2(
                target.x-this.owner.x,
                target.y-this.owner.y
            );
        



		if (isNaN(toTarget.x)) return new Vector2(0, 0);
		const x =
			Math.abs(toTarget.x) < 1 ? 0 : -Math.sign(toTarget.x);
		const y =
			Math.abs(toTarget.y) < 1 ? 0 : -Math.sign(toTarget.y);

		return new Vector2(x, y);
        
	}
}
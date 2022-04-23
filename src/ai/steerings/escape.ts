import Steering from './steering';
import Phaser from 'phaser';
import Vector2 = Phaser.Math.Vector2;
import Sprite = Phaser.Physics.Arcade.Sprite;

export class Escape implements Steering {
	constructor(
	private	owner: Sprite,
	private	objects: {x: number, y: number},
	public	force: number
	){}

	calculateImpulse() {
		
		const target = this.objects;
        const owner=this.owner.body;

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
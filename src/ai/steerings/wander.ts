import Steering from './steering';
import Phaser from 'phaser';
import Vector2 = Phaser.Math.Vector2;
import Sprite = Phaser.Physics.Arcade.Sprite;

export class Wander implements Steering {
	constructor(
		private owner: Sprite,
		private objects: {x: number, y: number},
		public	force: number
	) {}

	wanderDistance = 7; //желание сохранить траекторию
	wanderRadius = 11; //желание повернуть...
	wanderAngle = 0.3; //...на это количество радиан...
	angleChange = 0.7; //...+- эту величину

	calculateImpulse() {
		const circleCenter = this.owner.body.velocity.clone();
		circleCenter.normalize();
		circleCenter.scale(this.wanderDistance);

		const displacement = new Vector2(0, -1);
		displacement.scale(this.wanderRadius);
		displacement.setAngle(this.wanderAngle);

		Phaser.Math.RND.init;
		this.wanderAngle += Phaser.Math.RND.normal() * this.angleChange;

		return new Vector2(circleCenter.add(displacement).normalize());
	}
}

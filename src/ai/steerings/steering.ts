import Phaser from 'phaser';
import Vector2 = Phaser.Math.Vector2;

export default abstract class Steering {
	constructor(
		protected owner: Phaser.Physics.Arcade.Sprite,
		protected objects: Phaser.Physics.Arcade.Sprite[],
		public force = 1
	) {}

	abstract calculateImpulse(): Vector2;
}

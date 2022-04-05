export default class Player extends Phaser.Physics.Arcade.Sprite {

	nearestObject: Phaser.GameObjects.GameObject[] = [];

	constructor(
		scene: Phaser.Scene,
		x: number,
		y: number,
		name: string,
		frame: string | number,
		readonly maxSpeed: number,
		readonly cursors: Phaser.Types.Input.Keyboard.CursorKeys,
		readonly animationSets: Map<string, string[]>
	) {
		super(scene, x, y, name, frame);
		scene.physics.world.enable(this);
		scene.add.existing(this);
	}

	update() {
		const body = this.body as Phaser.Physics.Arcade.Body;
		body.setVelocity(0);
		const speed = this.maxSpeed;
		const cursors = this.cursors;

		if (cursors.left.isDown) {
			body.velocity.x -= speed;
			//console.log(this.nearestObject.length);
			//console.log(this.x + "   " + this.y)
			//console.log(this.scene.children.list[2].body.position.x + "   " + this.scene.children.list[2].body.position.y)
		} else if (cursors.right.isDown) {
			body.velocity.x += speed;
		}

		// Vertical movement
		if (cursors.up.isDown) {
			body.setVelocityY(-speed);
		} else if (cursors.down.isDown) {
			body.setVelocityY(speed);
		}
		// Normalize and scale the velocity so that player can't move faster along a diagonal
		body.velocity.normalize().scale(speed);
		this.updateListNearestObjects();
		this.updateAnimation();
	}
	updateAnimation() {
		const animations = this.animationSets.get('Walk')!;
		const animsController = this.anims;
		const x = this.body.velocity.x;
		const y = this.body.velocity.y;
		if (x < 0) {
			animsController.play(animations[0], true);
		} else if (x > 0) {
			animsController.play(animations[1], true);
		} else if (y < 0) {
			animsController.play(animations[2], true);
		} else if (y > 0) {
			animsController.play(animations[3], true);
		} else {
			const currentAnimation = animsController.currentAnim;
			if (currentAnimation) {
				const frame = currentAnimation.getLastFrame();
				this.setTexture(frame.textureKey, frame.textureFrame);
			}
		}
	}

	//First element in list - Aurora.
	private updateListNearestObjects() {
		this.nearestObject = [];
		const middleSpriteX = 15;
		const middleSpriteY = 15;
		const middleSpriteYJelly = 16;
		this.scene.children.list.forEach(element => {
			if (element.body != null){
				if ((element.body.position.x+middleSpriteX - (this.x+middleSpriteX)) * (element.body.position.x+middleSpriteX - (this.x+middleSpriteX)) +
					(element.body.position.y+middleSpriteYJelly - (this.y+middleSpriteY)) * (element.body.position.y+middleSpriteYJelly - (this.y+middleSpriteY)) <= 60*60
					&& Math.round(this.x+15!) != Math.round(element.body.position.x) 
					&& Math.round(this.y+15) != Math.round(element.body.position.y)) {
						this.nearestObject.push(element);
				}
			}
		});
	}

	pickJelly() {

	}
	
}

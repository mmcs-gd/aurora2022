
import Slime from "./slime";

export default class Player extends Phaser.Physics.Arcade.Sprite {

	nearestObject: Phaser.GameObjects.GameObject[] = [];
	jellyInHands?: Slime = undefined;

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
		this.pickJelly();
	}

	update() {
		const body = this.body as Phaser.Physics.Arcade.Body;
		body.setVelocity(0);
		const speed = this.maxSpeed;
		const cursors = this.cursors;

		if (cursors.left.isDown) {
			body.velocity.x -= speed;
		} else if (cursors.right.isDown) {
			body.velocity.x += speed;
		}

		// Vertical movement
		if (cursors.up.isDown) {
			body.setVelocityY(-speed);
		} else if (cursors.down.isDown) {
			body.setVelocityY(speed);
		}

		this.jellyInHands?.body.position.set(this.body.position.x + 35, this.body.position.y);
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
						if (this != element)
							this.nearestObject.push(element);
				}
			}
		});
	}
	// Взять желешку работает, но нужно дописать метод следования за Авророй (перед ней). 
	pickJelly() {
		this.scene.input.keyboard.on('keydown-Q', () => {
			if (this.jellyInHands != undefined){
				console.log("pidor")
				this.jellyInHands.activeJelly = true;
				this.jellyInHands = undefined;
			}else{
				if (this.nearestObject.length != 0){
					this.nearestObject.forEach(element => {
						if (element instanceof  Slime) {
							const nearSlime = element as Slime;
							nearSlime.activeJelly = false;
							this.jellyInHands = nearSlime;
							return;
						}
					});
				}
			}	
		});
	}
}

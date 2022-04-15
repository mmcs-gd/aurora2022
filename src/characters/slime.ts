import Phaser from 'phaser';
import Vector2 = Phaser.Math.Vector2;
import { Scene } from './scene';
import { CellType, ScoutedCell, ScoutedPortal } from '../ai/scouting_map/cells';

const eps = 20;

export default class Slime extends Phaser.Physics.Arcade.Sprite {
	private scoutedPortal: undefined | ScoutedPortal = undefined

	constructor(
		public scene: Scene,
		x: number,
		y: number,
		name: string,
		frame: number,
		readonly speed: number,
		readonly animations: string[],
		private sightDistance: number,
	) {
		super(scene, x, y, name, frame);
		scene.physics.world.enable(this);
		scene.add.existing(this);
	}
	pointOfInterest?: Vector2;
	nextLocation?: Vector2;
	wantToJump = false;
	path: { x: number; y: number }[] = [];
	update() {
		if (this.hasArrived()) {
			this.pointOfInterest = new Vector2(
				Phaser.Math.RND.between(0, this.scene.physics.world.bounds.width - 1),
				Phaser.Math.RND.between(50, this.scene.physics.world.bounds.height - 50)
			);
			const { x: neededTileX, y: neededTileY } = this.scene.pixelsToTiles(
				this.pointOfInterest
			);
			const { x: currentPositionX, y: currentPositionY } =
				this.scene.pixelsToTiles(this.body);
			if (!this.wantToJump) {
				this.scene.finder.findPath(
					currentPositionX,
					currentPositionY,
					neededTileX,
					neededTileY,
					path => {
						if (path === null) {
							console.warn('Slime says: Path was not found, gonna jump!');
							this.path = [];
							this.wantToJump = true;
						} else {
							this.path = path;
							console.log('Slime says: Path was found, need to go...');
							this.selectNextLocation();
						}
					}
				);
				this.scene.finder.calculate();
			}
		}
		if (this.nextLocation) {
			const body = this.body as Phaser.Physics.Arcade.Body;
			const position = body.position;

			if (position.distance(this.nextLocation) < eps) {
				this.selectNextLocation();
			} else {
				let delta = Math.round(this.nextLocation.x - position.x);
				if (delta !== 0) {
					body.setVelocity(delta, 0);
				} else {
					delta = Math.round(this.nextLocation.y - position.y);

					body.setVelocity(0, delta);
				}
				this.body.velocity
					.normalize()
					.scale(Math.min(Math.abs(delta), this.speed));
			}
		}

		this.updateScouted();
		this.updateAnimation();
	}

	updateScouted() {
		const { x, y } = this.scene.pixelsToTiles({ x: this.x, y: this.y });
		const halfSight = this.sightDistance / 2;
		const visionRectangle = new Phaser.Geom.Rectangle(
			x - halfSight,
			y - halfSight,
			this.sightDistance,
			this.sightDistance,
		)
		const portals = this.scene.getPortals(visionRectangle)
		if (portals.length > 0) {
			this.scoutedPortal = portals[0]
		}
	}

	updateAnimation() {
		const animsController = this.anims;
		if (this.wantToJump) {
			animsController.play(this.animations[1], true);
		} else {
			animsController.play(this.animations[0], true);
		}
	}

	hasArrived() {
		return (
			this.pointOfInterest === undefined ||
			this.pointOfInterest.distance(this.body.position) < eps
		);
	}

	selectNextLocation() {
		const nextTile = this.path.shift();
		if (nextTile) {
			this.nextLocation = new Vector2(nextTile).scale(this.scene.tileSize);
		} else {
			this.nextLocation = this.body.position;
		}
	}
}

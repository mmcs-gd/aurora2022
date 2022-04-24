import Phaser from 'phaser';
import Vector2 = Phaser.Math.Vector2;
import { Scene } from './scene';
import { CellType, RawPortal } from '../ai/scouting_map/cells';
import { ScoutedMap } from '../ai/scouting_map/map';
import { ArbitratorInstance } from '../ai/behaviour/arbitrator';
import Steering from '../ai/steerings/steering';
import { GoInPoint } from '../ai/steerings/go-point';
import { Wander } from '../ai/steerings/wander';

export default class Slime extends Phaser.Physics.Arcade.Sprite {
	readonly scoutedMap = new ScoutedMap();

	constructor(
		public scene: Scene,
		x: number,
		y: number,
		name: string,
		frame: number,
		public speed: number,
		readonly animations: string[],
		private sightDistance: number,
		readonly outerArbitrator: ArbitratorInstance,
		readonly innerArbitrator: ArbitratorInstance
	) {
		super(scene, x, y, name, frame);
		scene.physics.world.enable(this);
		scene.add.existing(this);

		this.currentTask = this.defaultTask();
	}

	protected steerings: Steering[] = [];
	protected last = Date.now();
	protected eps = 40;

	currentTask: SlimeTask;
	defaultTask(): SlimeTask {
		const x = Phaser.Math.RND.between(-1, 1);
		const y = Phaser.Math.RND.between(-1, 1);
		return new WalkTask(this, new Vector2(x, y), 200);
	}

	addSteering(steering: Steering) {
		this.steerings.push(steering);
	}

	goToOuterArbitrator() {
		this.addSteering(new GoInPoint(this, this.outerArbitrator.location, 2));
	}

	goToInnerArbitrator() {
		this.addSteering(new GoInPoint(this, this.innerArbitrator.location, 2));
	}

	goWandering() {
		this.addSteering(new Wander(this, 1));
	}

	update() {
		// дефолтное гуляние желешки
		if (this.steerings.length === 0) {
			this.goToOuterArbitrator();
		}

		// если желешка достаточно близко к арбитру - общаемся
		if (
			Math.abs(this.x - this.outerArbitrator.location.x) < this.eps &&
			Math.abs(this.y - this.outerArbitrator.location.y) < this.eps &&
			this.steerings[this.steerings.length - 1].constructor.name ===
				'GoInPoint1'
		) {
			// взаимодействие происходит мгновенно - пообщались и ушли
			this.arbitratorInteract(this.outerArbitrator);
			this.steerings.splice(-1, 1); // удаляем последний элемент массива
			this.goWandering();
		} else if (
			// TODO: также должны быть открыты ворота
			Math.abs(this.x - this.innerArbitrator.location.x) < this.eps &&
			Math.abs(this.y - this.innerArbitrator.location.y) < this.eps &&
			this.steerings[this.steerings.length - 1].constructor.name ===
				'GoInPoint1'
		) {
			this.arbitratorInteract(this.innerArbitrator);
			this.steerings.splice(-1, 1); // удаляем последний элемент массива
			this.goWandering();
		}

		const body = this.body as Phaser.Physics.Arcade.Body;
		let imp;
		this.steerings.forEach(st => {
			imp = st.calculateImpulse();
			body.velocity.x += imp.x * st.force;
			body.velocity.y += imp.y * st.force;
		});

		body.velocity.normalize().scale(this.speed);
		if (Date.now() - this.last > 600) {
			this.updateAnimation();
			this.last = Date.now();
		}
		// console.log(this.steerings);

		// обновляем пройденный путь
		this.updateScouted();

		if (!this.currentTask?.execute()) return;
		const nextTask = this.currentTask.nextTask();
		this.currentTask = nextTask == null ? this.defaultTask() : nextTask;
	}

	updateScouted() {
		const { x, y } = this.scene.pixelsToTiles({ x: this.x, y: this.y });
		const halfSight = this.sightDistance / 2;
		const visionRectangle = new Phaser.Geom.Rectangle(
			x - halfSight,
			y - halfSight,
			this.sightDistance,
			this.sightDistance
		);
		const now = this.scene.time.now;
		for (let i = visionRectangle.left; i < visionRectangle.right; ++i) {
			for (let j = visionRectangle.top; j < visionRectangle.bottom; ++j) {
				const portal = this.scene.getPortal({ x, y });
				this.scoutedMap.set(
					portal
						? {
								...portal,
								type: CellType.Portal,
								timestamp: now,
						  }
						: {
								x: x,
								y: y,
								type: CellType.Empty,
								timestamp: now,
						  }
				);
			}
		}
	}
	updateAnimation() {
		const animsController = this.anims;
		animsController.play(this.animations[0], true);
	}

	arbitratorInteract(arbitrator: ArbitratorInstance) {
		arbitrator.visitedBySlime(this);
		const targ = arbitrator.getTarget();
		this.currentTask =
			targ == null
				? this.defaultTask()
				: new SeekTargetTask(this, new Vector2(targ.x, targ.y));
	}
}

class SlimeTask {
	slime: Slime;
	completed: boolean;
	constructor(slime: Slime) {
		this.slime = slime;
		this.completed = false;
	}
	execute(): boolean {
		return (this.completed = true);
	}
	nextTask(): SlimeTask | null {
		return null;
	}
}
class WalkTask extends SlimeTask {
	dir: Vector2;
	time: number;
	constructor(slime: Slime, dir: Vector2, time: number) {
		super(slime);
		this.dir = dir.normalize();
		this.time = time;
	}
	execute(): boolean {
		return (this.completed = this.time-- < 0);
	}
}
class SeekTargetTask extends SlimeTask {
	target: { x: number; y: number };
	constructor(slime: Slime, target: { x: number; y: number }) {
		super(slime);
		this.target = target;
	}
	execute(): boolean {
		if (this.completed) return true;
		const dx = this.target.x - this.slime.body.position.x;
		const dy = this.target.y - this.slime.body.position.y;
		this.slime.body.velocity.set(dx, dy).normalize().scale(this.slime.speed);
		return (this.completed =
			Phaser.Math.Distance.BetweenPoints(this.target, this.slime) <
			this.slime.speed);
	}
}

// я хз че делать без класса портала
class SeekPortalTask extends SeekTargetTask {
	portal: RawPortal;
	constructor(slime: Slime, portal: RawPortal) {
		super(slime, portal);
		this.portal = portal;
	}
	execute(): boolean {
		if (!super.execute()) return false;
		// а че желе должен с порталом сделать
		return true;
	}
}

// le deez dock has arrived:
// Выбирается из загона				| По достижению, есть актуал. инфа о порталах			| Движение к приоритетному порталу
// Выбирается из загона				| По достижению, нет актуал. инфы о порталах			| Блуждание
// Блуждание 						| Обнаружение портала									| Движение к арбитру
// Движение к арбитру				| По достижению											| Получ./передача инфы
// Движение к ближайшему порталу	| По достижению, не обнаружен							| Блуждание
// Движение к ближайшему порталу	| По достижению, обнаружен								| Зайти в портал
// Получ./передача инфы				| Нет инфы о порталах									| Блуждание
// Получ./передача инфы				| Есть инфа о порталах									| Движение к ближайшему порталу
// Блуждание						| Аврора поднимает желешку								| Неактивность
// Движение к цели					| Аврора поднимает желешку								| Неактивность
// Получ./передача инфы				| Аврора поднимает желешку								| Неактивность
// Неактивность						| Аврора помещает желешку в загон, есть инфа о порталах	| Получ./передача инфы
// Получ./передача инфы				| Желешка в загоне, информация передана					| Неактивность
// Неактивность						| Панк открыл загон										| Выбирается из загона

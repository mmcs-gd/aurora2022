import Phaser from 'phaser';
import Vector2 = Phaser.Math.Vector2;
import { Scene } from './scene';
import { CellType } from '../ai/scouting_map/cells';
import { ScoutedMap } from '../ai/scouting_map/map';
import { ArbitratorInstance } from '../ai/behaviour/arbitrator';
import Steering from '../ai/steerings/steering';
import { GoToPoint } from '../ai/steerings/go-point';
import { Wander } from '../ai/steerings/wander';
import { Pursuit } from '../ai/steerings/pursuit';
import Fence from './fence';
import CharacterFactory from './character_factory';
import { ArbitratorCharacter } from './arbitrator';

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
		public sightDistance: number,
		readonly factory: CharacterFactory
	) {
		super(scene, x, y, name, frame);
		scene.physics.world.enable(this);
		scene.add.existing(this);
	}

	public steerings: Steering[] = [];
	protected last = Date.now();

	currentTask: SlimeTask = this.defaultTask();

	/**
	 * creates and returns (but not sets to slime) a new default SlimeTask
	 * @returns new WalkTask making slime wander with no target
	 */
	defaultTask(): SlimeTask {
		return new WalkTask(this);
	}
	/**
	 * disables slime activity
	 */
	taskStop() {
		this.currentTask = new WaitingTask(this);
	}
	/**
	 * enables slime activity with default task
	 */
	taskStart() {
		this.currentTask = this.defaultTask();
	}
	/**
	 * used to enable slime activity when placed in Zagonsterlitz to escape
	 * @param gate escape point with pass state
	 */
	trap(fence: Fence, arbitrator: ArbitratorCharacter) {
		arbitrator.visitedBySlime(this);
		this.currentTask = new EscapeTask(this, fence, arbitrator);
	}

	addSteering(steering: Steering) {
		this.steerings.push(steering);
	}

	// костыльная но работающая проверка на нахождение в загоне
	isInCorral() {
		if (this.x > 912 && this.x < 1107.5 && this.y > 175.5 && this.y < 273.5) {
			return true;
		}
		return false;
	}

	update() {
		const body = this.body as Phaser.Physics.Arcade.Body;
		let imp;
		// если желешка внутри загона и загон закрыт
		if (this.factory.corral?.fence.isClosed && this.isInCorral()) {
			this.currentTask = new WaitingTask(this);
		} else if (this.isInCorral()) {
			this.currentTask = new EscapeTask(
				this,
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				this.factory.corral!.fence,
				// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
				this.factory.innerArbitrator!
			);
		}
		body.velocity.normalize();
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

		// обновляем пройденный путь
		this.updateScouted();

		if (!this.currentTask?.execute()) return;
		const nextTask = this.currentTask.nextTask() || this.defaultTask();
		// console.log(`Change task from ${this.currentTask.constructor.name} to ${nextTask.constructor.name}`)
		this.currentTask = nextTask;
	}

	updateScouted() {
		const { x, y } = this.scene.pixelsToTiles(this);
		const visionRectangle = new Phaser.Geom.Rectangle(
			x - this.sightDistance,
			y - this.sightDistance,
			this.sightDistance * 2,
			this.sightDistance * 2
		);
		const now = this.scene.time.now;
		for (let i = visionRectangle.left; i < visionRectangle.right; ++i) {
			for (let j = visionRectangle.top; j < visionRectangle.bottom; ++j) {
				const currentX = x + i;
				const currentY = y + i;
				const portal = this.factory.getPortal({ x: currentX, y: currentY });
				this.scoutedMap.set(
					portal
						? {
								x: currentX,
								y: currentY,
								type: CellType.Portal,
								timestamp: now,
								capacity: portal.capacity,
								count: portal.count,
						  }
						: {
								x: currentX,
								y: currentY,
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
		const target = arbitrator.getTarget();
		this.currentTask =
			target == null
				? this.defaultTask()
				: new TargetSeekTask(this, new Vector2(target.x, target.y));
	}
}

/**
* abstract class of task for slimes

* supposed to manage slime behaviour for some task execution
*/
export class SlimeTask {
	slime: Slime;
	completed: boolean;
	constructor(slime: Slime) {
		this.slime = slime;
		this.completed = false;
	}

	/**
	 * manages slime at exact moment to execute task
	 * @returns completion status, TRUE if task completed, FALSE if task in process
	 */
	execute(): boolean {
		return (this.completed = true);
	}

	/**
	 * creates and returns a new task object following current on complete
	 * @returns new SlimeTask object or NULL if no following task specified (recognized by slime as default task)
	 */
	nextTask(): SlimeTask | null {
		return null;
	}
}

/**
 * species of SlimeTask
 *
 * used as plug disabling slime activity
 */
export class WaitingTask extends SlimeTask {
	constructor(slime: Slime) {
		super(slime);
	}
	execute(): boolean {
		this.slime.body.velocity.set(0, 0);
		return false;
	}
}

/**
* species of SlimeTask

* used to make slime wander with no target in some direction
*/
export class WalkTask extends SlimeTask {
	st: Wander;
	radius: number;
	constructor(slime: Slime) {
		super(slime);
		this.radius = slime.scene.tilesToPixels({ x: slime.sightDistance, y: 0 }).x;
		this.st = new Wander(slime, 1);
	}
	execute(): boolean {
		if (this.slime.steerings.length === 0) {
			this.slime.addSteering(this.st);
		} else {
			this.slime.steerings.splice(-1, 1);
			this.slime.addSteering(this.st);
		}

		const portal = this.slime.factory.getClosestPortal(this.slime);
		if (portal == null) return false;
		return (this.completed =
			Phaser.Math.Distance.BetweenPoints(this.slime, portal) <= this.radius);
	}
	nextTask(): SlimeTask | null {
		return new ArbitratorSeekTask(
			this.slime,
			// TODO: вернуть ближайшего, если их будет несколько
			this.slime.factory.outerArbitrator[0]
		);
	}
}
/**
 * species of SlimeTask
 *
 * used to make slime move to some point (x, y)
 *
 * supposed to be base class for go&interact tasks, therefore property radius stands for action distance
 */
export class TargetSeekTask extends SlimeTask {
	st: GoToPoint;
	radius = 36 * 2;
	constructor(slime: Slime, public target: { x: number; y: number }) {
		super(slime);
		this.st = new GoToPoint(slime, target, 1);
	}
	execute(): boolean {
		if (this.slime.steerings.length === 0) {
			this.slime.addSteering(this.st);
		} else {
			this.slime.steerings.splice(-1, 1);
			this.slime.addSteering(this.st);
		}
		return (this.completed =
			Phaser.Math.Distance.BetweenPoints(this.target, this.slime) <
			this.radius);
	}
	nextTask(): SlimeTask | null {
		return new WaitingTask(this.slime); // дошла до цели и ждет
	}
}
/**
 * species of SlimeTask
 *
 * used to make slime move to some mutable game object
 */
export class ObjectSeekTask extends SlimeTask {
	st: Pursuit;
	radius = 20;
	target: Phaser.Physics.Arcade.Sprite;
	constructor(slime: Slime, target: Phaser.Physics.Arcade.Sprite) {
		super(slime);
		this.target = target;
		this.st = new Pursuit(slime, target, 1);
	}
	execute(): boolean {
		if (this.completed) return true;

		if (this.slime.steerings.length === 0) {
			this.slime.addSteering(this.st);
		} else {
			this.slime.steerings.splice(-1, 1);
			this.slime.addSteering(this.st);
		}

		if (Phaser.Math.Distance.BetweenPoints(this.slime, this.target) < 100) {
			this.slime.body.velocity.set(0, 0);
			return false;
		}

		return (this.completed =
			Phaser.Math.Distance.BetweenPoints(this.target, this.slime) <
			this.radius);
	}
}
/**
 * species of SeekTargetTask
 *
 * used to make slime move to portal and interact with it if reached
 *
 * must take only portal position copy to seek and check if it still exist at such location before interact
 */
export class PortalSeekTask extends TargetSeekTask {
	constructor(slime: Slime, portal: { x: number; y: number }) {
		super(slime, portal);
	}

	nextTask(): SlimeTask | null {
		const portal = this.slime.factory.getPortal(
			this.slime.scene.pixelsToTiles(this.target)
		);
		if (portal == null) return new WalkTask(this.slime);
		if (portal.addSlime(this.slime))
			// желе пытается залезть в лужу
			// если желе пристроилось к луже, создает себе WaitingTask, иначе идет гулять (return null)
			return new WaitingTask(this.slime);
		return new ArbitratorSeekTask(
			this.slime,
			// TODO: вернуть ближайшего, если их будет несколько
			this.slime.factory.outerArbitrator[0]
		);
	}
}
/**
 * species of SeekTargetTask
 *
 * used to make slime escape from Zagonsterlitz through open gates and switch to next task according to arbitrator target
 *
 * specifies next task as PortalSeekTask if arbitrator have such target or WalkTask if no target
 */
export class EscapeTask extends TargetSeekTask {
	constructor(
		slime: Slime,
		private fence: Fence,
		private arbitrator: ArbitratorCharacter
	) {
		super(slime, fence);
	}
	execute(): boolean {
		return super.execute();
	}
	nextTask(): SlimeTask | null {
		const target = this.arbitrator.getTarget();
		if (target === null) {
			return new WalkTask(this.slime);
		} else {
			return new PortalSeekTask(this.slime, target);
		}
	}
}

/**
 * species of SeekTargetTask
 *
 * used to make slime escape from Zagonsterlitz through open gates and switch to next task according to arbitrator target
 *
 * species next task as PortalSeekTask if arbitrator have such target or WalkTask if no target
 */
export class ArbitratorSeekTask extends TargetSeekTask {
	constructor(slime: Slime, private arbitrator: ArbitratorCharacter) {
		super(slime, arbitrator.location);
	}

	nextTask(): SlimeTask | null {
		this.arbitrator.visitedBySlime(this.slime);
		const target = this.arbitrator.getTarget();
		if (target === null) {
			return new WalkTask(this.slime);
		} else {
			return new PortalSeekTask(this.slime, new Vector2(target.x, target.y));
		}
	}
}

// le deez dock has arrived:
//_______________________________________________________________________________________________________________________
// Выбирается из загона				| По достижению, есть актуал. инфа о порталах			| Движение к приоритетному порталу
// EscapeTask			->	PortalSeekTask		:	arbitrator.targ != null
//_______________________________________________________________________________________________________________________
// Выбирается из загона				| По достижению, нет актуал. инфы о порталах			| Блуждание
// EscapeTask			->	WalkTask			:	arbitrator.targ == null
//_______________________________________________________________________________________________________________________
// Блуждание 						| Обнаружение портала									| Движение к арбитру
// WalkTask				->	ArbitratorSeekTask	:	distance(closestPortal) <= sightDistance
//_______________________________________________________________________________________________________________________
// Движение к арбитру				| По достижению											| Получ./передача инфы
// ArbitratorSeekTask	.	execute()			:	TargetSeekTask.execute()==true
//_______________________________________________________________________________________________________________________
// Движение к ближайшему порталу	| По достижению, не обнаружен							| Блуждание
// PortalSeekTask		->	WalkTask			:	closestPortal == null || distance(closestPortal) > slime.speed
//_______________________________________________________________________________________________________________________
// Движение к ближайшему порталу	| По достижению, обнаружен								| Зайти в портал
// PortalSeekTask		->	WaitingTask			:	distance(closestPortal) < slime.speed
//_______________________________________________________________________________________________________________________
// Получ./передача инфы				| Нет инфы о порталах									| Блуждание
// currentTask			=	WalkTask			:	arbitrator.targ == null
//_______________________________________________________________________________________________________________________
// Получ./передача инфы				| Есть инфа о порталах									| Движение к ближайшему порталу
// currentTask			->	PortalSeekTask		:	arbitrator.targ != null
//_______________________________________________________________________________________________________________________
// Блуждание						| Аврора поднимает желешку								| Неактивность
// 													taskStop()
//_______________________________________________________________________________________________________________________
// Движение к цели					| Аврора поднимает желешку								| Неактивность
// 													taskStop()
//_______________________________________________________________________________________________________________________
// Получ./передача инфы				| Аврора поднимает желешку								| Неактивность
// 													taskStop()
//_______________________________________________________________________________________________________________________
// Неактивность						| Аврора помещает желешку в загон, есть инфа о порталах	| Получ./передача инфы
//													trap()
//_______________________________________________________________________________________________________________________
// Получ./передача инфы				| Желешка в загоне, информация передана					| Неактивность
//													trap()
//_______________________________________________________________________________________________________________________
// Неактивность						| Панк открыл загон										| Выбирается из загона
// EscapeTask			.	execute()			:	gate.closed == false

//______________________________________________
// я таких больших комментариев в жизни не писал

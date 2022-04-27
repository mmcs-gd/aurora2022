import Slime from '../../characters/slime';
import { CellType, ScoutedCell, ScoutedPortal } from '../scouting_map/cells';
import { ScoutedMap } from '../scouting_map/map';

export class Arbitrator {
	private map: ScoutedMap = new ScoutedMap();

	merge(map: ScoutedMap) {
		this.map.merge(map);
		map.clear();
	}

	private isPortal(p: ScoutedCell): p is ScoutedPortal {
		return p.type === CellType.Portal;
	}

	getPortals(): ScoutedPortal[] {
		return this.map.getAll().filter(this.isPortal);
	}
}

export class ArbitratorInstance {
	constructor(
		private soul: Arbitrator,
		public location: { x: number; y: number }
	) {}

	visitedBySlime(slime: Slime) {
		this.soul.merge(slime.scoutedMap);
	}

	private distance(point: { x: number; y: number }): number {
		const dx = this.location.x - point.x;
		const dy = this.location.y - point.y;
		return Math.sqrt(dx * dx + dy * dy);
	}

	// Метрика для выбора портала
	private metric(portal: ScoutedPortal): number {
		const dist = this.distance(portal) + 1;
		const countCf = portal.count / portal.capacity + 0.5;
		const full = countCf < 2 ? countCf : 0.1;
		return full / dist;
	}

	getTarget(): { x: number; y: number } | null {
		const portals = this.soul.getPortals();
		const sum_metric = portals.reduce((sum, p) => sum + this.metric(p), 0);
		const rnd = Math.random();
		let sum = 0;
		const portal = portals.reduce<ScoutedPortal | null>((res, p) => {
			sum += this.metric(p);
			if (sum / sum_metric > rnd) return p;
			return null;
		}, null);
		if (portal == null) return null;
		portal.count += 1;
		return { x: portal.x, y: portal.y };
	}
}

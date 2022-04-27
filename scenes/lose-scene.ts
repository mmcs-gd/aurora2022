import * as Phaser from 'phaser';
import { MenuButton } from './menu-scene';

export class LoseScene extends Phaser.Scene {
	constructor() {
		super({
			active: false,
			visible: false,
			key: 'LoseScene',
		});
	}

	public create(): void {
		this.add
			.text(100, 50, 'YOU LOOSE!', {
				color: '#FF0000',
			})
			.setFontSize(24);
		new MenuButton(this, 100, 100 + 75, 'Go to menu', () =>
			this.scene.start('MainMenu')
		);
	}
}

import * as Phaser from 'phaser';
import { MenuButton } from './menu-scene';

export class WinScene extends Phaser.Scene {
	constructor() {
		super({
			active: false,
			visible: false,
			key: 'WinScene',
		});
	}

	public create(): void {
		this.add
			.text(100, 50, 'YOU WIN!', {
				color: '#0FFF0F',
			})
			.setFontSize(24);
		new MenuButton(this, 100, 100 + 75, 'Go to menu', () =>
			this.scene.start('MainMenu')
		);
	}
}

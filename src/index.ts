import Phaser from 'phaser';
import scenes from '../scenes';
const config: Phaser.Types.Core.GameConfig = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	pixelArt: true,
	zoom: 1.2,
	scene: scenes,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {
				y: 0,
			},
		},
	},
};

const game = new Phaser.Game(config);

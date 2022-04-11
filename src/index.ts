import Phaser from 'phaser';

import testEugeneScene from '../scenes/testEugeneScene';

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	pixelArt: true,
	zoom: 1.2,
	scene: testEugeneScene,
	physics: {
		default: 'arcade',
		arcade: {
			gravity: {
				y: 0,
				debug: true, // set to true to view zones
			},
		},
	},
};

const game = new Phaser.Game(config);

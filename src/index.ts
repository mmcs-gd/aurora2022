import Phaser from 'phaser';

import StartingScene from '../src/scenes/starting-scene';
import TestSteerScene from '../src/scenes/test_steer';

const config = {
	type: Phaser.AUTO,
	width: 800,
	height: 600,
	pixelArt: true,
	zoom: 1.2,
	//scene: StartingScene,
	scene: TestSteerScene,
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

import Phaser from 'phaser';
import EasyStar from 'easystarjs';
import { RawPortal } from '../ai/scouting_map/cells';

/*
    Интерфейс сцены
    Здесь описываем требования к сцене, которые нужны для работы классов из src
*/
export interface Scene extends Phaser.Scene {
	readonly finder: EasyStar.js;
	readonly tileSize: number;
	tilesToPixels(tile: { x: number; y: number }): Phaser.Math.Vector2;
	pixelsToTiles(pixels: { x: number; y: number }): Phaser.Math.Vector2;
	getPortal(tile: { x: number; y: number }): RawPortal | null;
}

/*
    - Почему бы не импортировать StartingScene везде?
    Потому что тогда возникнут циклические зависимости.
    Также, мы вполне можем захотеть несколько сцен, это очевидная точка масштабирования.
    Возможно, лучшим решением является создание здесь класса сцены с реализацией обязательных штук,
    от которой потом наследовать StartedScene, но на момент написания комментария не ясно, насколько это хорошо.
*/

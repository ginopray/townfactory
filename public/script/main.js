/**
 * Main.
 * On window.onload, it calls game = new Phaser.Game()
 * @file
 * @see game
 * @see phaser_object
 */


/**
 * The Phaser.io game object.
 * @name game
 * @global
 * @example
 * game = new Phaser.Game(800, 600, Phaser.AUTO, 'map-canvas', {
 *   preload: GameApp.init,
 *   create: GameApp.start,
 *   update: GameApp.update
 * });
 */
var game;


/**
 * The Phaser.io game data object.
 * Contains groups and other Phaser.io objects.
 * @name phaser_object
 * @property {object}  groups - Phaser groups
 * @property {object}  groups.buildings - Buildings group
 * @global
 * @example // Creating buildings group:
 * phaser_object.groups.buildings = game.add.group();
 * // Set 'enableBody' on buildings group:
 * phaser_object.groups.buildings.enableBody = true;
 */
var phaser_object = {
  groups : {},
  collisions : {},
};


window.onload = function() {  
  game = new Phaser.Game(Map.settings.gameWidth, Map.settings.gameHeight, Phaser.CANVAS, 'map-canvas',
    {
      /*init:     GameApp.init,*/
      preload:  GameApp.preload,
      create:   GameApp.create,
      update:   GameApp.update,
      /*render:   GameApp.render,*/
    }
  );
}

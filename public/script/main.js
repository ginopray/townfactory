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
 * @property {object} groups - Phaser groups.
 * @property {object} groups.buildings - Buildings group.
 * @property {object} collisions - Collision groups.
 * @property {array} grid - Array of rectangles (tiles).
 * @property {object} helper - Helper sprite.
 * @property {object} inputs - Input geometries.
 * @property {object} inputs.mouse - Mouse geometries.
 * @property {object} inputs.mouse.selection - Mouse selection object.
 * @property {object} inputs.keyboard - keyboard data.
 * @property {array} inputs.keyboard.keys - keyboard keys list.
 * @global
 * @example // Creating buildings group:
 * phaser_object.groups.buildings = game.add.group();
 * // Set 'enableBody' on buildings group:
 * phaser_object.groups.buildings.enableBody = true;
 */
var phaser_object = {
  groups : {},
  collisions : {},
  grid : [],
  inputs: {
    mouse: {
      selection: {},
    },
    keyboard: {
      keys: [],
    }
  },
  helper: false
};

jQuery(document).ready(function(){
  var container_w = jQuery('#map-container').width();
  var container_h = jQuery('#map-container').outerHeight();
  game = new Phaser.Game(container_w, container_h, Phaser.CANVAS, 'map-canvas', // Phaser.AUTO
    {
      /*init:     GameApp.init,*/
      preload:  GameApp.preload,
      create:   GameApp.create,
      update:   GameApp.update,
      render:   GameApp.render,
    }
  );
});


function getRandom(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
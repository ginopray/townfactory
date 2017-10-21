/**
 * Contains the Building class.
 * @file
 * @see Building
 */

/**
 * Building class.
 * @name Building
 * @class
 * @classdesc Create a building istance.
 * @property {number} pos_x - x position
 * @property {number} pos_y - y position
 * @property {object} sprite - Phaser.io sprite object
 */
var Building = function () {
  this.pos_x = Math.floor(Math.random() * 800) + 1;
  this.pos_y = Math.floor(Math.random() * 600) + 1;
};

/**
 * Add the building to the map.
 * @memberof Building
 * @name spawn
 * @method
 */
Building.prototype.spawn  = function () {
  // Create sprite and add it to "factory" group.
  this.sprite = phaser_object.groups.buildings.create(this.pos_x, this.pos_y, 'factory');
  this.sprite.body.immovable = true;
};

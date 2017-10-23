/**
 * Contains the Building class.
 * @file
 * @see Building
 */

/**
 * Building class.
 * @name Building
 * @class
 * @classdesc Create a building instance.
 * @property {number} pos_x - x position (in px).
 * @property {number} pos_y - y position (in px).
 * @property {object} sprite - Phaser.io sprite object.
 * @property {number} production - Resource id.
 */
var Building = function () {
  // Random position.
  this.pos_x = Math.floor(Math.random() * Map.settings.gameWidth) + 1;
  this.pos_y = Math.floor(Math.random() * Map.settings.gameHeight) + 1;
  // Random production.
  this.production = Resources.getRandom(1);
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
  // Log building info onclick.
  this.sprite.inputEnabled = true;
  this.sprite.events.onInputDown.add(function(){ console.log ("Produzione: " + this.production)}, this);
};

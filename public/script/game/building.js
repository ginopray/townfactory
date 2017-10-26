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
 * @param {number} type - Building type.
 * @param {number} pos_x - x (tile) position.
 * @param {number} pos_y - y (tile) position.
 * @property {number} type - Building ID.
 * @property {number} pos_x - x (tile) position.
 * @property {number} pos_y - y (tile) position.
 * @property {object} sprite - Phaser.io sprite object.
 * @property {object} production - Production data.
 * @property {number} production.resources - Array of resources it can produces.
 * @property {number} production.current - Array of current production.
 * @property {bool} power_switch - Production active or not.
 */
var Building = function (type, pos_x, pos_y) {
  
  // FIRST!
  // Setting defaults.
  var default_building = Database.get('buildings', {
      id : type
    });

  // Set defaults!
  Object.assign(this, default_building[0]);
  
  
  this.id = 'to define';
  
  // Is producing?
  this.power_switch = 1;
  
  // Building type.
  this.type = type;
  
  // Random position.
  //this.pos_x = Math.floor(Math.random() * Map.settings.gameWidth) + 1;
  //this.pos_y = Math.floor(Math.random() * Map.settings.gameHeight) + 1;
  this.pos_x = pos_x;
  this.pos_y = pos_y;
  
  // Get the production.
  this.production = Production.get(type);
  
};


/**
 * Add the building to the map.
 * @memberof Building
 * @name spawn
 * @instance
 * @method
 */
Building.prototype.spawn  = function () {
  
  // Get building size.
  // this.width and this.height aqe expressed in tiles.
  var width = this.width * Map.settings.tileWidth;
  var height = this.height * Map.settings.tileHeight;
  
  // Get the tile coordinates.
  var tile = Map.get_tile({x: this.pos_x, y: this.pos_y, w: width, h: height}, 'rgba(244, 67, 54, .5)');
  
  // Create sprite and add it to "buildings" group.
  this.sprite = phaser_object.groups.buildings.create(tile.x, tile.y, 'building-' + this.type);
  
  // Center anchor.
  this.sprite.anchor.setTo(0.5, 0.5);
  
  // Setting the size.
  this.sprite.width = width;
  this.sprite.height = height;
  this.sprite.top = tile.top;
  this.sprite.left = tile.left;  
  
  // Set physics.
  game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.collideWorldBounds = true;
  this.sprite.body.immovable = true;
  
  
  // Log building info onclick.
  this.sprite.inputEnabled = true;
  this.sprite.events.onInputOver.add(function(){
    Board.info_building(this);
  }, this);
  this.sprite.events.onInputOut.add(function(){
    Board.info_building(false);
  }, this);
  
};


/**
 * Produces resources (called by update loop).
 * @memberof Building
 * @name produce
 * @instance
 * @method
 */
Building.prototype.produce  = function () {
  // Is building active?
  if (this.power_switch == 0)
    return;
  
  var resource,
      current,
      can_start;
  // What can produce?
  for (var r in this.production.resources) {
    resource = this.production.resources[r].resource;
    production_time = this.production.resources[r].time;
    current = this.production.current[resource];
    can_start = true;
    //console.log(this.name, [resource, production_time, current])
    // Is producing?
    if (typeof current !== "undefined") {
      // Production done!
      if ((Date.now() - current) / 1000 > production_time) {
        //console.log("Done resource: " + resource + "!");
        delete this.production.current[resource];
        Resources.create(resource, this);
      // Producing...
      } else {
        //console.log("Producing " + resource + "...");
        can_start = false;
      }
    }
    // Can start producing something?
    if (can_start) {
      //console.log("Can produce: " + resource + "?");
      
      // Check for needed resources.
      if (1 == 1) {
        // Start production!
        this.production.current[resource] = Date.now();
      }
    }
  }
  
}






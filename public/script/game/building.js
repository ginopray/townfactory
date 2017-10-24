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
 * @property {number} type - Building ID.
 * @property {number} pos_x - x position (in px).
 * @property {number} pos_y - y position (in px).
 * @property {object} sprite - Phaser.io sprite object.
 * @property {object} production - Production data.
 * @property {number} production.resources - Array of resources it can produces.
 * @property {number} production.current - Array of current production.
 * @property {bool} power_switch - Production active or not.
 */
var Building = function (type) {
    
  // FIRST!
  // Setting defaults.
  var default_building = Database.get('buildings', {
      id : type
    });

  // Set defaults!
  Object.assign(this, default_building[0]);
  
  // Is producing?
  this.power_switch = 1;
  
  this.id = 'to define';
  
  // Building type.
  this.type = type;
  
  // Random position.
  this.pos_x = Math.floor(Math.random() * Map.settings.gameWidth) + 1;
  this.pos_y = Math.floor(Math.random() * Map.settings.gameHeight) + 1;
  
  // Get the production.
  this.production = Production.get(type);
  
};


/**
 * Add the building to the map.
 * @memberof Building
 * @name spawn
 * @method
 */
Building.prototype.spawn  = function () {
  // Create sprite and add it to "buildings" group.
  this.sprite = phaser_object.groups.buildings.create(this.pos_x, this.pos_y, 'building-' + this.type);
  
  // Setting the size.
  var width = this.width * Map.settings.tileWidth;
  var height = this.height * Map.settings.tileHeight;
  this.sprite.width = width;
  this.sprite.height = height;  
  
  // Set physics.
  game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.collideWorldBounds = true;
  this.sprite.body.immovable = true;
  
  
  // Log building info onclick.
  this.sprite.inputEnabled = true;
  this.sprite.events.onInputDown.add(function(){
    console.log ("Type: " + this.type + ", Produzione: ", this.production);
  }, this);
};


/**
 * Produces resources (called by update loop).
 * @memberof Building
 * @name produce
 * @methodresources it can produces
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
        Resources.create(resource, this.sprite.x, this.sprite.y);
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



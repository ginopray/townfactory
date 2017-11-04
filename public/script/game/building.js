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
  
  if (typeof type === "undefined")
    return;
  
  // FIRST!
  // Setting defaults.
  var default_building = Database.get('buildings', {
      id : type
    });

  // Set defaults!
  Object.assign(this, default_building[0]);
  
  // Set item ID.
  this.id = ++ GameApp.data.indexes.buildings;
  
  // Is producing?
  this.power_switch = 1;
  
  // Building type.
  this.type = type;
  
  // Set position.
  if (typeof pos_x !== "undefined" &&
      typeof pos_y !== "undefined") {
    this.pos_x = pos_x;
    this.pos_y = pos_y;
  } else {
    var coords = Map.random_position();
    this.pos_x = coords.x;
    this.pos_y = coords.y;
  }
  
  // Set level.
  this.level = 1;
  
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
  
  // Save item id on the sprite.
  this.sprite.custom_id = this.id;
  // Save map (tile) coordinates.
  this.sprite.custom_pos_x = this.pos_x;
  this.sprite.custom_pos_y = this.pos_y;
  
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
      can_start,
      station,
      requires;
  // What can produce?
  for (var r in this.production.resources) {
    resource = this.production.resources[r].resource;
    requires = this.production.resources[r].requires;
    production_time = this.production.resources[r].time;
    current = this.production.current[resource];
    can_start = true;
    //console.log(this.name, [resource, production_time, current])
    // Is producing?
    if (typeof current !== "undefined") {
      // Production done!
      if ((Date.now() - current) / 1000 > production_time) {
        //console.log("Done resource: " + resource + "!");
        
        // Check for exit point.
        station = this.get_station(0);
        if (station) {
          // Remove "needs outcoming station" message.
          //Board.message_remove(1, [this.fullname()]);
          // Check if station is free.
          if (Roads.check_free_station(station)) {
            
            // PRODUCE!
            // Clear current production.
            delete this.production.current[resource];
            // Create the resource!
            Resources.create(resource, this, station);
            
          } else {
            can_start = false;
          }
        } else {
          // Add "needs outcoming station" message.
          //Board.message_add(1, [this.fullname()]);
          can_start = false;
        }
        
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
      if (this.can_produce(resource, requires)) {
        // Start production!
        this.production.current[resource] = Date.now();
      }
    }
  }
  
}


/**
 * Check if building can start producing something.
 * @memberof Building
 * @name can_produce
 * @instance
 * @method
 * @param {number} resource - Resource type.
 * @param {array} requires - Array of required resources.
 */
Building.prototype.can_produce  = function (resource, requires) {
  if (requires.length == 0)
    return true;

  var required,
      amount,
      gathered = new Array();
  for (var r in requires) {
    required = requires[r].requires;
    amount = requires[r].amount;
    if (this.gather(required, amount)) {
      gathered.push({required: required, amount: amount});
    } else {
      // Return back gathered resources.
      //console.log(resource + " requires " + amount + ' of '  + required);
      for (var g in gathered) {
        this.store(gathered[g].required, gathered[g].amount);
      }
      return false;
    }
  }
  return true;
  
}


/**
 * Get building stations.
 * @memberof Building
 * @name get_station
 * @instance
 * @method
 * @param {number} in_out - 1|0 0 = incoming station, 1 = outcoming station
 */
Building.prototype.get_station  = function (in_out) {
  // Search a road near the building.
  var borders = Map.get_border_tiles(this);
  var x,
      y;
  for (var i in borders) {
    x = borders[i].x;
    y = borders[i].y;
    if (typeof GameApp.data.roads.items[x] !== "undefined" && 
        typeof GameApp.data.roads.items[x][y] !== "undefined" &&
       GameApp.data.roads.items[x][y].station &&
       GameApp.data.roads.items[x][y].in_out == in_out) {
      return GameApp.data.roads.items[x][y];
    }
  }
  return false;
}


/**
 * Store resource in the warehouse.
 * @memberof Building
 * @name store
 * @instance
 * @method
 * @param {number} resource - Resource type.
 * @return {array}
 */
Building.prototype.store  = function (resource, amount) {
  
  if (typeof amount === "undefined")
    amount = 1;
  
  if (typeof this.warehouse[resource].amount === "undefined")
    this.warehouse[resource].amount = 0;
  // Store!
  this.warehouse[resource].amount += amount;

}


/**
 * Gather resource from the warehouse.
 * @memberof Building
 * @name gather
 * @instance
 * @method
 * @param {number} resource - Resource type.
 * @param {number} amount - Amount of resources to take.
 * @return {boolean} false if not enough resources in the warehouse.
 */
Building.prototype.gather  = function (resource, amount) {
  
  if (typeof this.warehouse === "undefined" ||
      typeof this.warehouse[resource] === "undefined" || 
      typeof this.warehouse[resource].amount === "undefined" ||
      this.warehouse[resource].amount < amount)
    return false;
  
  // Gather!
  this.warehouse[resource].amount -= amount;
  return true;
}


/**
 * Get translated name.
 * @memberof Building
 * @name fullname
 * @instance
 * @method
 * @param {object} resource - Resource object.
 * @return {string} The name
 */
Building.prototype.fullname  = function () {
  var str = Main.t('building-' + this.type);
  if (str == 'building-' + this.type)
    str = Main.t(this.name);
  return str;
}





/**
 * Village class (children of Building).
 * @name Village
 * @class
 * @classdesc Create a village.
 * @see Building
 * @property {array} request - The resources required by the village.
 */
var Village = function (type, pos_x, pos_y) {
  // Call the parent constructor.
  Building.call(this, type, pos_x, pos_y);
  
  // Ger required resources.
  this.request = new Array;
  this.new_request();
  
}
// Inherit Building
Village.prototype = new Building();
Village.prototype.constructor = Village;


/**
 * Get a new resource request.
 * @memberof Village
 * @name new_request
 * @instance
 * @method
 * @param {object} resource - Resource object.
 * @return {string} The name
 */
Village.prototype.new_request  = function () {
  var resource = Resources.getRandom({value: this.level});
  if (resource) {
    var amount = 1000;
    
    // Check already required.
    for (var r in this.request) {
      if (this.request[r].resource == resource)
        return;
    }
    
    this.request.push({
      resource: resource,
      amount: amount
    });
    //console.log("new request: " + resource);
  }
}




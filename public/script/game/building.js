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
      station;
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
        
        // Check for exit point.
        station = this.get_station(1);
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
      if (1 == 1) {
        // Start production!
        this.production.current[resource] = Date.now();
      }
    }
  }
  
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
  var borders = this.get_border_tiles();
  var x,
      y;
  for (var i in borders) {
    x = borders[i].x;
    y = borders[i].y;
    if (typeof GameApp.data.roads.items[x] !== "undefined" && typeof GameApp.data.roads.items[x][y] !== "undefined") {
      return GameApp.data.roads.items[x][y];
    }
  }
  
      
  return false;
}


/**
 * Get the tiles around the building.
 * @memberof Building
 * @name get_border_tiles
 * @instance
 * @method
 * @return {array}
 */
Building.prototype.get_border_tiles  = function () {
  var x1 = this.pos_x - 1;
  var y1 = this.pos_y - 1;
  var x2 = this.pos_x + this.width;
  var y2 = this.pos_y + this.height;
  var x,
      y;
  var ret = new Array();
  for (x = x1; x <= x2; x ++) {
    for (y = y1; y <= y2; y ++) {
      // Select center elements of the first and last row...
      // .. and first/last element of the other rows.
      if (((x == x1 || x == x2) && (y != y1 && y != y2)) ||
          ((y == y1 || y == y2) && (x > x1 && x < x2))) {
        //console.log(this.name + ": bordo "+x+":"+y+"");
        ret.push({x: x, y: y});
      }
    }
  }
  return ret;
}


/**
 * Store resource in the warehouse.
 * @memberof Building
 * @name get_border_tiles
 * @instance
 * @method
 * @param {object} resource - Resource object.
 * @return {array}
 */
Building.prototype.store  = function (resource) {
  
  //console.log(this.name + " riceveqwe " + resource.name);
  if (typeof this.warehouse[resource.type].amount === "undefined")
    this.warehouse[resource.type].amount = 0;
  // Store!
  this.warehouse[resource.type].amount ++;
  // Delete resource.
  resource.delete();
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
  var str = jQuery.i18n._('building-' + this.id);
  if (str == 'building-' + this.id)
    str = jQuery.i18n._(this.name);
  return str;
}


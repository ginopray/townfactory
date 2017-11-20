/**
 * Contains the Building class and Buildings namespace.
 * @file
 * @see Buildings
 * @see Building
 */


/**
 * Buildings functions.
 * @name Buildings
 * @namespace
 * @classdesc Buildings functions.
 */
var Buildings = {
  
  /**
   * Buildings loop.
   * @memberof Buildings
   * @name update
   * @method
   */
  update : function () {
    
    for (var b in GameApp.data.buildings) {
      // Buildings production.
      GameApp.data.buildings[b].produce();
      // Buildings consumption.
      GameApp.data.buildings[b].consume();
      // Village.
      if (GameApp.data.buildings[b].village) {
        // Check village level.
        GameApp.data.buildings[b].check_level();
      }
    }
    
  },
  
  
  /**
   * Get random building from the map.
   * @memberof Buildings
   * @name getRandom
   * @method
   * @param {number} value - The resource value to select.
   * @returns {object} The building.
   */
  getRandom : function () {
    
    // No building found: return false.
    if (GameApp.data.buildings.length == 0)
      return false;
    
    // Select random building.
    var rand_i = Math.floor(Math.random() * GameApp.data.buildings.length);
    
    // Return building.
    return GameApp.data.buildings[rand_i];
  },
  
}



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
 * @property {object} consumption - Consumption data.
 * @property {number} consumption.resources - Array of resources it want consume.
 * @property {number} consumption.current - Array of current consumption.
 * @property {bool} power_switch - Production active or not.
 * @property {array}  icons - Array of variables about icons.
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
  
  // Init icons.
  this.icons = new Array();
  
  // Set level.
  this.level = 1;
  
  // Get the production.
  this.production = Production.get(type);
  
  // Get the consumption.
  this.consumption = {}
  this.consumption.current = [];
  this.consumption.resources = Production.get_consumption(type);

  
};


/**
 * Select a building.
 * @memberof Building
 * @name select
 * @instance
 * @method
 */
Building.prototype.select  = function () {
  
  this.deselect();
  
  // Set current selection.
  GameApp.data.selection.building = this;
  // Set selection sprite.
  var width = this.width * Map.settings.tileWidth;
  var height = this.height * Map.settings.tileHeight;
  var sprite = phaser_object.groups.layers.icons.create(this.sprite.x, this.sprite.y, 'selection');  
  sprite.anchor.setTo(0.5, 0.5);
  sprite.width = width;
  sprite.height = height;
  sprite.tint = 0x861b1e;
  // Set global var.
  phaser_object.sprites.selection = sprite;
}


/**
 * Deselect a building.
 * @memberof Building
 * @name deselect
 * @instance
 * @method
 */
Building.prototype.deselect  = function () {
  // Cancel selection.
  if (typeof GameApp.data.selection.building !== "undefined") {
    delete GameApp.data.selection.building;
  }
  // Cancel selection sprite.
  if (typeof phaser_object.sprites.selection !== "undefined") {
    phaser_object.sprites.selection.destroy();  
    delete phaser_object.sprites.selection;
  }
}


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
  var tile = Map.get_tile({x: this.pos_x, y: this.pos_y, w: width, h: height});
  
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
  this.sprite.events.onInputDown.add(function(){
    this.select();
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
      requires,
      production_time;
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
          // Remove missing station icon.
          this.del_icon(2);
          
          // Check if station is free.
          if (Roads.check_free_station(station)) {
            
            // PRODUCE!
            // Clear current production.
            delete this.production.current[resource];
            // Create the resource!
            Resources.create(resource, this, station);
            
          } else {
            //console.log("stazione piena");
            can_start = false;
          }
        // Missing outcoming station!
        } else {
          this.add_icon(2);
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
      if (Production.can_produce(this, requires)) {
        // Start production!
        this.production.current[resource] = Date.now();
      }
    }
  }
  
}


/**
 * Consume resources (called by update loop).
 * @memberof Building
 * @name consume
 * @instance
 * @method
 */
Building.prototype.consume  = function () {
  // Is building active?
  if (this.power_switch == 0)
    return;
  
  var resource,
      current,
      can_start,
      consumption_time;
  // What can produce?
  for (var r in this.consumption.resources) {
    resource = this.consumption.resources[r].resource;
    consumption_time = this.consumption.resources[r].time / this.level;
    current = this.consumption.current[resource];
    can_start = true;
    //console.log(this.name, [resource, consumption_time, current])
    // Is producing?
    if (typeof current !== "undefined") {
      // Consumption done!
      if ((Date.now() - current) / 1000 > consumption_time) {
        //console.log("Done resource: " + resource + "!");      

        // EAT!
        // Clear current consumption.
        delete this.consumption.current[resource];
        
      // Consuming...
      } else {
        //console.log("Producing " + resource + "...");
        can_start = false;
      }
    // Dont eat at start.
    } else  {
      this.consumption.current[resource] = Date.now();
      can_start = false;
    }
    // Can start producing something?
    if (can_start) {
      //console.log("Can produce: " + resource + "?");
      
      // Check for needed resources.
      if (1) {
        // Start consumption!
        this.consumption.current[resource] = Date.now();
        console.log("GNAM!");
        if (!this.gather(resource, 1)) {
          console.log("hungry!");
          this.add_icon(3, {resources: [resource]});
        } else {
          this.del_icon(3);
        }
      }
    }
  }
  
}


/**
 * Add icon to building. It will be rendered by Icons class.
 * @memberof Building
 * @name add_icon
 * @instance
 * @method
 * @see Icons
 */
Building.prototype.add_icon  = function (icon_type, vars) {
  if (typeof this.icons[icon_type] === "undefined") {
    if (typeof vars === "undefined")
      vars = {};
    this.icons[icon_type] = vars;
    
  }
}


/**
 * Remove icon from building.
 * @memberof Building
 * @name del_icon
 * @instance
 * @method
 */
Building.prototype.del_icon  = function (icon_type) {
  if (typeof this.icons[icon_type] !== "undefined")
    this.icons.splice(icon_type, 1);
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
       GameApp.data.roads.items[x][y].subclass == "station" &&
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
  
  if (typeof this.warehouse[resource] === "undefined" || typeof this.warehouse[resource] === "undefined")
    return;
  
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
 * @augments Building
 * @see Building
 * @property {number} village - always 1.
 * @property {number} capital - 1 if capital, 0 if not.
 * @property {array} request - The resources required by the village.
 */
var Village = function (type, pos_x, pos_y) {
  // Call the parent constructor.
  Building.call(this, type, pos_x, pos_y);
  
  // Set village property.
  this.village = 1;
  
  // Is the capital?
  this.capital = 1;
  //Save game capital.
  if (this.capital == 1) {
    GameApp.capital = this;
  }
  
  // Ger required resources.
  this.request = new Array;
  this.new_request();
  
  // Store some resource.
  this.store(3, 100);
  this.store(6, 100);

  
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
  
  var resource = Resources.getRandom({value: {value: this.level, operator: '>'}});
  
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


/**
 * Calculate and set the level of the village.
 * @memberof Village
 * @name check_level
 * @instance
 * @method
 */
Village.prototype.check_level = function () {
  var bread = this.warehouse[4].amount;
  
  // Calculate level.
  if (typeof bread === "undefined" ||
      bread == 0) {
    var new_level = 1;
  } else {
    var new_level = Math.floor(Math.log(bread) / Math.log(2));
  }
  
  // Set level!
  if (new_level == 0)
    new_level = 1;
  this.level = new_level;
  
  // Create at least N citizens, for N = village level.
  var add = new Array();
  var citizen_length = Math.floor(GameApp.data.characters.citizen.length);
  for (var c = citizen_length; c < new_level; c ++) {
    GameApp.data.characters.citizen.push( new Citizen(1, this) );
  }
  
}




/**
 * Contains Roads namespace and Road class.
 * @file
 * @see Roads
 * @see Road
 */

/**
 * Roads functions.
 * @name Roads
 * @namespace
 * @classdesc Roads functions.
 */
var Roads = {
  
  /**
   * People settings.
   * @memberof Roads
   * @name settings
   * @type {object}
   * @property {object} road - Road settings.
   * @property {object} road.base - Default road settings.
   * @property {number} road.base.speed - Default road speed.
   * @property {number} road.base.width - Default road width.
   * @property {number} road.base.height - Default road height.
   * @property {number} road.subclass.property - Each subclass can override any property.
   * @property {object} characters.citizen - Citizens settings.
   * @property {number} characters.citizen.speed - Citizen speed.
   * @property {number} characters.citizen.working_time - Working time.
   * @property {number} characters.citizen.sleeping_time - Sleeping time.
   * @property {number} characters.citizen.efficiency - How much a citizen reduces the working time, in %.
   */
  settings : {
    road: {
      base: {
        speed: 80,
        width: 1,
        height: 1,
      },
      station: {
      },
      subway: {
        width: 3,
      },
    }
  },
  
  
  /**
   * Init Roads.
   * @memberof Roads
   * @name init
   * @method
   */
  /*init : function () {
  },*/
  
  
  /**
   * Build a road.
   * @memberof Roads
   * @name build
   * @method
   * @param {object} tile - Selected tile.
   */
  build : function (tile) {
    
    // There is another active action.
    if (GameApp.data.action.locked === true) {
      return;
    }
        
    var item = "road";
    var type = GameApp.data.action.data.type;
    // Default settings.
    //var settings = {};
    //Object.assign(settings, Roads.settings.road.base);
    
    // Is a subclass?
    if (typeof GameApp.data.action.subclass !== "undefined") {
      item = GameApp.data.action.subclass;
      // Subclass settings.
      /*for (var d in Roads.settings.road[item]) {
        settings[d] = Roads.settings.road[item][d];
      }*/
    }

    
    // Find tiles to check by helper.
    var slots = Map.get_item_tiles(phaser_object.helper);
        
    // Check build station.
    if (item == "station") {
      // Check for right position and get input-output.
      var in_out = Roads.check_build_station(tile, GameApp.data.action.data.direction);
      if (in_out === false) {
        return;
      }
    }
    
    GameApp.data.action.locked = true;
    
    var to_append = new Array();
    
    // Get new "group of road" id.
    var group_id = ++ GameApp.data.indexes.roads_groups;
    
    // Create element for each tile occupied by the road.
    for (var s in slots) {
      /*if (slots[s].x == tile.x && slots[s].y == tile.y)
        continue;*/            
      
      // Create station...
      if (item == "station") {    
        var road = new Station(type, slots[s].x, slots[s].y, GameApp.data.action.data.direction, in_out);

      // Create station...
      } else if (item == "subway") {
        
        // First and last tile: set in_out.
        // In tile.
        if (
          (s == 0 && (GameApp.data.action.data.direction == "right" || GameApp.data.action.data.direction == "down")) ||
          (s == slots.length - 1 && (GameApp.data.action.data.direction == "left" || GameApp.data.action.data.direction == "up"))
        ) {
          var road = new Subway(type, slots[s].x, slots[s].y, GameApp.data.action.data.direction, 1);
        // Out tile.
        } else if (
          (s == slots.length - 1 && (GameApp.data.action.data.direction == "right" || GameApp.data.action.data.direction == "down")) ||
          (s == 0 && (GameApp.data.action.data.direction == "left" || GameApp.data.action.data.direction == "up"))
        ) {
          var road = new Subway(type, slots[s].x, slots[s].y, GameApp.data.action.data.direction, 0);
        // Central tile.
        } else {
          var road = new Subway(type, slots[s].x, slots[s].y, GameApp.data.action.data.direction);
        }

      // Create a regular road.
      } else {
        var road = new Road(type, slots[s].x, slots[s].y, GameApp.data.action.data.direction);
      }
      
      // Set the id of the group.
      road.group_id = group_id;
            
      // Check free slot.
      if (!Map.check_free_slot(slots[s].x, slots[s].y, road)) {
        GameApp.data.action.locked = false;
        return;
      }
      
      // Prepare array.
      to_append.push({
        x: slots[s].x,
        y: slots[s].y,
        road: road
      });
    
    }
    
    // Check resources.
    var requires = Production.get_item_costs(item, type);
    if (!Production.can_produce(GameApp.capital, requires)) {
      //console.log("non hai le risorse!", GameApp.capital, requires);
      return;
    }
    
    // Create roads!
    for (var i in to_append) {
      var r = to_append[i];
      // Append road to GameApp.data.roads.
      /*if (typeof GameApp.data.roads[r.x] === "undefined")
        GameApp.data.roads[r.x] = new Array();
      GameApp.data.roads[r.x][r.y] = r.road;*/
      
      GameApp.data.roads.push(r.road);
      
      // Spawn!
      r.road.spawn();
    }
    
    GameApp.data.action.locked = false;
    
  },
  
  
  /**
   * Return object by Roads.tool_init().
   * @memberof Roads
   * @name ToolData
   * @typedef {object} ToolData
   * @property {number} type The road type
   * @property {string} direction - up/down/left/right
   * @see Roads.tool_init
   */
  
  /**
   * Initialize "road" tool.
   * @memberof Roads
   * @name tool_init
   * @method
   * @return {Roads.ToolData} Tool data set.
   * @todo road types.
   */
  tool_init : function () {
    var ret = {
      type: 1,
      direction: Actions.tools.road.directions[0],
    };
    // Default settings.
    Object.assign(ret, Actions.tools.road);
    
    // Subclass.
    if (typeof GameApp.data.action.subclass !== "undefined") {
      ret.subclass = GameApp.data.action.subclass;
      Object.assign(ret, Actions.tools[ret.subclass]);
    }

    return ret;
  },
  
  
  /**
   * Manage mouse wheel.
   * @memberof Roads
   * @name wheel
   * @method
   * @param {object} e - Mouse event object.
   */
  wheel : function (e) {
    var current_direction = GameApp.data.action.data.direction;
    var current_direction_index = Actions.tools.road.directions.indexOf(current_direction);
    // Wheel down
    if (e.wheelDelta < 0) {
      //console.log("down");
      // Rotate clockwise.
      current_direction_index ++;
    // Wheel up
    } else if (e.wheelDelta > 0) {
      // console.log("up");
      // Rotate counterclockwise.
      current_direction_index --;
    }
    // Reset if reach limit.
    if (current_direction_index < 0)
      current_direction_index = Actions.tools.road.directions.length - 1;
    else if (current_direction_index > Actions.tools.road.directions.length - 1)
      current_direction_index = 0;
    
    Roads.tool_rotate(current_direction_index);
    
  },
  
  
  /**
   * Manage keyPress.
   * @memberof Roads
   * @name keyPress
   * @method
   * @param {string} k - The pressed key (lowercase).
   */
  keyPress : function (k) {
    //console.log("ROAD KEY: " + k);
    // Road tool rotate.
    if (k == "w")
      Roads.tool_rotate(3);
    else if (k == "d")
      Roads.tool_rotate(0);
    else if (k == "s")
      Roads.tool_rotate(1);
    else if (k == "a")
      Roads.tool_rotate(2);
  },
  
  
  /**
   * Rotate direction while building road.
   * @memberof Roads
   * @name tool_rotate
   * @method
   * @param {boolean} clockwise - Clockwise rotation or not.
   */
  tool_rotate : function (direction_index) {
    // Set new direction.
    var new_direction = Actions.tools.road.directions[direction_index];
    Actions.tool_configure({
      direction: new_direction
    });
    
    // Rotate helper sprite.
    phaser_object.helper.angle = Actions.tools.road.dir_angles[direction_index];
  },
  
  
  
  /**
   * Move item along the road.
   * @memberof Roads
   * @name flow
   * @method
   * @param {object} road - Road sprite.
   * @param {object} item - Sprite to move.
   */
  flow : function (item, road) {
    
    // Set current overlapping road.
    item.custom_road = road;
    
    // Set the ground!
    if (road.custom_downstair == 1)
      item.custom_ground = road.custom_ground - 1;
    else
      item.custom_ground = road.custom_ground;
        
    var speed = road.custom_speed;
    var pad = 2;
    var angle = road.angle;
        
    // Check precedence.
    if (Roads.check_precedence(item, road)) {
      
      // Move item toward the center of the road.
      // Left-right.
      if (road.angle == 0 || Math.abs(road.angle) == 180) {
        if (item.centerY < road.centerY - pad) {
          angle = 90;
        } else if (item.centerY > (road.centerY + pad)) {
          angle = -90;
        }
        //item.centerY = road.centerY;

      // Up-Down.
      } else {
        if (item.centerX < road.centerX - pad) {
          angle = 0;
        } else if (item.centerX > (road.centerX + pad)) {
          angle = 180;
        }
        //item.centerX = road.centerX;

      }

      // Set angle and speed.
      game.physics.arcade.velocityFromAngle(angle, speed, item.body.velocity);
    } else {
      // Stop resource!
      Roads.stop(item);
    }
  },
  
  
  /**
   * Stop item.
   * @memberof Roads
   * @name stop
   * @instance
   * @method
   * @param {object} sprite - The sprite to stop.
   */
  stop : function (sprite) {
    sprite.body.velocity.x = 0;
    sprite.body.velocity.y = 0;
  },
  
  
  /**
   * Check if item has precedence on other overlapping items.
   * @memberof Roads
   * @name check_precedence
   * @instance
   * @method
   * @param {object} item - The sprite to check.
   * @param {object} road - The road.
   */
  check_precedence : function (item, road) {
    var over_item;
    for (var p in item.custom_overlap) {
      over_item = item.custom_overlap[p];
      // if other item haven't assigned road: skip.
      if (typeof over_item.custom_road === "undefined")
        continue;
      // If the other item come from another direction...
      if (item.custom_road.angle != over_item.custom_road.angle) {
        // If opposite direction, stop!
        if (Roads.check_opposite(over_item.custom_road, item.custom_road)) {
          return false;
        // If toward this road: item always have precedence.
        } else if (Roads.check_toward(over_item.custom_road, item.custom_road)) {
          return true;
        }
      }
      
      // Right;
      if (road.angle == 0) {
        if (item.x < over_item.x)
          return false;
        // Facing: precedence to the right.
        else if (item.x == over_item.x && item.custom_road.custom_id == over_item.custom_road.custom_id) {
          if (item.y < over_item.y)
            return false;
        }
      // Down.
      } else if (road.angle == 90) {
        if (item.y < over_item.y)
          return false;
        // Facing: precedence to the right.
        else if (item.y == over_item.y && item.custom_road.custom_id == over_item.custom_road.custom_id) {
          if (item.x > over_item.x)
            return false;
        }
      // Left.
      } else if (Math.abs(road.angle) == 180) {
        if (item.x > over_item.x)
          return false;
        // Facing: precedence to the right.
        else if (item.x == over_item.x && item.custom_road.custom_id == over_item.custom_road.custom_id) {
          if (item.y > over_item.y)
            return false;
        }
      // Up.
      } else if (road.angle == -90 || road.angle == 270) {
        if (item.y > over_item.y)
          return false;
        // Facing: precedence to the right.
        else if (item.y == over_item.y && item.custom_road.custom_id == over_item.custom_road.custom_id) {
          if (item.x < over_item.x)
            return false;
        }
      }
    }
    return true;
  },
  
  
  /**
   * Check if "road 1" leads towards "sprite 2".
   * @memberof Roads
   * @name check_toward
   * @instance
   * @method
   * @param {object} r1 - Road 1.
   * @param {object} r2 - Sprite 2.
   * @return {boolean} true if r1 leads towards r2.
   */
  check_toward : function (r1, r2) {
    // Right;
    if (r1.angle == 0) {
      if (r1.y == r2.y && r1.x < r2.x)
        return true;
    // Down.
    } else if (r1.angle == 90) {
      if (r1.x == r2.x && r1.y < r2.y)
        return true;
    // Left.
    } else if (Math.abs(r1.angle) == 180) {
      if (r1.y == r2.y && r1.x > r2.x)
        return true;
    // Up.
    } else if (r1.angle == -90 || r1.angle == 270) {
      if (r1.x == r2.x && r1.y > r2.y)
        return true;
    }
    return false;
  },
  
  
  /**
   * Check if 2 sprite have opposite direction.
   * @memberof Roads
   * @name check_opposite
   * @instance
   * @method
   * @param {object} r1 - Road 1.
   * @param {object} r2 - Road 2.
   * @return {boolean}
   */
  check_opposite : function (r1, r2) {
    // Right-Left
    if ((r1.angle == 0 && Math.abs(r2.angle) == 180) ||
       (r2.angle == 0 && Math.abs(r1.angle) == 180)) {
      return true;
    // Down-Up.
    } else if ((r1.angle == 90 && (r2.angle == -90 || r2.angle == 270)) ||
              (r2.angle == 90 && (r1.angle == -90 || r1.angle == 270))) {
      return true;
    }
    return false;
  },


  /**
   * Check if the station is occupied by a resource.
   * @memberof Roads
   * @name check_free_station
   * @instance
   * @method
   * @param {object} station - The station.
   * @return {boolean} true if the station is free.
   */
  check_free_station : function (station) {
    var resource;
    var bounds;
    // Search resources in this station.
    for (var r in GameApp.data.resources) {
      resource = GameApp.data.resources[r];
      if (typeof resource.sprite === "undefined" || 
          typeof resource.sprite.custom_road === "undefined" ||
          resource.sprite.custom_road.custom_id != station.id)
        continue;
      // Check overlap.
      // Don't use getBounds(), because it's relative to visible area, not world.
      //bounds = resource.sprite.getBounds();
      bounds = new Phaser.Rectangle(resource.sprite.x - resource.sprite.offsetX, resource.sprite.y - resource.sprite.offsetY, resource.sprite.width, resource.sprite.height);
      
      if (bounds.contains(station.sprite.x, station.sprite.y))
        return false;
    }
    return true;
  },
  
  
  /**
   * Can a station be created here?
   * @memberof Roads
   * @name check_build_station
   * @instance
   * @method
   * @param {object} tile - The tile.
   * @return {number|false} 1 = in, 0 = out, false: cant build.
   */
  check_build_station : function (tile, direction) {
    var x,
        y,
        b,
        buildings = new Array();
    // Get tile borders.
    var borders = Map.get_border_tiles(tile);
    // Find building around the tile.
    for (var i in borders) {
      x = borders[i].x;
      y = borders[i].y;
      b = Map.find_by_pos(x, y, 'buildings');
      if (b !== false) {
        buildings.push({
          x: x,
          y: y
        });
      }
    }
    
    // If the station is among more than 1 buildings: is always OUTCOMING!
    if (buildings.length > 1) {
      return 0;
    // Calcolate incoming/outcoming by building position.
    } else if (buildings.length == 1) {
      var in_out;
      // Set angle and custom_pos.
      var direction_index = Actions.tools.road.directions.indexOf(direction);
      tile.angle = Actions.tools.road.dir_angles[direction_index];
      // If road direction is towards the building: is INCOMING.
      if (Roads.check_toward(tile, buildings[0]))
        in_out = 1;
      else
        in_out = 0
      return in_out;
    }
    
    return false;
  },
  
};




/**
 * Road class.
 * @name Road
 * @class
 * @classdesc Create a road instance.
 * @param {number} type - The road type.
 * @param {number} pos_x - x (tile) position.
 * @param {number} pos_y - y (tile) position.
 * @param {string} direction - up/down/left/right.
 * @property {object} sprite - Phaser.io sprite object.
 * @property {number} type The road type.
 * @property {number} pos_x - x (tile) position.
 * @property {number} pos_y - y (tile) position.
 * @property {string} direction - up/down/left/right.
 * @property {number} ground - ground level. Default = 0
 */
var Road = function (type, pos_x, pos_y, direction) {
  
  if (typeof type === "undefined")
    return;
  
  // Default settings.
  this.set_defaults(Roads.settings.road.base);
  
  // Set item ID.
  this.id = ++ GameApp.data.indexes.roads;
  // Type.
  this.type = type;
  // Position (in tiles).
  this.pos_x = pos_x;
  this.pos_y = pos_y;
  // Direction.
  this.direction = direction;
  // Ground.
  this.ground = 0;
  
};


/**
 * Add the road sprite to the map.
 * @memberof Road
 * @name spawn
 * @instance
 * @method
 */
Road.prototype.spawn = function () {
  
  var img;
  // Road image.
  if (typeof this.subclass !== "undefined") {
    img = this.subclass;
    
  } else {
    img = "road";
  }
  
  if (typeof this.in_out !== "undefined") {
    img += '-' + this.in_out;
  }
  
  // Get the tile coordinates.
  var tile = Map.get_tile({x: this.pos_x, y: this.pos_y, w: Map.settings.tileWidth, h: Map.settings.tileHeight});
  
  // Create sprite and add it to "roads" group.
  this.sprite = phaser_object.groups.roads.create(tile.x, tile.y, img);
  
  // Save item id on the sprite.
  this.sprite.custom_id = this.id;
  // Save group_id
  this.sprite.custom_group_id = this.group_id;
  // Save map (tile) coordinates.
  this.sprite.custom_pos_x = this.pos_x;
  this.sprite.custom_pos_y = this.pos_y;
  // Save speed.
  this.sprite.custom_speed = this.speed;
  // Save ground.
  this.sprite.custom_ground = this.ground;
  // Save in_out.
  this.sprite.custom_in_out = this.in_out;
  this.sprite.custom_downstair = this.downstair;
  
  // Set direction angle.
  var direction_index = Actions.tools.road.directions.indexOf(this.direction);
  this.sprite.angle = Actions.tools.road.dir_angles[direction_index];
  
  // Center anchor.
  this.sprite.anchor.setTo(0.5, 0.5);
  
  // Setting the size.
  this.sprite.width = Map.settings.tileWidth;// * this.width;
  this.sprite.height = Map.settings.tileHeight;// * this.height;
  // Position.
  //this.sprite.top = tile.top;
  //this.sprite.left = tile.left;
  this.sprite.centerX = tile.centerX;
  this.sprite.centerY = tile.centerY;
  this.sprite.z = this.ground;
  
  // Physics.
  game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.checkCollision.up = false;
  this.sprite.body.checkCollision.down = false;
  this.sprite.body.checkCollision.left = false;
  this.sprite.body.checkCollision.right = false;
  this.sprite.body.immovable = true;
  
  // Subway!
  if (this.ground < 0) {
    this.sprite.alpha = 0.2;
  }
  
}


/**
 * Remove road.
 * @memberof Road
 * @name remove
 * @instance
 * @method
 */
Road.prototype.remove = function () {
  var gid = this.group_id;
  var torem = new Array();
  // Search all the roads of the group.
  for (var i in GameApp.data.roads) {
    if (GameApp.data.roads[i].group_id == gid) {
      // Save the ID of the roads to remove.
      torem.push(GameApp.data.roads[i].id);
    } 
  }
  // For each id to remove...
  for (var tr in torem) {
    var id = torem[tr];
    // ...find it on the roads array.
    for (var i in GameApp.data.roads) {
      if (GameApp.data.roads[i].id == id) {
        // Remove sprite.
        if (GameApp.data.roads[i].sprite)
          GameApp.data.roads[i].sprite.destroy();
        // Remove element.
        GameApp.data.roads.splice(i, 1);
      }
    }
  }
  
}


/**
 * Set defaults.
 * @memberof Road
 * @name set_defaults
 * @instance
 * @method
 */
Road.prototype.set_defaults = function (settings) {

  Object.assign(this, settings);

}


/**
 * Station class (children of Road).
 * @name Station
 * @class
 * @classdesc Create an input/output station.
 * @augments Road
 * @see Road
 * @property {string} subclass - Subclass name = "station".
 * @param {number} in_out - In or Out station. 1 = In, 0 = Out.
 * @property {number} in_out - In or Out station. 1 = In, 0 = Out.
 */
var Station = function (type, pos_x, pos_y, direction, in_out) {
  // Call the parent constructor.
  Road.call(this, type, pos_x, pos_y, direction);
  
  // Define road as station.
  this.subclass = "station";
  
  // Input or output.
  this.in_out = in_out;
  
  // Station settings.
  this.set_defaults(Roads.settings.road[this.subclass]);
  
}
// Inherit Road
Station.prototype = new Road();
Station.prototype.constructor = Station;





/**
 * Subway class (children of Road).
 * @name Subway
 * @class
 * @classdesc Create a subway.
 * @augments Road
 * @see Road
 * @property {string} subclass - Subclass name = "subway".
 * @param {number|undefined} in_out - In or Out tile. 1 = In, 0 = Out.
 * @property {number|undefined} in_out - In or Out tile. 1 = In, 0 = Out.
 */
var Subway = function (type, pos_x, pos_y, direction, in_out) {
  // Call the parent constructor.
  Road.call(this, type, pos_x, pos_y, direction);
  
  // Define road as station.
  this.subclass = "subway";
  
  // Subway settings.
  this.set_defaults(Roads.settings.road[this.subclass]);
  
  // Input or output.
  if (typeof in_out !== "undefined") {
    this.in_out = in_out;
    
    if (in_out == 1)
      this.downstair = 1;
    else if (in_out == 0)
      this.upstair = 1;
    
  // Regular subway tile: ground = -1.
  } else {
    this.ground = -1;
  }
  
  
}
// Inherit Road
Subway.prototype = new Road();
Subway.prototype.constructor = Subway;
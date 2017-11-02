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
    
    // Check for free space.
    if (!Map.check_free_slot(tile.x, tile.y)) {
      return;
    }
    
    GameApp.data.action.locked = true;
    
    // Create game object...
    var road = new Road(GameApp.data.action.data.type, tile.x, tile.y, GameApp.data.action.data.direction);
    // ...and append it to GameApp.data.roads.
    if (typeof GameApp.data.roads.items[tile.x] === "undefined")
      GameApp.data.roads.items[tile.x] = new Array();
    GameApp.data.roads.items[tile.x][tile.y] = road;
    // Spawn!
    road.spawn();
    
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
    return {
      type: 1,
      direction: Actions.tools.road.directions[0]
    };
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
    
    //console.log('angle: ' + road.angle + ', muovo: ' + item.key, {road: road, item: item});
    var speed = 100;
    var pad = 10;
    var angle = road.angle;
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
    
    // Check precedence.
    if (Roads.check_precedence(item, road)) {
      // Set angle and speed.
      game.physics.arcade.velocityFromAngle(angle, speed, item.body.velocity);
    }
  },
  
  
  /**
   * Check if item has precedence on other overlapping items.
   * @memberof Roads
   * @name check_precedence
   * @instance
   * @method
   * @param {object} sprite - The sprite to check.
   */
  check_precedence : function (item, road) {
    var over_item;
    for (var p in item.custom_overlap) {
      over_item = item.custom_overlap[p];
      // if other item haven't assigned road: skip.
      if (typeof over_item.custom_road === "undefined")
        continue;
      // If the other item came from another direction...
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
      // Down.
      } else if (road.angle == 90) {
        if (item.y < over_item.y)
          return false;
      // Left.
      } else if (Math.abs(road.angle) == 180) {
        if (item.x > over_item.x)
          return false;
      // Up.
      } else if (road.angle == -90 || road.angle == 270) {
        if (item.y > over_item.y)
          return false;
      }
    }
    return true;
  },
  
  
  /**
   * Check if "road 1" leads towards "road 2".
   * @memberof Roads
   * @name check_toward
   * @instance
   * @method
   * @param {object} r1 - Road 1.
   * @param {object} r2 - Road 2.
   * @return {boolean} true if r1 leads towards r2.
   */
  check_toward : function (r1, r2) {
    // Right;
    if (r1.angle == 0) {
      if (r1.custom_pos_y == r2.custom_pos_y && r1.custom_pos_x < r2.custom_pos_x)
        return true;
    // Down.
    } else if (r1.angle == 90) {
      if (r1.custom_pos_x == r2.custom_pos_x && r1.custom_pos_y < r2.custom_pos_y)
        return true;
    // Left.
    } else if (Math.abs(r1.angle) == 180) {
      if (r1.custom_pos_y == r2.custom_pos_y && r1.custom_pos_x > r2.custom_pos_x)
        return true;
    // Up.
    } else if (r1.angle == -90 || r1.angle == 270) {
      if (r1.custom_pos_x == r2.custom_pos_x && r1.custom_pos_y > r2.custom_pos_y)
        return true;
    }
    return false;
  },
  
  
  /**
   * Check if 2 roads have opposite direction.
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
   * Check if "road 1" leads towards "road 2".
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
      bounds = resource.sprite.getBounds();
      
      if (bounds.contains(station.sprite.x, station.sprite.y))
        return false;
    }
    return true;
  }
  
  
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
 */
var Road = function (type, pos_x, pos_y, direction) {
  
  // Set item ID.
  this.id = ++ GameApp.data.indexes.roads;
  this.type = type;
  this.pos_x = pos_x;
  this.pos_y = pos_y;
  this.direction = direction;
  
};


/**
 * Add the road sprite to the map.
 * @memberof Road
 * @name spawn
 * @instance
 * @method
 */
Road.prototype.spawn  = function () {
  
  // Get the tile coordinates.
  var tile = Map.get_tile({x: this.pos_x, y: this.pos_y, w: Map.settings.tileWidth, h: Map.settings.tileHeight}, 'rgba(244, 67, 54, .5)');
  
  // Create sprite and add it to "buildings" group.
  this.sprite = phaser_object.groups.roads.create(tile.x, tile.y, 'road');
  
  // Save item id on the sprite.
  this.sprite.custom_id = this.id;
  // Save map (tile) coordinates.
  this.sprite.custom_pos_x = this.pos_x;
  this.sprite.custom_pos_y = this.pos_y;
  
  // Physics.
  game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.checkCollision.up = false;
  this.sprite.body.checkCollision.down = false;
  this.sprite.body.checkCollision.left = false;
  this.sprite.body.checkCollision.right = false;
  this.sprite.body.immovable = true;
  
  // Center anchor.
  this.sprite.anchor.setTo(0.5, 0.5);
  
  // Setting the size.
  this.sprite.width = Map.settings.tileWidth;
  this.sprite.height = Map.settings.tileHeight;
  this.sprite.top = tile.top;
  this.sprite.left = tile.left;
  
  // Set direction angle.
  var direction_index = Actions.tools.road.directions.indexOf(this.direction);
  this.sprite.angle = Actions.tools.road.dir_angles[direction_index];
  
}


/**
 * Remove road.
 * @memberof Road
 * @name remove
 * @instance
 * @method
 */
Road.prototype.remove  = function () {
  //console.log("REMOVE ROAD!", this);
  if (typeof GameApp.data.roads.items[this.pos_x] === "undefined" ||
      typeof GameApp.data.roads.items[this.pos_x][this.pos_y] === "undefined")
    return;
  
  // Remove sprite.
  this.sprite.destroy();
  // Remove element from game.
  delete GameApp.data.roads.items[this.pos_x][this.pos_y];
  
}



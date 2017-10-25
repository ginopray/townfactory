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
    //$('#log').text('build a road on ['+tile.x+':'+tile.y+'], dir: ' + GameApp.data.action.data.direction);
    
    // Check for free space.
    if (!Map.check_free_slot(tile.x, tile.y)) {
      console.log("QUI NO!");
      return;
    }
    
    // Create game object...
    var road = new Road(GameApp.data.action.data.type, tile.x, tile.y, GameApp.data.action.data.direction);
    // ...and append it to GameApp.data.roads.
    if (typeof GameApp.data.roads.items[tile.x] === "undefined")
      GameApp.data.roads.items[tile.x] = new Array();
    GameApp.data.roads.items[tile.x][tile.y] = road;
    // Spawn!
    road.spawn();
    
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
    
    // Set new direction.
    var new_direction = Actions.tools.road.directions[current_direction_index];
    Actions.tool_configure({
      direction: new_direction
    });
    
    // Rotate helper sprite.
    phaser_object.helper.angle = Actions.tools.road.dir_angles[current_direction_index];
    
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
 */
var Road = function (type, pos_x, pos_y, direction) {
  
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
  this.sprite = phaser_object.groups.buildings.create(tile.x, tile.y, 'road');
  
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


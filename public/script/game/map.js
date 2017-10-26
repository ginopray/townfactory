/**
 * Contains the Map class.
 * @file
 * @see Map
 */

/**
 * Map class.
 * @name Map
 * @namespace
 * @classdesc Map class.
 */
var Map = {
  
  /**
   * Map settings object.
   * @memberof Map
   * @name settings
   * @type {object}
   * @property {number} gameWidth - Width (px) of canvas.
   * @property {number} gameHeight - Height (px) of canvas.
   * @property {number} tileWidth - The tile width in px.
   * @property {number} tileHeight - The tile height in px.
   * @property {number} helperWidth - The helper sprite width in px.
   * @property {number} helperHeight - The helper sprite height in px.
   * @property {number} resourceWidth - The resource width in px.
   * @property {number} resourceHeight - The resource height in px.
   * @property {number} friction - The friction for things.
   * @property {number} friction_rate - The friction rate in ms.
   * @example var friction = Map.settings.friction;
   */
  settings : {
    gameWidth : 1024,
    gameHeight : 768,
    tileWidth : 48,
    tileHeight : 48,
    helperWidth : 48,
    helperHeight : 48,
    resourceWidth: 24,
    resourceHeight: 24,
    friction: 50,
    friction_rate: 50, // ms
  },

  
  /**
   * Initialize the map.
   * @memberof Map
   * @name init
   * @method   
   */
  init : function () {

    // Create the grid.
    Map.grid();
    
    // Create mouse tile selection rectangle.
    phaser_object.inputs.mouse.selection = {
      tile: new Phaser.Rectangle(
        0,
        0,
        Map.settings.tileWidth,
        Map.settings.tileHeight
      ),
      color: 'rgba(244, 67, 54, .3)'
    };
    
    
    // Set events:
    // Mouse down:
    game.input.onDown.add(function(pointer){
      Actions.click(pointer);
    }, this);
    
    // Mouse wheel.
    game.input.mouse.mouseWheelCallback = function(e){
      Actions.wheel(e);
    };
    
    // Initialize the keyboard.
    Map.set_keyboard();
    
    // Background color
    //game.stage.backgroundColor = "#424242";
    
    Map.get();
    
  },
  
  
  /**
   * Initialize the keyboard.
   * @memberof Map
   * @name set_keyboard
   * @method   
   */
  set_keyboard : function () {
    // Keyboard
    /*var upKey = game.input.keyboard.addKey(Phaser.Keyboard.UP);
    var downKey = game.input.keyboard.addKey(Phaser.Keyboard.DOWN);
    var leftKey = game.input.keyboard.addKey(Phaser.Keyboard.LEFT);
    var rightKey = game.input.keyboard.addKey(Phaser.Keyboard.RIGHT);
    */
    var keys = new Array();
    
    // W.
    keys.push( game.input.keyboard.addKey(Phaser.Keyboard.W) );
    keys.push( game.input.keyboard.addKey(Phaser.Keyboard.A) );
    keys.push( game.input.keyboard.addKey(Phaser.Keyboard.S) );
    keys.push( game.input.keyboard.addKey(Phaser.Keyboard.D) );
    
    for (var k in keys) {
      keys[k].onDown.add(function(e){
        Actions.keyPress(e);
      }, this);      
    }

  },
  
  
  /**
   * Get the map, based on data stored in "GameApp.data".
   * @memberof Map
   * @name get
   * @method   
   */
  get : function () {
    
    // Spawn buildings.
    for (var b in GameApp.data.buildings) {
      GameApp.data.buildings[b].spawn();
    }
    // Spawn resources.
    for (var r in GameApp.data.resources) {
      GameApp.data.resources[r].spawn();
    }
    
  },

  
  /**
  * Set the map grid. Attach tiles (rectangles) to phaser_object.grid.
  * @memberof Map
  * @name grid
  * @method
  */
  grid : function () {
    
    var x,
        y;
    /*for (x = 0; x < GameApp.data.map.width; x ++) {
      for (y = 0; y < GameApp.data.map.height; y ++) {
        // Add rectangle to grid.
        phaser_object.grid.push(
          { tile:new Phaser.Rectangle(
            x * Map.settings.tileWidth,
            y * Map.settings.tileHeight,
            Map.settings.tileWidth,
            Map.settings.tileHeight
            )
          }
        );
      }
    }*/

    var margin_right = GameApp.data.map.width * Map.settings.tileWidth;
    var margin_bottom = GameApp.data.map.height * Map.settings.tileHeight;
    for (x = 1; x < GameApp.data.map.width; x ++) {
      phaser_object.grid.push({
        tile: new Phaser.Line(x * Map.settings.tileWidth, 0, x * Map.settings.tileWidth, margin_bottom)
      });
    }
    for (y = 1; y < GameApp.data.map.height; y ++) {
      phaser_object.grid.push({
        tile: new Phaser.Line(0, y * Map.settings.tileHeight, margin_right, y * Map.settings.tileHeight)
      });
    }    
    
  },
  
  
  /**
  * Simulate friction: decelerate things on the map.
  * Sets a timeout based on Map.settings.friction_rate while sprite exists.
  * @memberof Map
  * @name friction
  * @method
  * @param {object} sprite - The sprite object.
  */
  friction : function (sprite) {
    if (typeof sprite === "undefined" || sprite === null || typeof sprite.body === "undefined" || sprite.body === null)
      return;
    var f = Map.settings.friction;
    var abs_x = Math.abs(sprite.body.velocity.x);
    var abs_y = Math.abs(sprite.body.velocity.y);
    if (abs_x > 0 || abs_y > 0) { 
      if (abs_x <= f)
        sprite.body.velocity.x = 0;
      else
        sprite.body.velocity.x -= f * (abs_x / sprite.body.velocity.x);
      if (abs_y <= f)
        sprite.body.velocity.y = 0;
      else
        sprite.body.velocity.y -= f * (abs_y / sprite.body.velocity.y);
    }
    setTimeout(function(){Map.friction(sprite)}, Map.settings.friction_rate);
  },
  
  
  /**
  * Get a tile (rectangle).
  * @memberof Map
  * @name get_tile
  * @method
  * @param {object} tile - x:y tile coordinates.
  * @param {string} color - html color.
  * @return {object} phaser rectangle.
  */
  get_tile : function (tile, color) {
    var rect = new Phaser.Rectangle(
      (tile.x - 1) * Map.settings.tileWidth,
      (tile.y - 1) * Map.settings.tileHeight,
      tile.w,
      tile.h
    );
    //phaser_object.grid.push({tile: rect, color: color});
    return rect;
  },
  
  
  /**
  * Get the tile coordinates from px coords.
  * @memberof Map
  * @name coord2tile
  * @method
  * @param {object} coords - x:y px coordinates.
  * @return {object} x:y tile coordinates.
  */
  coord2tile : function(coords) {
    return {
      x: Math.floor(coords.x / Map.settings.tileWidth),
      y: Math.floor(coords.y / Map.settings.tileHeight)
    }
  },
  
  
  /**
   * Check if a slot is free.
   * @memberof Map
   * @name check_free_slot
   * @method
   * @param {number} x - X position to find.
   * @param {number} y - Y position to find.
   * @return {boolean}
   */
  check_free_slot : function (x, y) {
    var find = Map.find(x, y);
    for (var type in find) {
      if (find[type] !== false) {
        return false;
      }
    }
    return true;
  },
  
  
  /**
   * Find a game object on the map.
   * @memberof Map
   * @name find
   * @method
   * @param {number} x - X position to find.
   * @param {number} y - Y position to find.
   * @param {string} what - Type of item to find, ie. "buildings". undefined = check all.
   * @return {object} Object containing items found.
   */
  find : function (x, y, what) {
    var all = (typeof what === "undefined"),
        ret = {};
    if (what == "buildings" || all) {
      ret.buildings = Map.find_building(x, y);
    }
    if (what == "roads" || all) {
      ret.roads = Map.find_road(x, y);
    }
    return ret;
  },

  
  /**
   * Find a building on the map.
   * @memberof Map
   * @name find_building
   * @method
   * @param {number} x - X position to find.
   * @param {number} y - Y position to find.
   * @return {object} The building.
   */
  find_building : function (x, y) {
    var building,
        cX, cY;
    for (var b in GameApp.data.buildings) {
      building = GameApp.data.buildings[b];
      // Check all size of the building.
      for (cX = building.pos_x; cX < building.pos_x + building.width; cX ++) {
        for (cY = building.pos_y; cY < building.pos_y + building.height; cY ++) {
          if (cX == x && cY == y) {
            return building;   
          }
        }
      }
    }
    return false;
  },
  
  
  /**
   * Find a road on the map.
   * @memberof Map
   * @name find_road
   * @method
   * @param {number} x - X position to find.
   * @param {number} y - Y position to find.
   * @return {object} The building.
   */
  find_road : function (x, y) {
    if (typeof GameApp.data.roads.items[x] === "undefined" || typeof GameApp.data.roads.items[x][y] === "undefined")
      return false;
    return GameApp.data.roads.items[x][y];
  },

};


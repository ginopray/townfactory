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
 * @property {object} settings - Map settings.
 * @property {number} settings.gameWidth - Width (px) of canvas.
 * @property {number} settings.gameHeight - Height (px) of canvas.
 * @property {number} settings.tileWidth - The tile width in px.
 * @property {number} settings.tileHeight - The tile height in px.
 * @property {number} settings.resourceWidth - The resource width in px.
 * @property {number} settings.resourceHeight - The resource height in px.
 * @property {number} settings.friction - The friction for things.
 * @property {number} settings.friction_rate - The friction rate in ms.
 */
var Map = {
  
  settings : {
    gameWidth : 1024,
    gameHeight : 768,
    tileWidth : 48,
    tileHeight : 48,
    resourceWidth: 24,
    resourceHeight: 24,
    friction: 50,
    friction_rate: 50, // ms
  },

  /**
   * Get the map, based on data stored in "GameApp.data".
   * @memberof Map
   * @name get
   * @method
   * @see GameApp
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
    
    // Create the grid.
    Map.grid();

    // Set events:
    // Mouse down:
    game.input.onDown.add(function(){
      var tile = phaser_object.inputs.mouse.selection.tile;
      var tile_pos_x = (phaser_object.inputs.mouse.selection.tile.x / Map.settings.tileWidth) + 1;
      var tile_pos_y = (phaser_object.inputs.mouse.selection.tile.y / Map.settings.tileHeight) + 1;
      $('#log').text('['+tile_pos_x+':'+tile_pos_y+']');
    }, this);
    
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
    var f = Map.settings.friction;
    var abs_x = Math.abs(sprite.body.velocity.x);
    var abs_y = Math.abs(sprite.body.velocity.y);
    if (typeof sprite === "undefined")
      return;
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
  * Simulate friction: decelerate things on the map.
  * Sets a timeout based on Map.settings.friction_rate while sprite exists.
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
  }

};


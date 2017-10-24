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
  }
};


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
 */
var Map = {
  
  settings : {
    gameWidth : 800,
    gameHeight : 600,
    tileWidth : 20,
    tileHeight : 20
  },

  /**
   * Get the map, based on data stored in "GameApp.data".
   * @memberof Map
   * @name get
   * @method
   * @returns boh
   * @see GameApp
   */
  get : function () {
    
    // Spawn buildings.
    for (var b in GameApp.data.buildings) {
      GameApp.data.buildings[b].spawn();
    }
    
  }

};


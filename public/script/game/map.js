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
   * Map configuration
   * @memberof Map
   * @name config
   * @constant
   */
   config : {},
  
  
  /**
   * Get the map, based on data stored in "GameApp.data".
   * @memberof Map
   * @name config
   * @method
   * @returns boh
   */
  get : function () {
    
    // Spawn buildings.
    for (var b in GameApp.data.buildings) {
      GameApp.data.buildings[b].spawn();
    }
    
  }

};


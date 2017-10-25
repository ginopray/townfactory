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
   * @memberof Board
   * @name build
   * @method
   * @param {object} tile - Selected tile.
   */
  build : function (tile) {
    $('#log').text('build a road on ['+tile.x+':'+tile.y+']');
  },
  
};




/**
 * Road class.
 * @name Road
 * @class
 * @classdesc Create a road instance.
 * @property {object} sprite - Phaser.io sprite object
 */
var Road = function () {
  
  
};


/**
 * Add the road sprite to the map.
 * @memberof Road
 * @name spawn
 * @instance
 * @method
 */
Road.prototype.spawn  = function () {
}


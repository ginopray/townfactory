/**
 * Contains the Actions class.
 * @file
 */

/**
 * Actions class.
 * @name Actions
 * @namespace
 * @classdesc Actions class.
 * @property {object} tools - User available tools.
 */
var Actions = {
  
  tools : {
    view: {},
    road: {}
  },
  
  
  /**
   * Initialize actions.
   * @memberof Actions
   * @name set
   * @method
   */
  init : function () {  
    // Set events:
    // Mouse down:
    game.input.onDown.add(function(){
      Actions.click();
    }, this);
  },
  
  
  /**
   * Manage a click on the map.
   * @memberof Actions
   * @name click
   * @method
   */
  click : function () {
    // Get tile.
    var tile = phaser_object.inputs.mouse.selection.tile;
    var tile_pos_x = (phaser_object.inputs.mouse.selection.tile.x / Map.settings.tileWidth) + 1;
    var tile_pos_y = (phaser_object.inputs.mouse.selection.tile.y / Map.settings.tileHeight) + 1;
    // Call the tool.
    if (typeof window["Actions"]['tool_' + GameApp.data.action.selected] !== "undefined")
      window["Actions"]['tool_' + GameApp.data.action.selected]({x: tile_pos_x, y: tile_pos_y});
  },
    
  
  /**
   * Set the action to do.
   * @memberof Actions
   * @name set
   * @method
   * @param {string} tool - The tool to use.
   */
  set : function (tool) {
    // Set current action.
    GameApp.data.action.selected = tool;
    
    // Create helper sprite
    // Roads.xxx();
    
    // Update board.
    jQuery('#tools').children().removeClass('tool--selected');
    jQuery('.tool--' + tool).addClass('tool--selected');
  },
  
  
  /**
   * Build a road.
   * @memberof Actions
   * @name tool_road
   * @method
   * @param {object} tile - Selected tile.
   */
  tool_road : function (tile) {
    Roads.build({x: tile.x, y: tile.y});
  },
  
  
}

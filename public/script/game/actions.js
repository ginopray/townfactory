/**
 * Contains the Actions class.
 * @file
 */

/**
 * Actions class.
 * @name Actions
 * @namespace
 * @classdesc Actions class.
 */
var Actions = {
  
  /**
   * User available tools.
   * @memberof Actions
   * @name tools
   * @type {object}
   * @property {object} view - The "view" tool.
   * @property {object} road - The "road" tool.
   */
  tools : {
    view: {},
    road: {}
  },
  
  
  /**
   * Initialize actions.
   * @memberof Actions
   * @name init
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
    Actions.set_helper(tool);
    
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
  
  
  /**
  * Set the action to do.
  * @memberof Actions
  * @name set_helper
  * @method
  * @param {string} tool - The tool to use.
  */
  set_helper : function (tool) {
    if (phaser_object.helper) {
      phaser_object.helper.destroy();
      phaser_object.helper = false;
    }
    if (tool != "view") {
      phaser_object.helper = game.add.sprite(0, 0, 'helper-' + tool);
    }
  }
  
  
}

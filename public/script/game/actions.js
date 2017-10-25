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
   * @property {array} road.directions - Possible road directions.
   */
  tools : {
    view: {},
    road: {
      directions: ['up', 'right', 'down', 'left'],
      dir_angles: [0, 90, 180, 270]
    }
  },
  
  
  /**
   * Initialize actions.
   * @memberof Actions
   * @name init
   * @method
   */
  init : function () {
    
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
   * Manage mouse wheel.
   * @memberof Actions
   * @name wheel
   * @method
   */
  wheel : function (e) {
    var tool = GameApp.data.action.selected;
    // Manage wheel tool by tool.
    if (typeof window["Actions"]['wheel_' + tool] !== "undefined")
      window["Actions"]['wheel_' + tool](e);
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
    
    // Initialize tool data.
    if (typeof window["Actions"]['tool_init_' + tool] !== "undefined")
      GameApp.data.action.data = window["Actions"]['tool_init_' + tool]();
    else
      GameApp.data.action.data = {};
    
    // Create helper sprite
    Actions.set_helper(tool);
    
    // Update board.
    jQuery('#tools').children().removeClass('tool--selected');
    jQuery('.tool--' + tool).addClass('tool--selected');
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
      phaser_object.helper.width = Map.settings.helperWidth;
      phaser_object.helper.height = Map.settings.helperHeight;
      phaser_object.helper.anchor.setTo(0.5, 0.5);
      phaser_object.helper.angle = 0;
    }
  },
  
  
  /**
   * Configure tool data.
   * @memberof Actions
   * @name tool_configure
   * @method
   * @param {object} vars - Variables to set.
   */
  tool_configure : function (vars) {
    for (var par in vars) {
      GameApp.data.action.data[par] = vars[par];
    }
  },
  
  
  /**
   * Initialize "road" tool.
   * @memberof Actions
   * @name tool_init_road
   * @method
   * @return {Roads.ToolData} Tool data set.
   * @see Roads.tool_init
   */
  tool_init_road : function () {
    return Roads.tool_init();
  },
  
  
  /**
   * Road tool: manage mouse wheel.
   * @memberof Actions
   * @name wheel_road
   * @method
   * @see Roads.wheel
   */
  wheel_road : function (e) {
    Roads.wheel(e);
  },
    
  
  /**
   * Build a road.
   * @memberof Actions
   * @name tool_road
   * @method
   * @param {object} tile - Selected tile.
   * @see Roads.build
   */
  tool_road : function (tile) {
    Roads.build({x: tile.x, y: tile.y});
  },
    
  
}

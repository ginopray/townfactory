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
   * Actions settings.
   * @memberof Actions
   * @name settings
   * @type {object}
   * @property {string} default_tool - Default tool ("view").
   */
  settings : {
    default_tool: "view"
  },

  
  /**
   * User available tools.
   * @memberof Actions
   * @name tools
   * @type {object}
   * @property {object} view - The "view" tool - DEFAULT.
   * @property {object} road - The "road" tool.
   * @property {array} road.directions - Possible road directions.
   */
  tools : {
    view: {},
    road: {
      directions: ['right', 'down', 'left', 'up'],
      dir_angles: [0, 90, -180, -90]
    },
    remove: {}
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
   * Set the action to do.
   * @memberof Actions
   * @name set
   * @method
   * @param {string} tool - The tool to use.
   */
  set : function (tool) {
    // Set default.
    if (tool == "")
      tool = Actions.settings.default_tool;
      
    // Set current action.
    GameApp.data.action.tool = tool;
    // Locked.
    GameApp.data.action.locked = false;
    
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
    if (tool != Actions.settings.default_tool) {
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
   * Manage a click on the map.
   * @memberof Actions
   * @name click
   * @method
   */
  click : function (pointer) {
    
    // Manage active tool.
    
    // Right button
    if (pointer.rightButton.isDown) {
      // Cancel tool
      Actions.set('');
      
    // Left and center button.
    // pointer.leftButton.isDown
    } else {
    
      // Get tile.
      var tile = phaser_object.inputs.mouse.selection.tile;
      var tile_pos_x = (phaser_object.inputs.mouse.selection.tile.x / Map.settings.tileWidth) + 1;
      var tile_pos_y = (phaser_object.inputs.mouse.selection.tile.y / Map.settings.tileHeight) + 1;
      // Call the tool.
      if (typeof window["Actions"]['tool_' + GameApp.data.action.tool] !== "undefined")
        window["Actions"]['tool_' + GameApp.data.action.tool]({x: tile_pos_x, y: tile_pos_y});
      
    }
  },
    
  
  /**
   * Manage mouse wheel.
   * @memberof Actions
   * @name wheel
   * @method
   */
  wheel : function (e) {
    var tool = GameApp.data.action.tool;
    // Manage wheel tool by tool.
    if (typeof window["Actions"]['wheel_' + tool] !== "undefined")
      window["Actions"]['wheel_' + tool](e);
  },
  
  
  /**
   * Manage key press.
   * @memberof Actions
   * @name keyPress
   * @method
   */
  keyPress : function (e) {
    //console.log("Key: " + e.event.key, e);
    var k = e.event.key.toLowerCase();
    var tool = GameApp.data.action.tool;
    
    // Manage keyPress tool by tool.
    if (typeof window["Actions"]['keyPress_' + tool] !== "undefined")
      window["Actions"]['keyPress_' + tool](k);
    
  },
  
  
  /**
   * Road tool: manage keyPress.
   * @memberof Actions
   * @name keyPress_road
   * @method
   * @see Roads.keyPress
   */
  keyPress_road : function (e) {
    Roads.keyPress(e);
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

  
  /**
   * Remove something from map.
   * @memberof Actions
   * @name tool_remove
   * @method
   * @param {object} tile - Selected tile.
   */
  tool_remove : function (tile) {
    var things = Map.find(tile.x, tile.y);
    for (var what in things) {
      if (things[what] !== false) {
        if (what == "roads")
          things[what].remove();
        else
          console.log("can remove " + what + "?");
      }
    }
    
  },
  
  
}

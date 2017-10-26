/**
 * Contains the game board class: Board.
 * @file
 * @see Board
 */

/**
 * The game board class.
 * @name Board
 * @namespace
 * @classdesc Game board - Manage the UI: buttons, stats...
 */
var Board = {
  
  /**
   * Control flags.
   * @memberof Board
   * @name flags
   * @type {object}
   * @property {bool} render - Debug rendering on/off
   */
  flags : {
    render : 1,
  },

  
  /**
   * Initialize the board.
   * @memberof Board
   * @name init
   * @method
   */
  init : function () {
    // Bind click on boad commands.
    jQuery('.board-command').each(function(){
      jQuery(this).click(function(){
        window["Board"][jQuery(this).attr("data-callback")]();
      });
    });
    
    // Build tools panel.
    Board.set_tools_panel();
    
  },

  
  /**
   * Update the board.
   * @memberof Board
   * @name update
   * @method
   */
  update : function () {
    // Update info about current mouse selection.
    Board.info_selection();
  },
  
  
  /**
   * Toggle geometry rendering.
   * @memberof Board
   * @name render_toggle
   * @method
   */
  render_toggle : function () {
    Board.flags.render = 1 - Board.flags.render;
    game.debug.reset();
  },
  
  
  /**
   * Update the information view about current selection.
   * @memberof Board
   * @name info_selection
   * @method
   */
  info_selection : function () {
    var coords = Map.coord2tile({x: phaser_object.inputs.mouse.selection.tile.x, y: phaser_object.inputs.mouse.selection.tile.y});
    var html = "";
    html += '<p>Tile hover: ' + (coords.x + 1) + ':' + (coords.y + 1) + '</p>'
    jQuery('#info-selection').html(html);
  },
  
  
  /**
   * Update the information view about building.
   * @memberof Board
   * @name info_building
   * @method
   * @param {object|false} building - Building object. If false: clear info box.
   */
  info_building : function (building) {
    if (!building) {
      jQuery('#info-building').html("");
      return;
    }
    var html = "";
    var html_production = Board.get_building_production(building.production);
    html += '<div>';
    // Building name.
    html += '<h3>' + building.name + '</h3>';
    // Image.
    html += '<div><img class="info-building__image" src="images/game/buildings/building-' + building.type + '.png" /></div>';
    // Position and size info.
    html +='<div>Position: ' + building.pos_x + ':' + building.pos_y + ', size: ' + building.width + 'x' + building.height + '</div>';
    // Production info.
    if (html_production != "") {
      html += '<div>Production: ' + html_production + '</div>';
      html += '<div>Active: ' + building.power_switch + '</div>';
    }
    html += '</div>';
    jQuery('#info-building').html(html);
  },
  
  
  /**
   * Get the information view about building production.
   * @memberof Board
   * @name get_building_production
   * @method
   * @param {object} production - production object.
   */
  get_building_production : function (production) {
    if (typeof production.resources === "undefined" || production.resources.length == 0) 
      return "";
    
    var html = "";
    var obj;
    html += '<div>';
    for (var p in production.resources) {
      obj = production.resources[p]
      html += '<img class="info-resource__image" src="images/game/resources/resource-' + obj.resource + '.png" title="Resource ' + obj.resource + '" /> ';
    }
    html += '</div>';
    return html;
  },
  
  
  /**
   * Set the tools panel.
   * @memberof Board
   * @name set_tools_panel
   * @method
   */
  set_tools_panel : function () {
    for (var tool in Actions.tools) {
      jQuery('#tools').append(
        jQuery('<div>', {
          id: 'tool-' + tool,
          'data-tool': tool,
          class: 'tool tool--' + tool,
          title: tool,
          mousedown: function() {
            Actions.set(jQuery(this).attr('data-tool'));
          }
        })
      );
    }
    // Select first.
    GameApp.data.action.selected = jQuery('#tools div').first().attr('data-tool');
    jQuery('#tools div').first().addClass('tool--selected');
  },
  


};

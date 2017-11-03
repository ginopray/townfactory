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
   * Game messages.
   * @memberof Board
   * @name messages
   * @type {array}
   * @example
   * Board.messages.push({
   *   // Message id.
   *   id: 1,
   *   // Passing building id.
   *   vars: [1]
   * });
   */
  messages : [],
  
  
  /**
   * Initialize the board.
   * @memberof Board
   * @name init
   * @method
   */
  init : function () {

    // Create resources overview container.
    Board.info_resources_header();
    
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
    Board.info_resources();
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
    html += '<p>Tile hover: ' + (coords.x) + ':' + (coords.y) + '</p>'
    //jQuery('#info-selection').html(html);
    document.getElementById('info-selection').innerHTML = html;
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
    html +='<div>ID: ' + building.id + ', position: ' + building.pos_x + ':' + building.pos_y + ', size: ' + building.width + 'x' + building.height + '</div>';
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
      obj = production.resources[p];
      html += Board.get_resource_image(obj.resource, {class: 'info-resource__image'}) + ' ' + ((1 / obj.time) * 60) + '/m';
    }
    html += '</div>';
    return html;
  },
  
  
  /**
   * Update the information view about resources.
   * @memberof Board
   * @name info_resources
   * @method
   */
  info_resources : function () {
    var resources = {};
    var villages = Map.findType(5, 'buildings');
    var resource_type;
    for (var v in villages) {
      for (resource_type in villages[v].warehouse) {
        if (typeof resources[resource_type] === "undefined")
          resources[resource_type] = 0;
        if (typeof villages[v].warehouse[resource_type].amount !== "undefined")
          resources[resource_type] += villages[v].warehouse[resource_type].amount;
      }
    }
    var html = "";
    for (resource_type in resources) {
      if (resources[resource_type] > 0) {
        document.getElementById('resource-' + resource_type + '-count').innerHTML = resources[resource_type];
        document.getElementById('resource-' + resource_type + '-container').style.display = 'block';
      }
    }
    //jQuery('#resources').html(html);
    //document.getElementById('resources').innerHTML = html;
  },
  

  /**
   * Create resource overview container.
   * @memberof Board
   * @name info_resources_header
   * @method
   */
  info_resources_header : function () {
    var resources = Database.get('resources');
    var html = "";
    for (var r in resources) {
      html += '<div id="resource-' + resources[r].id + '-container" class="resources__container">';
      html += '<div class="resources__head">';
      html += Board.get_resource_image(resources[r].id, {class: 'resources__image'});
      html += '</div>';
      html += '<div id="resource-' + resources[r].id + '-count" class="resource-count">';
      html += '</div>';
      html += '</div>';
    }
    
    document.getElementById('resources').innerHTML = html;
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
    GameApp.data.action.tool = jQuery('#tools div').first().attr('data-tool');
    jQuery('#tools div').first().addClass('tool--selected');
  },
  
  
  /**
   * Add a game message.
   * @memberof Board
   * @name message_add
   * @method
   * @param {number} msg_id - message type.
   * @param {array} vars - Array of string to use with translation.
   * @deprecated "message" methods: to do something better.
   */
  message_add : function (msg_id, vars) {
    var new_msg = {
      id: msg_id,
      vars: vars
    };
    for (var m in Board.messages) {
      if (Board.messages[m].id == msg_id && JSON.stringify(Board.messages[m].vars) === JSON.stringify(vars))
        return;
    }
    Board.messages.push(new_msg);
    Board.message_show();
  },
  
  
  /**
   * Get the html image of a resource.
   * @memberof Board
   * @name get_resource_image
   * @method
   * @param {number} type - The resource type.
   * @param {object} vars - Attributes (optional).
   */
  get_resource_image : function (type, vars) {
    var html = '<img';
    if (typeof vars.class !== "undefined")
      html += ' class="' + vars.class + '"';
    html += ' src="images/game/resources/resource-' + type + '.png" alt="' + jQuery.i18n._('resource-' + type) + '" title="' + jQuery.i18n._('resource-' + type) + '" />';
    return html;
  },
  
  
  /**
   * Remove a game message.
   * @memberof Board
   * @name message_remove
   * @method
   * @param {number} msg_id - message type.
   * @param {array} vars - Array of string to use with translation.
   * @deprecated "message" methods: to do something better.
   */
  message_remove : function (msg_id, vars) {
    var new_msg = {
      id: msg_id,
      vars: vars
    };
    for (var m in Board.messages) {
      if (Board.messages[m].id == msg_id && JSON.stringify(Board.messages[m].vars) === JSON.stringify(vars)) {
        Board.messages.splice(m, 1);
        Board.message_show();
        return;
      }
    }
    
  },
  
  
  /**
   * Show game message.
   * @memberof Board
   * @name message_show
   * @method
   * @deprecated "message" methods: to do something better.
   */
  message_show : function () {
    var html = "";
    var msg;
    for (var m in Board.messages) {
      msg = Board.messages[m];
      html += jQuery.i18n._('message-' + msg.id, msg.vars[0], msg.vars[1], msg.vars[2]) + "<br />";
    }
    document.getElementById('messages').innerHTML = html;
  },
  

};

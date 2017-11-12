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
    
    document.getElementById('info-building').innerHTML = Board.info_building();
    
    // Debug:
    /*var debug = "";
    debug += "Buildings: " + GameApp.data.buildings.length + "<br />";
    debug += "Resources: " + GameApp.data.resources.length + "<br />";    
    jQuery('#debug').html(debug);*/
  },
  

  /**
   * Update the board (less frequently).
   * @memberof Board
   * @name alternative_update
   * @method
   */
  alternative_update : function () {
    
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
    // Get tile coordinates.
    var coords = Map.coord2tile({x: phaser_object.inputs.mouse.selection.tile.x, y: phaser_object.inputs.mouse.selection.tile.y});
    // Get items on the map.
    var buildings = Map.find(coords.x, coords.y, 'buildings');
    var roads = Map.find(coords.x, coords.y, 'roads');
    var html = "";
    html += '<div>' + (coords.x) + ':' + (coords.y);
    if (typeof buildings !== "undefined" && buildings.buildings) {
      html += ' ' + Board.get_building_image(buildings.buildings.type, {class: 'icon'});
    }
    if (typeof roads !== "undefined" && roads.roads) {
      html += ' ' + Board.get_road_image(roads.roads, {class: 'icon'});
    }
    html += '</div>';
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
  info_building : function () {
    if (typeof GameApp.data.selection.building === "undefined")
      return "";
    
    var building = GameApp.data.selection.building;
    
    var html = "";
    var html_production = Board.get_building_production(building);
    var html_request = Board.get_building_request(building.request);
    var html_warehouse = Board.get_building_warehouse(building.warehouse);
    html += '<div>';
    // Building name.
    html += '<h2>' + building.fullname() + '</h2>';
    // Image.
    html += '<div>' + Board.get_building_image(building.type, {class: 'info-building__image'}) + '</div>';
    // Position and size info.
    html +='<small>ID: ' + building.id + ', position: ' + building.pos_x + ':' + building.pos_y + ', size: ' + building.width + 'x' + building.height + '</small>';
    // Production info.
    if (html_production != "") {
      html += '<div><h3>' + Main.t('Production') + '</h3>' + html_production + '</div>';
      // html += '<div>Active: ' + building.power_switch + '</div>';
    }
    // Request info.
    if (html_request != "") {
      html += '<div><h3>' + Main.t('Request') + '</h3>' + html_request + '</div>';
    }
    // Warehouse info.
    if (html_warehouse != "") {
      html += '<div><h3>' + Main.t('Warehouse') + '</h3>' + html_warehouse + '</div>';
    }
    
    html += '</div>';
   
    return html;
  },
  
  
  /**
   * Get the information view about building production.
   * @memberof Board
   * @name get_building_production
   * @method
   * @param {object} building - Building.
   */
  get_building_production : function (building) {
    var production = building.production;
    if (typeof production.resources === "undefined" || production.resources.length == 0) 
      return "";
    
    var html = "";
    var obj,
        perc;
    html += '<div>';
    for (var p in production.resources) {
      obj = production.resources[p];
      // General production info.
      html += Board.get_resource_image(obj.resource, {class: 'icon'}) + ' '
      html += ((1 / obj.time) * 60) + '/m'; 
      // Production state.
      if (typeof production.current !== "undefined" &&
          typeof production.current[obj.resource] !== "undefined") {
        perc = Math.floor(((Date.now() - production.current[obj.resource]) * 100) / (obj.time * 1000));
        if (perc > 100)
          perc = 100;
        html += ' Progress: ' + perc + '%';
      } else {
        html += ' Inactive!';
        var missing = [];
        // What missing resources?
        for (var mr in obj.requires) {
          var res = obj.requires[mr];
          var required = res.requires;
          var amount = res.amount;
          if (
            typeof building.warehouse === "undefined" ||
            typeof building.warehouse[required] === "undefined" ||
            typeof building.warehouse[required].amount === "undefined" ||
            building.warehouse[required].amount < amount) {
            missing.push(required);
          }
        }
        if (missing.length > 0) {
          html += ' Missing: ';
          for (var m in missing) {
            html += Board.get_resource_image(missing[m], {class: 'icon'})
          }
        }
      }
      
    }
    html += '</div>';
    return html;
  },
  
  
  /**
   * Get the information view about building request.
   * @memberof Board
   * @name get_building_request
   * @method
   * @param {array} request - request array.
   */
  get_building_request : function (request) {
    if (typeof request === "undefined" || request.length == 0) 
      return "";
    var html = "";
    var obj;
    html += '<div>';
    for (var r in request) {
      obj = request[r];
      html += obj.amount + ' ' + Board.get_resource_image(obj.resource, {class: 'info-resource__image'});
    }
    html += '</div>';
    return html;
  },
  
  
  /**
   * Get the information view about building warehouse.
   * @memberof Board
   * @name get_building_warehouse
   * @method
   * @param {array} warehouse - warehouse array.
   */
  get_building_warehouse : function (warehouse) {
    if (typeof warehouse === "undefined" || warehouse.length == 0) 
      return "";
    var html = "";
    var obj,
        amount;
    html += '<div>';
    for (var resource in warehouse) {
      obj = warehouse[resource];
      if (typeof obj.amount === "undefined")
        amount = 0;
      else
        amount = obj.amount;
      html += Board.get_resource_image(resource, {class: 'info-resource__image'}) + ' ' + amount + '/' + obj.capacity;
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
    var consumption = {};
    var villages = Map.findType(5, 'buildings');
    var resource_type,
        time;    
    for (var v in villages) {
      // Villages warehouse.
      for (resource_type in villages[v].warehouse) {
        if (typeof resources[resource_type] === "undefined")
          resources[resource_type] = 0;
        if (typeof villages[v].warehouse[resource_type].amount !== "undefined")
          resources[resource_type] += villages[v].warehouse[resource_type].amount;
      }
      // Villages consumption.
      if (typeof villages[v].consumption !== "undefined" && 
          typeof villages[v].consumption.resources !== "undefined") {
        for (var r in villages[v].consumption.resources) {
          resource_type = villages[v].consumption.resources[r].resource;
          time = villages[v].consumption.resources[r].time;
          if (typeof consumption[resource_type] === "undefined")
            consumption[resource_type] = 0;
          consumption[resource_type] += (1 * villages[v].level) / time;
        }
      }
    }
    var html = "";
    jQuery('.resources__container').hide();
    for (resource_type in resources) {
      //if (resources[resource_type] > 0) {
        // warehouse.
        document.getElementById('resource-' + resource_type + '-count').innerHTML = resources[resource_type];
        // consumption.
        if (typeof consumption[resource_type] !== "undefined") {
          var cons = '-' + (consumption[resource_type] * 60) + '/m';
        } else {
          var cons = '';
        }
        document.getElementById('resource-' + resource_type + '-cons').innerHTML = cons;
        // Show container.
        document.getElementById('resource-' + resource_type + '-container').style.display = 'block';
      //}
    }
    
    document.getElementById('people-count').innerHTML = People.count();
    document.getElementById('people-container').style.display = "block";
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
    // People.
    html += '<div id="people-container" class="resources__container">';
    html += '<div class="resources__head">';
    html += Board.get_resource_image('people', {class: 'resources__image'});
    html += '</div>';
    html += '<div id="people-count" class="resource-count">';
    html += '</div>';
    html += '</div>';
    
    // Resources.
    for (var r in resources) {
      html += '<div id="resource-' + resources[r].id + '-container" class="resources__container">';
      html += '<div class="resources__head">';
      html += Board.get_resource_image(resources[r].id, {class: 'resources__image'});
      html += '</div>';
      html += '<div id="resource-' + resources[r].id + '-count" class="resource-count"></div>';
      html += '<div id="resource-' + resources[r].id + '-cons" class="resource-cons"></div>';
      html += '</div>';
    }
    
    document.getElementById('resources').innerHTML = html;
    document.getElementById('people-container').style.display = 'block';
  },
  
  
  /**
   * Set the tools panel.
   * @memberof Board
   * @name set_tools_panel
   * @method
   */
  set_tools_panel : function () {
    for (var tool in Actions.tools) {
      var costs = Production.get_item_costs (tool, 1);
      var title = Main.t('tool-' + tool);
      if (costs.length > 0) {
        for (var c in costs) {
          title += "\n" + costs[c].amount + ' ' + Resources.fullname(costs[c].requires, { link: false });
        }
      }
      jQuery('#tools').append(
        jQuery('<div>', {
          id: 'tool-' + tool,
          'data-tool': tool,
          class: 'tool tool--' + tool,
          title: title,
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
    html += ' src="images/game/resources/resource-' + type + '.png" alt="' + Resources.fullname(type) + '" title="' + Resources.fullname(type) + '" />';
    return html;
  },
  
  
    
  /**
   * Get the html image of a building.
   * @memberof Board
   * @name get_building_image
   * @method
   * @param {number} type - The building type.
   * @param {object} vars - Attributes (optional).
   */
  get_building_image : function (type, vars) {
    var html = '<img';
    if (typeof vars.class !== "undefined")
      html += ' class="' + vars.class + '"';
    html += ' src="images/game/buildings/building-' + type + '.png" alt="' + Main.t('building-' + type) + '" title="' + Main.t('building-' + type) + '" />';
    return html;
  },
  
  
  /**
   * Get the html image of a road.
   * @memberof Board
   * @name get_road_image
   * @method
   * @param {number} type - The road type.
   * @param {object} vars - Attributes (optional).
   */
  get_road_image : function (road, vars) {
    var add_img = "";
    var html = '<img';
    if (typeof vars.class !== "undefined")
      html += ' class="' + vars.class + '"';
    var item = "road";
    if (typeof road.subclass !== "undefined") {
      item = road.subclass;
    }
    if (typeof road.in_out !== "undefined") {
      add_img = '-' + road.in_out;
    }
    //html += ' src="images/game/roads/' + item + '-' + road.type + add_img + '.png" alt="' + Main.t('road-' + road.type) + '" title="' + Main.t('road-' + road.type) + '" />';
    html += ' src="images/game/roads/' + item + add_img + '.png" alt="' + Main.t('road') + '" title="' + Main.t('road') + '" />';
    return html;
  },
    

};

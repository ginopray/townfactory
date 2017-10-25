/**
 * Contains the game application namespace: GameApp.
 * @file
 * @see GameApp
 */

/**
 * The main game application class.
 * @name GameApp
 * @namespace
 * @classdesc The main game application class.
 */
var GameApp = {
  
  /**
  * The game data set.
  * @memberof GameApp
  * @name data
  * @type {object}
  * @property {timestamp} date_ini - Start game date: Date.now()
  * @property {array} buildings - Array containing building objects.
  * @property {array} resources - Array containing resources objects.
  * @property {object} map - Map game data.
  * @property {object} map.width - The width of the map (in tiles).
  * @property {number} map.height - The height of the map (in tiles).
  * @property {object} action - Action data.
  * @property {string} action.selected - Current selected action: view, build road....
  * @property {object} action.vars - Action data object. Each tool has his data set. (ie. "road" tool can have "direction" property)
  * @property {object} roads - Roads data.
  * @property {array} roads.items - Array containing all road items.
  */
  data : {},
  
 
  /**
   * Initialize the game (called by Phaser:init).
   * Loads DB data.
   * @memberof GameApp
   * @name init
   * @method
   */
  init : function () {
    
    console.log("PHASER INIT DONE!");
  },

  
  /**
   * Preload (called by Phaser:preload).
   * Preload files and loads the game data.
   * @memberof GameApp
   * @name preload
   * @method
   */
  preload : function () {
    
    // Load db data.
    game.load.json('resources', '../data/resources.json');
    game.load.json('buildings', '../data/buildings.json');
    game.load.json('production', '../data/production.json');
    game.load.json('production_resources', '../data/production_resources.json');
    // Load game after load complete.
    game.load.onLoadComplete = { dispatch : function(){
      // Check resources.
      var JSON_resources = game.cache.getJSON('resources');
      if (typeof JSON_resources === "undefined" || JSON_resources === null) {
        GameApp.error('Resources file not found.');
        return; 
      }
      // Check buildings.
      var JSON_buildings = game.cache.getJSON('buildings');
      if (typeof JSON_buildings === "undefined" || JSON_buildings === null) {
        GameApp.error('Buildings file not found.');
        return; 
      }
      // Check production.
      var JSON_production = game.cache.getJSON('production');
      if (typeof JSON_production === "undefined" || JSON_production === null) {
        GameApp.error('Production file not found.');
        return; 
      }
      // Check production resources.
      var JSON_production_resources = game.cache.getJSON('production_resources');
      if (typeof JSON_production_resources === "undefined" || JSON_production_resources === null) {
        GameApp.error('Production resources file not found.');
        return; 
      }
      
      //console.log("File loaded! Load game...");
      // Load game data.
      GameApp.data = GameApp.load();
            
      console.log("PHASER PRELOAD DONE!");
      
    }};

    // Phaser: Preload files.
    for (var i = 1; i <= 5; i ++) {
      game.load.image('building-' + i, 'images/game/buildings/building-' + i + '.png');
    }
    for (var i = 1; i <= 4; i ++) {
      game.load.image('resource-' + i, 'images/game/resources/resource-' + i + '.png');
    }
    game.load.image('helper-road', 'images/game/tools/helper-road.png');
    game.load.image('road', 'images/game/roads/road.png');
    
  },

  
  /**
   * Create the game (called by Phaser:create).
   * Set physics, add groups...
   * and get the map.
   * @memberof GameApp
   * @name start
   * @method
   */
  create : function () {    
        
    // Add Physics.
    game.physics.startSystem(Phaser.Physics.ARCADE);
    
    // Create sprite groups:
    // Layers
    phaser_object.groups.layers = {};
    // Base layer
    phaser_object.groups.layers.base = game.add.group();
    // Buildings.
    phaser_object.groups.buildings = game.add.group();
    // Resources.
    phaser_object.groups.resources = game.add.group();
    // Add groups to base layer.
    phaser_object.groups.layers.base.add(phaser_object.groups.buildings);
    phaser_object.groups.layers.base.add(phaser_object.groups.resources);
    // Add physics to main layer groups.
    phaser_object.groups.layers.base.setAll('enableBody', true);

    
    // Show the map.
    Map.get();
    
    // Actions init.
    Actions.init();

    // Initialize the board.
    Board.init();
    
    console.log("PHASER CREATE DONE!");
  },

  
  /**
   * Update game loop (called by Phaser:update).
   * @memberof GameApp
   * @name update
   * @method
   */
  update : function () {
    // Production.
    for (var b in GameApp.data.buildings) {
      GameApp.data.buildings[b].produce();
    }
    // Collisions.
    game.physics.arcade.collide(phaser_object.groups.resources, phaser_object.groups.buildings);
    game.physics.arcade.collide(phaser_object.groups.resources, phaser_object.groups.resources);
    
    var coords = Map.coord2tile({x: game.input.mousePointer.x, y: game.input.mousePointer.y});
    
    // Update mouse selection position.
    if (typeof phaser_object.inputs.mouse.selection.tile !== "undefined") {
      phaser_object.inputs.mouse.selection.tile.x = coords.x * Map.settings.tileWidth;
      phaser_object.inputs.mouse.selection.tile.y = coords.y * Map.settings.tileHeight;
    }
    
    // Update helper
    phaser_object.helper.centerX = (coords.x * Map.settings.tileWidth) + (Map.settings.tileWidth / 2);
    phaser_object.helper.centerY = (coords.y * Map.settings.tileHeight) + (Map.settings.tileHeight / 2);
    
    Board.update();
    
  },

  
  /**
   * Render loop.
   * @memberof GameApp
   * @name render
   * @method
   */
  render : function () {
    var color,
        obj;
    // Mouse selection
    for (var m in phaser_object.inputs.mouse) {
      obj = phaser_object.inputs.mouse[m];
      if (typeof obj.color === "undefined")
        color = 'rgba(0, 150, 136, 0.1)';
      else
        color = obj.color;
      game.debug.geom(obj.tile, color);
    }
    
    // Check render flag.
    if (!Board.flags.render)
      return;
    // Show map grid.
    for (var g in phaser_object.grid) {
      obj = phaser_object.grid[g];
      if (typeof obj.color === "undefined")
        color = 'rgba(0, 150, 136, 0.1)';
      else
        color = obj.color;
      game.debug.geom(obj.tile, color);
    }
  },
  
  /**
   * Load saved game.
   * @memberof GameApp
   * @name load
   * @method
   * @returns {Object} A full game data object.
   */
  load : function () {
    return GameApp.new();
  },

  
  /**
   * Save game.
   * @memberof GameApp
   * @name save
   * @method
   */
  save : function () {
  },

  
  /**
   * Create new game.
   * @memberof GameApp
   * @name new
   * @method
   * @returns {Object} A full game data object.
   */
  new : function () {
    var initial_game_size = {
      w: 21,
      h: 16
    }
    return {
      date_ini : Date.now(),
      map : {
        width : initial_game_size.w,
        height : initial_game_size.h,
      },
      buildings : [
        // forest
        new Building(1, Math.floor(Math.random() * initial_game_size.w) + 1, Math.floor(Math.random() * initial_game_size.h) + 1),
        // wheatfield
        new Building(2, Math.floor(Math.random() * initial_game_size.w) + 1, Math.floor(Math.random() * initial_game_size.h) + 1),
        // village
        new Building(5, Math.floor(Math.random() * initial_game_size.w) + 1, Math.floor(Math.random() * initial_game_size.h) + 1),
      ],
      resources : [],
      action : {},
      roads : {}
    }
  },

  
  /**
   * Send error message.
   * @memberof GameApp
   * @name error
   * @method
   * @param {string} msg - Error message.
   */
  error : function (msg) {
    game.destroy();
    document.getElementById('error').innerHTML = msg;
    document.getElementById('error').style.display = "block";
  }
    

};

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
  * @property {string} action.tool - Current selected tool: view, build road....
  * @property {object} action.vars - Action data object. Each tool has his data set. (ie. "road" tool can have "direction" property)
  * @property {object} roads - Roads data.
  * @property {array} roads.items - Array containing all road items. Ie. GameApp.data.roads.items[x][y] = new Road();
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
    
    // Load buildings.
    for (var i = 1; i <= 5; i ++) {
      game.load.image('building-' + i, 'images/game/buildings/building-' + i + '.png');
    }
    // Load resources.
    for (var i = 1; i <= 4; i ++) {
      game.load.image('resource-' + i, 'images/game/resources/resource-' + i + '.png');
    }
    // Load other images.
    game.load.image('helper-road', 'images/game/tools/helper-road.png');
    game.load.image('helper-remove', 'images/game/tools/helper-remove.png');
    game.load.image('road', 'images/game/roads/road.png');
    
    // File complete (progress bar).
    game.load.onFileComplete.add(function(progress, file_key, success, total_loaded_files, total_files){
      //console.log(file_key + "...done! " + total_loaded_files + "/" + total_files + "= " + progress + "%");
      GameApp.loading(progress, file_key, success);
    }, this);
    
    // Load game after load complete.
    //game.load.onLoadComplete = { dispatch : function(){
    game.load.onLoadComplete.add(function(){
      
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
      
    }, this);
    
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
    // Roads.
    phaser_object.groups.roads = game.add.group();
    // Buildings.
    phaser_object.groups.buildings = game.add.group();
    // Resources.
    phaser_object.groups.resources = game.add.group();
    // Add groups to base layer.
    phaser_object.groups.layers.base.add(phaser_object.groups.roads);
    phaser_object.groups.layers.base.add(phaser_object.groups.buildings);
    phaser_object.groups.layers.base.add(phaser_object.groups.resources);
    // Add physics to main layer groups.
    phaser_object.groups.layers.base.setAll('enableBody', true);

    // Prevent defaults.
    game.canvas.oncontextmenu = function (e) {
      e.preventDefault();
    }
    
    // Initialize the map.
    Map.init();
    
    // Actions init.
    Actions.init();

    // Initialize the board.
    Board.init();
    
    // Show the game!
    jQuery('.waiting').hide();
    
    console.log("PHASER CREATE DONE!");
  },

  
  /**
   * Update game loop (called by Phaser:update).
   * @memberof GameApp
   * @name update
   * @method
   */
  update : function () {
    
    Map.update();
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
      roads : {
        items: []
      }
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
  },
  
  
  /**
   * Send loading message.
   * @memberof GameApp
   * @name loading
   * @method
   * @param {number} progress - Loading progress percentage.
   * @param {string} file_key - File key.
   * @param {boolean} success - Resource loaded or not.
   */
  loading : function (progress, file_key, success) {
    var msg = file_key + '...' + (success?'done!':'failed!');
    if (!success) msg = '<span class="color-error">' + msg + '</span>';
    // Set progress bar.
    jQuery('.progress__span').css('width', progress + '%');
    // Append message.
    jQuery('#loading').append(jQuery('<div>', { html: msg }));
    // Set percentage.
    jQuery('.loading__percentage').text(progress + '%');

  }

};

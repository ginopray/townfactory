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
   * Game settings.
   * @memberof GameApp
   * @name settings
   * @type {object}
   * @property {object} defaults - New game: default settings assigned to data object.
   * @property {object} defaults.size - World size object.
   * @property {object} defaults.size.width - World width in tiles.
   * @property {object} defaults.size.height - World height in tiles.
   * @property {object} debug - Debug settings.
   * @property {boolean} debug.log - Debug log enabled.
   */
  settings : {
    debug : {
      log: true,
    },
    defaults : {
      map : {
        width : 24,
        height : 18
      },
      indexes: {
        buildings: 0,
        characters: 0,
        resources: 0,
        roads: 0,
        roads_groups : 0,
      },
      buildings : [],
      resources : [],
      roads : [],
      action : {},
      //selection : {}, <-- selection must be undefined!
      characters : {
        citizen: []
      }
    }
  },
  
  
  /**
  * The game data set.
  * @memberof GameApp
  * @name data
  * @type {object}
  * @property {timestamp} date_ini - Start game date: Date.now()
  * @property {object} indexes - Object indexes.
  * @property {number} indexes.buildings - Building max id.
  * @property {number} indexes.characters - characters max id.
  * @property {number} indexes.resources - Resource max id.
  * @property {number} indexes.roads - roads max id.
  * @property {array} buildings - Array containing building objects.
  * @property {array} resources - Array containing resources objects.
  * @property {object} characters - Characters container.
  * @property {array} characters.citizen - Array containing citizens.
  * @property {object} roads - Array containing roads objects.
  * @property {object} map - Map game data.
  * @property {object} map.width - The width of the map (in tiles).
  * @property {number} map.height - The height of the map (in tiles).
  * @property {object} action - Action data.
  * @property {string} action.tool - Current selected tool: view, build road....
  * @property {object} action.vars - Action data object. Each tool has his data set. (ie. "road" tool can have "direction" property)
  * @property {object} selection - Current selection.
  * @property {object} capital - Reference to Capital.
  */
  data : {},
  
  
  /**
  * The game timers.
  * @memberof GameApp
  * @name timers
  * @type {object}
  */
  timers : {
    alternative_update: false,
    save_game: false,
  },
 
  /**
   * Initialize the game (called by Phaser:init).
   * Loads DB data.
   * @memberof GameApp
   * @name init
   * @method
   */
  init : function () {
    
    // Set locale.
    jQuery.i18n.locale = 'en';
    
    game.desiredFps = 3;

  },

  
  /**
   * Preload (called by Phaser:preload).
   * Preload files and loads the game data.
   * @memberof GameApp
   * @name preload
   * @method
   */
  preload : function () {
    
    var tables = [
      "resources",
      "buildings",
      "production",
      "costs",
      "consumption",
      "production_resources",
    ];
    
    // Load db data.
    for (var t in tables) {
      game.load.json(tables[t], '../data/' + tables[t] + '.json');  
    }
    // Load translations.
    game.load.json('translations', '../langs/en.json');
    
    // Load buildings.
    for (var i = 1; i <= 7; i ++) {
      game.load.image('building-' + i, 'images/game/buildings/building-' + i + '.png');
    }
    // Load resources.
    for (var i = 1; i <= 6; i ++) {
      game.load.image('resource-' + i, 'images/game/resources/resource-' + i + '.png');
    }
    // Load characters.
    // Citizen.
    for (var i = 1; i <= 1; i ++) {
      game.load.image('citizen-' + i, 'images/game/characters/citizen-' + i + '.png');
    }
    // Roads
    game.load.image('road', 'images/game/roads/road.png');
    game.load.image('station-1', 'images/game/roads/station-1.png');
    game.load.image('station-0', 'images/game/roads/station-0.png');
    game.load.image('subway', 'images/game/roads/subway.png');
    game.load.image('subway-0', 'images/game/roads/subway-0.png');
    game.load.image('subway-1', 'images/game/roads/subway-1.png');
    // Tools helper.
    game.load.image('helper-road', 'images/game/tools/helper-road.png');
    game.load.image('helper-station', 'images/game/tools/helper-station.png');
    game.load.image('helper-subway', 'images/game/tools/helper-subway.png');
    game.load.image('helper-station-in', 'images/game/tools/helper-station-1.png');
    game.load.image('helper-station-out', 'images/game/tools/helper-station-0.png');
    game.load.image('helper-remove', 'images/game/tools/helper-remove.png');
    // Load other images.
    game.load.image('selection', 'images/game/selection.png');
    game.load.image('temp', 'images/game/temp.png');
    
    // File complete (progress bar).
    game.load.onFileComplete.add(function(progress, file_key, success, total_loaded_files, total_files){
      //console.log(file_key + "...done! " + total_loaded_files + "/" + total_files + "= " + progress + "%");
      GameApp.loading(progress, file_key, success);
    }, this);
    
    // Load game after load complete.
    //game.load.onLoadComplete = { dispatch : function(){
    game.load.onLoadComplete.add(function(){
      
      // Check db files.
      var JSON_get;
      for (var t in tables) {
        JSON_get = game.cache.getJSON(tables[t]);
        if (typeof JSON_get === "undefined" || JSON_get === null) {
          GameApp.error(tables[t] + ' file not found.');
          return; 
        }
      }
      
      // Check translations file.
      var JSON_translations = game.cache.getJSON('translations');
      if (typeof JSON_translations === "undefined" || JSON_translations === null) {
        GameApp.error('Languages file not found.');
        return; 
      }
      // Load translations.
      jQuery.i18n.load(JSON_translations);
      

      // Load game data.
      if (!GameApp.load())
        GameApp.new();

      
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
        
    // Initialize the map.
    Map.init();
    
    // Actions init.
    Actions.init();
    
    // Production init.
    Production.init();

    // Initialize the board.
    Board.init();
    
    // Set a less frequent update loop.
    GameApp.timers.alternative_update = setInterval(GameApp.alternative_update, 1000);
    GameApp.timers.save_game = setInterval(GameApp.save, 5000);
    
    // Show the game!
    jQuery('.waiting').hide();

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
   * Alternative, less frequent, update game loop.
   * @memberof GameApp
   * @name alternative_update
   * @method
   */
  alternative_update : function () {
    
    // Update icons and messages.
    Icons.alternative_update();
    // Update board.
    Board.alternative_update();
    // Process villages.
    
    
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
    for (var g in phaser_object.dgrid) {
      obj = phaser_object.dgrid[g];
      if (typeof obj.color === "undefined")
        color = 'rgba(0, 150, 136, 0.1)';
      else
        color = obj.color;
      game.debug.geom(obj.tile, color);
    }
    
    // Debug.
    for (var m in phaser_object.debug.geom) {
      obj = phaser_object.debug.geom[m];
      if (typeof obj.color === "undefined")
        color = 'rgba(0, 150, 136, 0.1)';
      else
        color = obj.color;
      game.debug.geom(obj.geom, color);
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
    return false;
    
    var game_data = localStorage.getItem("game_data");
    if (typeof game_data === "undefined" || game_data.date_ini === "undefined")
      return false;
    else {
      GameApp.data = JSON.parse(game_data);
      console.log("Game loaded!");
      return true;
    }
  },

  
  /**
   * Save game.
   * @memberof GameApp
   * @name save
   * @method
   */
  save : function () {
    
    /*if (typeof(Storage) !== "undefined") {
      localStorage.setItem("game_data", JSON.stringify(GameApp.data));
      console.log("Game saved!");
    }*/
  },

  
  /**
   * Create new game.
   * @memberof GameApp
   * @name new
   * @method
   * @returns {Object} A full game data object.
   */
  new : function () {
    if (typeof(Storage) !== "undefined") {
      localStorage.removeItem("game_data");
    }
    
    GameApp.data = GameApp.settings.defaults;
    // Set init date.
    GameApp.data.date_ini = Date.now();
        
    // Add buildings.
    // village.
    GameApp.data.buildings.push(new Village(5));
    // forest.
    GameApp.data.buildings.push(new Building(1));
    // wheatfield.
    GameApp.data.buildings.push(new Building(2));
    // windmill.
    GameApp.data.buildings.push(new Building(4));
    // sawmill.
    GameApp.data.buildings.push(new Building(3));
    // iron mine.
    GameApp.data.buildings.push(new Building(6));
    // smeltery.
    GameApp.data.buildings.push(new Building(7));
    
    console.log("New game!");
    
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

  },
  
  
  /**
   * Pause the game.
   * @memberof GameApp
   * @name pause
   * @method
   */
  pause : function () {
    game.paused = true;
  },
  
  
  /**
   * Unpause the game.
   * @memberof GameApp
   * @name unpause
   * @method
   */
  unpause : function () {
    game.paused = false;
  },
  
  
  

};

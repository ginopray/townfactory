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
 * @property {object} data - The game data set.
 * @property {timestamp} data.date_ini - Start game date: Date.now()
 * @property {array} data.buildings - Array containing building objects.
 * @property {array} data.resources - Array containing resources objects.
 * @property {object} data.map - Map game data.
 * @property {object} data.map.width - The width of the map (in tiles).
 * @property {number} data.map.height - The height of the map (in tiles).
 * @see Building
 * @see Data
 * @see Map
 */
var GameApp = {
 
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
    for (var i = 1; i <= 2; i ++) {
      game.load.image('building-' + i, 'images/game/buildings/building-' + i + '.png');
    }
    for (var i = 1; i <= 2; i ++) {
      game.load.image('resource-' + i, 'images/game/resources/resource-' + i + '.png');
    }
    
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
    return {
      date_ini : Date.now(),
      map : {
        width : 40,
        height : 30,
      },
      buildings : [
        new Building(1), // forest
        new Building(2), // wheatfield
      ],
      resources : [],
    }
  },

  
  /**
   * Send error message.
   * @memberof GameApp
   * @name error
   * @method
   * @param {string} Error message.
   */
  error : function (msg) {
    game.destroy();
    document.getElementById('error').innerHTML = msg;
    document.getElementById('error').style.display = "block";
  }
    

};

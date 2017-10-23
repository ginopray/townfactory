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
    // Load game after load complete.
    game.load.onLoadComplete = { dispatch : function(){
      
      var JSON_resources = game.cache.getJSON('resources');
      if (typeof JSON_resources === "undefined" || JSON_resources === null) {
        GameApp.error('Resources file not found.');
        return; 
      }
      
      //console.log("File loaded! Load game...");
      // Load game data.
      GameApp.data = GameApp.load();
    }};
    
    // Phaser: Preload files.
    //game.load.image('ground', 'images/game/ground.png');
    //game.load.image('factory', 'images/game/factory.png');
    
    console.log("PHASER PRELOAD DONE!");
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
    game.physics.startSystem(Phaser.Physics.P2);
    
    // Create tilemap.
    //phaser_object.tilemap = new Phaser.Tilemap(game, 'tilemap', Map.settings.tileWidth, Map.settings.tileHeight, GameApp.data.map.width, GameApp.data.map.height);
    
    // Create groups:
    // Buildings.
    phaser_object.groups.buildings = game.add.group();
    phaser_object.groups.buildings.enableBody = true;
    
    // Show the map.
    Map.get();
    
    console.log("PHASER CREATE DONE!");
  },

  
  /**
   * Update game loop (called by Phaser:update).
   * @memberof GameApp
   * @name update
   * @method
   */
  update : function () {

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
        new Building(),
        new Building(),
      ],
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

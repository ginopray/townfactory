/**
 * Contains the game application class: GameApp.
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
 * @see Building
 */
var GameApp = {
  
  /**
   * Initialize the game (called by Phaser:init).
   * @memberof GameApp
   * @name init
   * @method
   */
  init : function () {
    // Load game data.
    GameApp.data = GameApp.load();
    
    // Phaser: Preload files.
    game.load.image('ground', 'images/game/ground.png');
    game.load.image('factory', 'images/game/factory.png');
  },

  /**
   * Start the game (called by Phaser:create).
   * Set physics, add groups...
   * and get the map.
   * @memberof GameApp
   * @name start
   * @method
   */
  start : function () {
    // Physics.
    game.physics.startSystem(Phaser.Physics.ARCADE);
    // Groups:
    // Buildings.
    phaser_object.groups.buildings = game.add.group();
    phaser_object.groups.buildings.enableBody = true;
    
    Map.get();
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
    return GameApp.create();
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
   * @name create
   * @method
   * @returns {Object} A full game data object.
   */
  create : function () {
    return {
      date_ini : Date.now(),
      buildings : [
        new Building(),
        new Building(),
      ],
    }
  },


};

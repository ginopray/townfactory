/**
 * Contains People namespace and Character class.
 * @file
 * @see People
 * @see Character
 */

/**
 * People functions.
 * @name People
 * @namespace
 * @classdesc People functions.
 */
var People = {
  
  /**
   * People settings.
   * @memberof People
   * @name settings
   * @type {object}
   * @property {number} people_level - People per village level.
   */
  settings : {
    people_level: 10,
  },
  
  
  /**
   * People available actions.
   * @memberof People
   * @name actions
   * @type {object}
   * @property {object} move - Moving somewhere.
   */
  actions : {
    move: {},
  },
  
  
  /**
   * People loop.
   * @memberof People
   * @name update
   * @method
   */
  update : function () {
    for (var char_subclass in GameApp.data.characters) {
      for (var c in GameApp.data.characters[char_subclass]) {
        var char = GameApp.data.characters[char_subclass][c];
        char.update();
      }
    }
  },
  
  
  /**
   * Count people.
   * @memberof People
   * @name count
   * @method
   */
  count : function () {
    var c = 0;
    var villages = Map.findType(5, 'buildings');
    for (var v in villages) {
      c += villages[v].level * People.settings.people_level
    }
    return c;
  },
  
 
  /**
   * Find a character by id.
   * @memberof People
   * @name findOne
   * @method
   * @param {number} id - id of the object.   
   * @return {object} The item found.
   */
  findOne : function (id) {
    for (var i in GameApp.data.characters) {
      for (var c in GameApp.data.characters[i]) {
        if (GameApp.data.characters[i][c].id == id)
          return GameApp.data.characters[i][c];
      }
    }
    return false;
  },
  
  
  /**
   * Building receive character.
   * @memberof People
   * @name enter_building
   * @method
   * @param {object} c - The character sprite received.
   * @param {object} b - The building sprite that receives the character.
   */
  enter_building : function (c, b) {
    if (typeof c === "undefined" || typeof b === "undefined" || c == null || b == null)
      return;
    var building = Map.findOne(b.custom_id, 'buildings');
    var character = People.findOne(c.custom_id);
    
    console.log("entrato", character);
    
    // Is target?
    //if ()
    
    return ;

  },
  
}




/**
 * Character class.
 * @name Character
 * @class
 * @classdesc Create a Character.
 * @property {number} id - Character id.
 * @property {number} type - Character type.
 * @property {string} name - Character name.
 * @property {object} action - Character action object.
 * @property {object} action.current - Current action.
 * @property {array} path - His path.
 * @property {number} path_target - Target tile of the path.
 * @property {object|undefined} action.target - Target object.
 * @example
 * // Actions:
 * // 1 = move - moving somewhere
 */
var Character = function () {
  // Class init.
  if (arguments[0] === 'prototype_set')
    return;
  
  // Set item ID.
  this.id = ++ GameApp.data.indexes.characters;
  
  // Type.
  this.type = 1;
  
  // Name.
  this.name = 'Ch-' + this.id;
  
  // Action.
  this.action = {};
  
}


/**
 * Character update loop.
 * @memberof Character
 * @name update
 * @instance
 * @method
 */
Character.prototype.update  = function () {
  if (this.action.current == "move")
    this.walk();
}


/**
 * Add the Character to the map.
 * @memberof Character
 * @name spawn
 * @instance
 * @method
 */
Character.prototype.spawn  = function () {
  
  if (typeof this.subclass === "undefined")
    return;
  
  // Get the tile coordinates.
  var x = 1,
      y = 1;
  
  // Create sprite and add it to "buildings" group.
  this.sprite = phaser_object.groups.characters[this.subclass].create(x, y, this.subclass + '-' + this.type);
  
  // Center anchor.
  this.sprite.anchor.setTo(0.5, 0.5);
  
  // Physics.
  game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.collideWorldBounds = true;
  
  // Save item id on the sprite.
  this.sprite.custom_id = this.id;
  
}


/**
 * Set new action.
 * @memberof Character
 * @name new_action
 * @instance
 * @method
 */
Character.prototype.new_action  = function () {
  this.cancel_action();
  
}


/**
 * Cencel action.
 * @memberof Character
 * @name cancel_action
 * @instance
 * @method
 */
Character.prototype.cancel_action  = function () {
  this.action = {};
}


/**
 * Move character following a path (loop).
 * @memberof Character
 * @name walk
 * @instance
 * @method
 */
Character.prototype.walk  = function () {
  // No path.
  if (typeof this.path === "undefined" || this.path === null) {
    return;
  }
  // Get current tile.
  var tile = Map.coord2tile(this.sprite);
  
  // Get current tile in the path.
  var tile_i = Map.get_path_tile(this.path, tile);
  if (tile_i === false) {
    return;
  }
  
  // Get next tile.
  var next_i = (tile_i + 1);
  var next = this.path[next_i];
  if (typeof next !== "undefined") {
    
    // Next tile != path_target?
    if (typeof this.path_target === "undefined" || this.path_target != next_i) {
      // New direction!
      var rect = Map.get_tile({x: next.x, y: next.y, w: Map.settings.tileWidth, h: Map.settings.tileHeight});
      game.physics.arcade.moveToXY(this.sprite, rect.centerX, rect.centerY, 100);
      
      this.path_target = next_i;
      console.log("ora sono in " + tile.x + ":" + tile.y + " -> ", next);
    }
    
  } else {
    // Reached target!
    this.sprite.body.velocity.x = 0;
    this.sprite.body.velocity.y = 0;
    delete this.path;
    delete this.path_target;
    console.log("arrivato!");
  }
  
  
  
  
}


/**
 * Citizen class (children of Character).
 * @name Citizen
 * @class
 * @classdesc Create a Citizen.
 * @see Character
 * @param {number} type - Citizen type.
 * @param {object} home - Home building.
 * @property {string} subclass - Subclass name = "citizen".
 * @property {number} type - Citizen type.
 * @property {object} home - Home building.
 * @property {string} name - Citizen name.
 */
var Citizen = function (type, home) {
  
  // Call the parent constructor.
  Character.call(this);

  // Set subclass name.
  this.subclass = "citizen";
  
  // Type.
  this.type = type;
  
  // Home id.
  this.home = home;
  
  // Name.
  this.name = 'Cz-' + this.id;

  // Spawn!
  this.spawn();
  
}
Citizen.prototype = new Character('prototype_set');
Citizen.prototype.constructor = Citizen;


/**
 * Citizen update loop.
 * @memberof Citizen
 * @name update
 * @instance
 * @method
 */
Citizen.prototype.update  = function () {
  Character.prototype.update.call(this);
  
  // Check action.
  if (typeof this.action.current === "undefined")
    this.new_action();
}


/**
 * Character.spawn() >> Citizen.
 * @memberof Citizen
 * @name spawn
 * @instance
 * @method
 */
Citizen.prototype.spawn  = function () {
  Character.prototype.spawn.call(this);
  
  // Setting the size.
  this.sprite.width = Map.settings.character.citizen.width;
  this.sprite.height = Map.settings.character.citizen.height;
  
  // Spawn at home.
  this.sprite.x = this.home.sprite.x;
  this.sprite.y = this.home.sprite.top - 50;
  
}


/**
 * Set new action.
 * @memberof Citizen
 * @name new_action
 * @instance
 * @method
 */
Citizen.prototype.new_action  = function () {
  Character.prototype.new_action.call(this);
  
  // Move.
  var action = 'move';
  // Where?
  // Select random factory.
  var building = Buildings.getRandom();
  this.action.target = building;
  this.action.current = action;
  
  // Get path.
  Map.find_path(this, building);
  
}


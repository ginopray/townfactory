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
    work: {},
    sleep: {}
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
    
    // Is target?
    if (typeof character.action.target !== "undefined") {
      if (building.id == character.action.target.id) {
        console.log("entrato!");
        // Start working.
        character.start_work(building);
      }
      
    }
    
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
 * @property {array} action.path - His path.
 * @property {number} action.path_target - Target tile of the path.
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
  this.type = 0;
  
  // Name.
  this.name = 'Ch-' + this.id;
  
  // Action.
  this.action = {};
  
  // Speed
  this.speed = 300;
  
}


/**
 * Get character full name.
 * @memberof Character
 * @name fullname
 * @instance
 * @method
 */
Character.prototype.fullname = function () {
  return this.name;
}


/**
 * Character update loop.
 * @memberof Character
 * @name update
 * @instance
 * @method
 */
Character.prototype.update = function () {
  if (this.action.current == "move")
    this.walk();
  else if (this.action.current == "work")
    this.work();
  else if (this.action.current == "sleep")
    this.sleep();
}


/**
 * Add the Character to the map.
 * @memberof Character
 * @name spawn
 * @instance
 * @method
 */
Character.prototype.spawn = function () {
  
  if (typeof this.subclass === "undefined")
    return;
  
  // Create sprite and add it to "buildings" group.
  var x = -1,
      y = -1;
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
Character.prototype.new_action = function () {
  this.action = {
    date_ini: Date.now()
  };
  
  
}


/**
 * Cencel action.
 * @memberof Character
 * @name cancel_action
 * @instance
 * @method
 */
Character.prototype.cancel_action = function () {
  this.action = {};
}


/**
 * Move character following a path (loop).
 * @memberof Character
 * @name walk
 * @instance
 * @method
 */
Character.prototype.walk = function () {
  // No path.
  if (typeof this.action.path === "undefined" || this.action.path === null) {
    return;
  }
  // Get current tile.
  var tile = Map.coord2tile({x: this.sprite.x, y: this.sprite.y});
  
  // Get current tile in the path.
  var tile_i = Map.get_path_tile(this.action.path, tile);
  if (tile_i === false) {
    if (typeof this.action.path_target === "undefined")
      tile_i = -1;
    else {
      //console.log("salto");
      return;
    }
  }
  
  // Get next tile.
  var next_i = (tile_i + 1);
  var next = this.action.path[next_i];
  if (typeof next !== "undefined") {
    
    // Next tile != path_target?
    if (typeof this.action.path_target === "undefined" || this.action.path_target != next_i) {
      // New direction!
      var rect = Map.get_tile({x: next.x, y: next.y, w: Map.settings.tileWidth, h: Map.settings.tileHeight});
      game.physics.arcade.moveToXY(this.sprite, rect.centerX, rect.centerY, this.speed);
      
      this.action.path_target = next_i;
      //console.log("ora sono in " + tile.x + ":" + tile.y + " -> ", next);
    }
    
  } else {
    // Stop walk.
    this.stop_walk();
  }
  
}


/**
 * Stop character.
 * @memberof Character
 * @name stop
 * @instance
 * @method
 */
Character.prototype.stop = function () {
  this.sprite.body.velocity.x = 0;
  this.sprite.body.velocity.y = 0;
  
}


/**
 * Start walk.
 * @memberof Character
 * @name start_walk
 * @instance
 * @method
 */
Character.prototype.start_walk = function (building) {
  // Where?
  this.action.target = building;
  // Get path.
  Map.find_path(this, building);
  // Set current action.
  this.action.current = "move";
}


/**
 * Stop walk.
 * @memberof Character
 * @name stop_walk
 * @instance
 * @method
 */
Character.prototype.stop_walk = function () {
  // Stop sprite.
  this.stop();
  
  // Reached target?
  var tile = Map.coord2tile({x: this.sprite.x, y: this.sprite.y});
  var building = Map.find_by_pos(tile.x, tile.y, 'buildings');
  // I'm in a building?
  if (building !== false) {
    // This building is the target?
    if (building.id == this.action.target.id) {
      // Home: sleep!
      if (building.id == this.home.id) {
        // Sleep!
        this.new_action('sleep');        
      } else {
        // Work!
        this.new_action('work');
      }
      return;
    }
  }
  
  this.cancel_action();
  
}


/**
 * Citizen class (children of Character).
 * @name Citizen
 * @class
 * @classdesc Create a Citizen.
 * @augments Character
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
  
  // New action!
  this.new_action();
  
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
Citizen.prototype.update = function () {
  Character.prototype.update.call(this);
  
  // Check action.
  //if (typeof this.action.current === "undefined")
    //this.new_action();
}


/**
 * Character.spawn() >> Citizen.
 * @memberof Citizen
 * @name spawn
 * @instance
 * @method
 */
Citizen.prototype.spawn = function () {
  Character.prototype.spawn.call(this);
  
  // Setting the size.
  this.sprite.width = Map.settings.character.citizen.width;
  this.sprite.height = Map.settings.character.citizen.height;
  
  // Spawn at home.
  this.sprite.x = this.home.sprite.x;
  this.sprite.y = this.home.sprite.top - 50;
  
  // Random color.
  this.sprite.tint = Math.random() * 0xffffff;
  
}


/**
 * Set new action.
 * @memberof Citizen
 * @name new_action
 * @instance
 * @method
 * @param {string|undefined} action - Action to do.
 */
Citizen.prototype.new_action = function (action, vars) {
  Character.prototype.new_action.call(this);
  
  if (typeof vars === "undefined")
    vars = {};
  
  // Set action.
  if (typeof action === "undefined") {
    action = 'move';
  }
  
  // Move.
  if (action == "move") {
    if (typeof vars.target === "undefined")
      var target = Buildings.getRandom();
    else
      var target = vars.target;
    this.start_walk(target);
  
  // Work.
  } else if (action == "work") {
    this.start_work();
    
  // Sleep.
  } else if (action == "sleep") {
    this.start_sleep();
  }
  
  
  console.log("new action: " + action);
  
}


/**
 * Start work.
 * @memberof Citizen
 * @name start_work
 * @instance
 * @method
 * @param {object} building - Building.
 */
Citizen.prototype.start_work = function (building) {
 this.action.current = "work";
}


/**
 * Citizen work (loop).
 * @memberof Citizen
 * @name work
 * @instance
 * @method
 */
Citizen.prototype.work = function () {
  var working_time = 1;
  if ((Date.now() - this.action.date_ini) / 1000 > working_time) {
    this.stop_work();
  }
}


/**
 * Citizen stop work.
 * @memberof Citizen
 * @name stop_work
 * @instance
 * @method
 */
Citizen.prototype.stop_work = function () {

  this.go_home();
  
}


/**
 * Start sleep.
 * @memberof Citizen
 * @name start_sleep
 * @instance
 * @method
 * @param {object} building - Building.
 */
Citizen.prototype.start_sleep = function () {
 this.action.current = "sleep";
}


/**
 * Citizen sleep (loop).
 * @memberof Citizen
 * @name sleep
 * @instance
 * @method
 */
Citizen.prototype.sleep = function () {
  var sleeping_time = 1;
  if ((Date.now() - this.action.date_ini) / 1000 > sleeping_time) {
    this.stop_sleep();
  }
}


/**
 * Citizen stop sleep.
 * @memberof Citizen
 * @name stop_sleep
 * @instance
 * @method
 */
Citizen.prototype.stop_sleep = function () {
  
  this.new_action();  
  
}



/**
 * Citizen go home.
 * @memberof Citizen
 * @name go_home
 * @instance
 * @method
 */
Citizen.prototype.go_home = function () {
  console.log("go home");
  this.new_action("move", {
    target: this.home
  });

  
}

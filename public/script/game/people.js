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
   * @property {object} characters - Characters settings.
   * @property {object} characters.citizen - Citizens settings.
   * @property {number} characters.citizen.speed - Citizen speed.
   * @property {number} characters.citizen.working_time - Working time.
   * @property {number} characters.citizen.sleeping_time - Sleeping time.
   * @property {number} characters.citizen.eating_time - Eating time.
   * @property {number} characters.citizen.efficiency - How much a citizen reduces the working time, in %.
   */
  settings : {
    people_level: 10,
    characters: {
      citizen: {
        speed: 40,
        working_time: 8,
        sleeping_time: 6,
        eating_time: 2,
        efficiency: 15,
      }
    }
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
    sleep: {},
    eat: {}
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
 * @property {array}  action.path - His path.
 * @property {number} action.path_target - Target tile of the path.
 * @property {object|undefined} action.target - Target object of the action.
 * @property {object} talking - Character talking object.
 * @property {object} talking.sprite - Talking sprite.
 * @example
 * // Actions:
 * // 1 = move - moving somewhere
 */
var Character = function () {
  // Class init.
  if (arguments[0] === 'prototype_set')
    return;
  
  // Set entity.
  this.entity = 'Character';
  
  // Set item ID.
  this.id = ++ GameApp.data.indexes.characters;
  
  // Type.
  this.type = 0;
  
  // Name.
  this.name = 'Character #' + this.id;
  
  // Action.
  this.action = {};
  
  // Speed
  this.speed = People.settings.characters.citizen.speed;
  
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
  // Action:
  if (this.action.current == "move")
    this.walk();
  else if (this.action.current == "work")
    this.work();
  else if (this.action.current == "sleep")
    this.sleep();
  else if (this.action.current == "eat")
    this.eat();
  
  // Talking.
  if (typeof this.talking !== "undefined" && typeof this.talking.sprite !== "undefined") {
    this.talking.sprite.x = Math.floor(this.sprite.x + this.sprite.width / 2);
    this.talking.sprite.y = Math.floor(this.sprite.y + this.sprite.height / 2);
  }
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
  this.sprite.body.collideWorldBounds = false;
  
  // Save item id on the sprite.
  this.sprite.custom_id = this.id;
  
  // Info onclick.
  this.sprite.inputEnabled = true;
  this.sprite.events.onInputDown.add(function(){
    Map.select(this);
  }, this);
  
}


/**
 * Stop character.
 * @memberof Character
 * @name talk
 * @instance
 * @method
 * @param {string} message - The message.
 */
Character.prototype.talk = function (message) {
    
  this.stop_talk();
  
  var style = {
    font: "16px Arial",
    fontWeight: 'bold',
    fill: "#222",
    wordWrap: true,
    wordWrapWidth: this.sprite.width,
    align: "center",
    backgroundColor: "#f9f9f9"
  };
  this.talking = {
    sprite: game.add.text(0, 0, message, style)
  }
  this.talking.sprite.anchor.set(0.5);
  
}


/**
 * Stop character.
 * @memberof Character
 * @name talk
 * @instance
 * @method
 * @param {string} message - The message.
 */
Character.prototype.stop_talk = function () {
  // Destroy sprite.
  if (typeof this.talking !== "undefined" && typeof this.talking.sprite !== "undefined") { 
    this.talking.sprite.destroy();
  }
  // Cancel object.
  this.talking = {};
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
      // Out of path (cutting path with diagonals).
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
        this.new_action('sleep', {building: building});        
      } else {
        // Work!
        this.new_action('work', {building: building});
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
  this.name = 'Citizen #' + this.id;

  // Spawn!
  this.spawn();
  
  // Go work!
  this.go_work();
  
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
    this.start_work(vars.building);
    
  // Sleep.
  } else if (action == "sleep") {
    this.start_sleep();

  // Eat.
  } else if (action == "eat") {
    this.start_eat();
  }

  
  //console.log("new action for " + this.fullname() + ": " + action);
  if (action != "move") {
    this.talk(action);  
  } else {
    this.stop_talk();
  }
  
  
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
 // Set target building.
 this.action.target = building;
 // Increment workers count.
 building.workers.count ++;
  
 // Move sprite
 this.sprite.left = building.sprite.left + ((building.workers.count - 1) * (Map.settings.character.citizen.width / 2));
 this.sprite.bottom = building.sprite.bottom;
}


/**
 * Citizen work (loop).
 * @memberof Citizen
 * @name work
 * @instance
 * @method
 */
Citizen.prototype.work = function () {
  var working_time = People.settings.characters.citizen.working_time;
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
  // Decrease workers count..
  this.action.target.workers.count --;
  // New action: go home!
  this.go_home();
  
}


/**
 * Start sleep.
 * @memberof Citizen
 * @name start_sleep
 * @instance
 * @method
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
  var sleeping_time = People.settings.characters.citizen.sleeping_time;
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
  
  // Eat!
  this.new_action('eat');
  
}


/**
 * Start eat.
 * @memberof Citizen
 * @name start_eat
 * @instance
 * @method
 */
Citizen.prototype.start_eat = function () {
 this.action.current = "eat";
}


/**
 * Citizen eat (loop).
 * @memberof Citizen
 * @name eat
 * @instance
 * @method
 */
Citizen.prototype.eat = function () {
  var eating_time = People.settings.characters.citizen.eating_time;
  if ((Date.now() - this.action.date_ini) / 1000 > eating_time) {
    // Eat!
    var building = this.home;
    if (!building.gather(4, 1)) {
      // Restart eating.
      this.new_action('eat');
      this.talk(Main.t('Hungry!'));
    } else {
      this.stop_talk();
      this.stop_eat();  
    }
    
  }
}


/**
 * Citizen stop eat.
 * @memberof Citizen
 * @name stop_eat
 * @instance
 * @method
 */
Citizen.prototype.stop_eat = function () {
  
  this.go_work();
  
}


/**
 * Citizen go home.
 * @memberof Citizen
 * @name go_home
 * @instance
 * @method
 */
Citizen.prototype.go_home = function () {
  //console.log("go home");
  this.new_action("move", {
    target: this.home
  });

}


/**
 * Citizen go work.
 * @memberof Citizen
 * @name go_work
 * @instance
 * @method
 */
Citizen.prototype.go_work = function () {
  //console.log("go work");
  var building = Buildings.getRandom(this.home.id);
  this.new_action("move", {
    target: building
  });

}

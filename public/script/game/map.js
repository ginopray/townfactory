/**
 * Contains the Map class.
 * @file
 * @see Map
 */

/**
 * Map class.
 * @name Map
 * @namespace
 * @classdesc Map class.
 */
var Map = {
  
  /**
   * Map settings object.
   * @memberof Map
   * @name settings
   * @type {object}
   * @property {number} tileWidth - The tile width in px.
   * @property {number} tileHeight - The tile height in px.
   * @property {number} helperWidth - The helper sprite width in px.
   * @property {number} helperHeight - The helper sprite height in px.
   * @property {number} resourceWidth - The resource width in px.
   * @property {number} resourceHeight - The resource height in px.
   * @property {number} friction - The friction for things.
   * @property {number} friction_rate - The friction rate in ms.
   * @example var friction = Map.settings.friction;
   */
  settings : {
    tileWidth : 48,
    tileHeight : 48,
    helperWidth : 48,
    helperHeight : 48,
    resourceWidth: 24,
    resourceHeight: 24,
    friction: 50,
    friction_rate: 50, // ms
  },

  
  /**
   * Initialize the map.
   * @memberof Map
   * @name init
   * @method   
   */
  init : function () {

    // Continue loop.
    game.stage.disableVisibilityChange = true;
    
    // Set world size.
    game.world.setBounds(0, 0, GameApp.data.map.width * Map.settings.tileWidth, GameApp.data.map.height * Map.settings.tileHeight);
    
    // Center camera.
    game.camera.x = game.world.width / 2;
    game.camera.y = game.world.height / 2;
    
    // Add Physics.
    game.physics.startSystem(Phaser.Physics.ARCADE);
    //game.physics.arcade.forceX = true;
    
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
    
    // Create the grid.
    Map.grid();
    
    // Create mouse tile selection rectangle.
    phaser_object.inputs.mouse.selection = {
      tile: new Phaser.Rectangle(
        0,
        0,
        Map.settings.tileWidth,
        Map.settings.tileHeight
      ),
      color: 'rgba(244, 67, 54, .3)'
    };
    
    
    // Set events:
    // Mouse down:
    game.input.onDown.add(function(pointer){
      Actions.click(pointer);
    }, this);
    
    // Mouse wheel.
    game.input.mouse.mouseWheelCallback = function(e){
      Actions.wheel(e);
    };
    
    // Initialize the keyboard.
    Map.set_keyboard();
    
    // Background color
    //game.stage.backgroundColor = "#424242";
    
    Map.get();
    
  },
  
  
  /**
   * Update the map.
   * @memberof Map
   * @name update
   * @method
   */
  update : function () {
    
    // Keyboard.
    var key;
    for (var k in phaser_object.inputs.keyboard.keys) {
      key = phaser_object.inputs.keyboard.keys[k];
      if (key.isDown) {
        // temp camera:
        if (key.event.key.toLowerCase() == "arrowup")
        {
            game.camera.y -= 4;
        }
        else if (key.event.key.toLowerCase() == "arrowdown")
        {
            game.camera.y += 4;
        }

        if (key.event.key.toLowerCase() == "arrowleft")
        {
            game.camera.x -= 4;
        }
        else if (key.event.key.toLowerCase() == "arrowright")
        {
            game.camera.x += 4;
        }
        
      }
        
    }
    
    // Camera.
    if (game.input.activePointer.isDown) {
      if (game.origDragPoint) {
        // move the camera by the amount the mouse has moved since last update
        game.camera.x += game.origDragPoint.x - game.input.activePointer.position.x;
        game.camera.y += game.origDragPoint.y - game.input.activePointer.position.y;
      }
      // set new drag origin to current position
      game.origDragPoint = game.input.activePointer.position.clone();
    } else {
      game.origDragPoint = null;
    }
      
    
    // Loop resources.
    for (var r in GameApp.data.resources) {
      coords = Map.coord2tile({x: GameApp.data.resources[r].sprite.centerX, y: GameApp.data.resources[r].sprite.centerY });
      // Delete resources out of the road.
      if (!Map.find_road(coords.x, coords.y)) {
        GameApp.data.resources[r].delete();
      } else {
        GameApp.data.resources[r].sprite.custom_overlap = new Array();
      }
    }
    
    // Resources overlapping.
    game.physics.arcade.overlap(
      phaser_object.groups.resources,
      phaser_object.groups.resources,
      Map.resource_overlap
    );
    
    // Resources and roads overlapping.
    game.physics.arcade.overlap(
      phaser_object.groups.resources,
      phaser_object.groups.roads,
      Roads.flow,
      Map.full_overlap
    );
    
    // Collisions.
    // Resource collide with building.
    game.physics.arcade.collide(
      phaser_object.groups.resources,
      phaser_object.groups.buildings,
      Production.receive
    );
    // Resource collide with resource.
    /*game.physics.arcade.collide(
      phaser_object.groups.resources, 
      phaser_object.groups.resources
    );*/
    
    var coords = Map.coord2tile({x: game.input.mousePointer.worldX, y: game.input.mousePointer.worldY});
    
    // Update mouse selection position.
    if (typeof phaser_object.inputs.mouse.selection.tile !== "undefined") {
      phaser_object.inputs.mouse.selection.tile.x = (coords.x - 1) * Map.settings.tileWidth;
      phaser_object.inputs.mouse.selection.tile.y = (coords.y - 1) * Map.settings.tileHeight;
    }
    
    // Update helper
    phaser_object.helper.centerX = ((coords.x - 1) * Map.settings.tileWidth) + (Map.settings.tileWidth / 2);
    phaser_object.helper.centerY = ((coords.y - 1) * Map.settings.tileHeight) + (Map.settings.tileHeight / 2);

    // Buildings production.
    for (var b in GameApp.data.buildings) {
      GameApp.data.buildings[b].produce();
    }
    
  },
  
  
  /**
   * Initialize the keyboard.
   * @memberof Map
   * @name set_keyboard
   * @method   
   */
  set_keyboard : function () {

    var keys = new Array();
    // Arrows.
    keys.push( game.input.keyboard.addKey(Phaser.Keyboard.UP) );
    keys.push( game.input.keyboard.addKey(Phaser.Keyboard.DOWN) );
    keys.push( game.input.keyboard.addKey(Phaser.Keyboard.LEFT) );
    keys.push( game.input.keyboard.addKey(Phaser.Keyboard.RIGHT) );    
    // WASD.
    keys.push( game.input.keyboard.addKey(Phaser.Keyboard.W) );
    keys.push( game.input.keyboard.addKey(Phaser.Keyboard.A) );
    keys.push( game.input.keyboard.addKey(Phaser.Keyboard.S) );
    keys.push( game.input.keyboard.addKey(Phaser.Keyboard.D) );
    
    for (var k in keys) {
      keys[k].onDown.add(function(e){
        Actions.keyPress(e);
      }, this);      
    }
    
    // Set global array.
    phaser_object.inputs.keyboard.keys = keys;

  },
  
  
  /**
   * Get the map, based on data stored in "GameApp.data".
   * @memberof Map
   * @name get
   * @method   
   */
  get : function () {
    
    // Spawn buildings.
    for (var b in GameApp.data.buildings) {
      GameApp.data.buildings[b].spawn();
    }
    // Spawn resources.
    for (var r in GameApp.data.resources) {
      GameApp.data.resources[r].spawn();
    }
    
  },

  
  /**
  * Set the map grid. Attach tiles (rectangles) to phaser_object.grid.
  * @memberof Map
  * @name grid
  * @method
  */
  grid : function () {
    
    var x,
        y;
    var margin_right = GameApp.data.map.width * Map.settings.tileWidth;
    var margin_bottom = GameApp.data.map.height * Map.settings.tileHeight;
    for (x = 1; x < GameApp.data.map.width; x ++) {
      phaser_object.grid.push({
        tile: new Phaser.Line(x * Map.settings.tileWidth, 0, x * Map.settings.tileWidth, margin_bottom)
      });
    }
    for (y = 1; y < GameApp.data.map.height; y ++) {
      phaser_object.grid.push({
        tile: new Phaser.Line(0, y * Map.settings.tileHeight, margin_right, y * Map.settings.tileHeight)
      });
    }    
    
  },
  
  
  /**
  * Simulate friction: decelerate things on the map.
  * Sets a timeout based on Map.settings.friction_rate while sprite exists.
  * @memberof Map
  * @name friction
  * @method
  * @param {object} sprite - The sprite object.
  */
  friction : function (sprite) {
    if (typeof sprite === "undefined" || sprite === null || typeof sprite.body === "undefined" || sprite.body === null)
      return;
    var f = Map.settings.friction;
    var abs_x = Math.abs(sprite.body.velocity.x);
    var abs_y = Math.abs(sprite.body.velocity.y);
    if (abs_x > 0 || abs_y > 0) { 
      if (abs_x <= f)
        sprite.body.velocity.x = 0;
      else
        sprite.body.velocity.x -= f * (abs_x / sprite.body.velocity.x);
      if (abs_y <= f)
        sprite.body.velocity.y = 0;
      else
        sprite.body.velocity.y -= f * (abs_y / sprite.body.velocity.y);
    }
    setTimeout(function(){Map.friction(sprite)}, Map.settings.friction_rate);
  },
  
  
  /**
  * Get a tile (rectangle).
  * @memberof Map
  * @name get_tile
  * @method
  * @param {object} tile - x:y tile coordinates.
  * @param {string} color - html color.
  * @return {object} phaser rectangle.
  */
  get_tile : function (tile, color) {
    var rect = new Phaser.Rectangle(
      (tile.x - 1) * Map.settings.tileWidth,
      (tile.y - 1) * Map.settings.tileHeight,
      tile.w,
      tile.h
    );
    //phaser_object.grid.push({tile: rect, color: color});
    return rect;
  },
  
  
  /**
  * Get the tile coordinates from px coords.
  * @memberof Map
  * @name coord2tile
  * @method
  * @param {object} coords - x:y px coordinates.
  * @return {object} x:y tile coordinates.
  */
  coord2tile : function(coords) {
    return {
      x: (Math.floor(coords.x / Map.settings.tileWidth) + 1),
      y: (Math.floor(coords.y / Map.settings.tileHeight) + 1)
    }
  },
  
  
  /**
   * Check if a slot is free.
   * @memberof Map
   * @name check_free_slot
   * @method
   * @param {number} x - X position to find.
   * @param {number} y - Y position to find.
   * @return {boolean}
   */
  check_free_slot : function (x, y) {
    var find = Map.find(x, y);
    for (var type in find) {
      if (find[type] !== false) {
        return false;
      }
    }
    return true;
  },
  
  
  /**
   * Find a game object on the map.
   * @memberof Map
   * @name find
   * @method
   * @param {number} x - X position to find.
   * @param {number} y - Y position to find.
   * @param {string} what - Type of item to find, ie. "buildings". undefined = check all.
   * @return {object} Object containing items found.
   */
  find : function (x, y, what) {
    var all = (typeof what === "undefined"),
        ret = {};
    if (what == "buildings" || all) {
      ret.buildings = Map.find_by_pos(x, y, 'buildings');
    }
    if (what == "resources" || all) {
      ret.resources = Map.find_by_pos(x, y, 'resources');
    }
    if (what == "roads" || all) {
      ret.roads = Map.find_road(x, y);
    }
    return ret;
  },

  
  /**
   * Find object on the map.
   * @memberof Map
   * @name find_by_pos
   * @method
   * @param {number} x - X position to find.
   * @param {number} y - Y position to find.
   * @param {string} what - what to search.
   * @return {object} The object.
   */
  find_by_pos : function (x, y, what) {
    var ret,
        cX, cY;
    for (var b in GameApp.data[what]) {
      ret = GameApp.data[what][b];
      // Check all size of the building.
      for (cX = ret.pos_x; cX < ret.pos_x + ret.width; cX ++) {
        for (cY = ret.pos_y; cY < ret.pos_y + ret.height; cY ++) {
          if (cX == x && cY == y) {
            return ret;   
          }
        }
      }
    }
    return false;
  },
  
  
  /**
   * Find a road on the map.
   * @memberof Map
   * @name find_road
   * @method
   * @param {number} x - X position to find.
   * @param {number} y - Y position to find.
   * @return {object} The building.
   */
  find_road : function (x, y) {
    if (typeof GameApp.data.roads.items[x] === "undefined" || typeof GameApp.data.roads.items[x][y] === "undefined")
      return false;
    return GameApp.data.roads.items[x][y];
  },
  
  
  /**
   * Find a game object by id.
   * @memberof Map
   * @name findOne
   * @method
   * @param {number} id - id of the object.   
   * @param {string} what - Type of item to find, ie. "buildings".
   * @return {object} The item found.
   */
  findOne : function (id, what) {
    for (var i in GameApp.data[what]) {
      if (GameApp.data[what][i].id == id)
        return GameApp.data[what][i];
    }
    return false;
  },
  
  
  /**
   * Find a game object by type.
   * @memberof Map
   * @name findType
   * @method
   * @param {number} type - type of the object.   
   * @param {string} what - Type of item to find, ie. "buildings".
   * @return {array} Array of found object.
   */
  findType : function (type, what) {
    ret = new Array();
    for (var i in GameApp.data[what]) {
      if (GameApp.data[what][i].type == type)
        ret.push( GameApp.data[what][i] );
    }
    return ret;
  },
  
  
  /**
   * Check full sprites overlapping.
   * @memberof Map
   * @name full_overlap
   * @method
   * @param {object} item - Item to check (sprite).
   * @param {object} container - Container sprite.
   * @return {boolean} Returns true if full overlapping.
   */
  full_overlap : function (item, container) {
    var boundsA = item.getBounds();
    var boundsB = container.getBounds();
    //return boundsB.containsRect(boundsA);
    return boundsB.contains(boundsA.centerX, boundsA.centerY);
  },
  

  /**
  * Check resources overlapping.
  * Set "custom_overlap" property to the sprite.
  * @memberof Map
  * @name resource_overlap
  * @method
  * @param {object} r1 - Resource sprite 1.
  * @param {object} r2 - Resource sprite 2.
  */
  resource_overlap : function (r1, r2) {
    r1.custom_overlap.push(r2);
    r2.custom_overlap.push(r1);
  }
  

};


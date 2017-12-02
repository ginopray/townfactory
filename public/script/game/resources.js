/**
 * Contains Resources namespace and Resource class.
 * @file
 * @see Resources
 * @see Resource
 */

/**
 * Resources functions.
 * @name Resources
 * @namespace
 * @classdesc Resources functions.
 */
var Resources = {
  
  /**
   * Resouces loop.
   * @memberof Resources
   * @name update
   * @method
   */
  update : function () {
    var coords;
    var count = 0;
    for (var r in GameApp.data.resources) {
      var resource_road_ground;
      if (typeof GameApp.data.resources[r].sprite.custom_road !== "undefined") {
        resource_road_ground = GameApp.data.resources[r].sprite.custom_road.custom_ground;
      }
      
      coords = Map.coord2tile({x: GameApp.data.resources[r].sprite.centerX, y: GameApp.data.resources[r].sprite.centerY });
      var find_road = Map.find_road(coords.x, coords.y, GameApp.data.resources[r].sprite.custom_ground);//, resource_road_ground
      
      // Delete resources out of the road.
      if (!find_road || 
          (typeof GameApp.data.resources[r].sprite.custom_road !== "undefined" && 
           find_road.ground != resource_road_ground && 
           find_road.group_id != GameApp.data.resources[r].sprite.custom_road.custom_group_id
          )) {
        GameApp.data.resources[r].delete();
        
      } else {
        // Clear resources vs resources overlap.
        GameApp.data.resources[r].sprite.custom_overlap = new Array();
        // Subway!
        if (typeof GameApp.data.resources[r].sprite.custom_ground !== "undefined" && 
            GameApp.data.resources[r].sprite.custom_ground < 0) {
          //GameApp.data.resources[r].sprite.tint = 0xff0000;
          GameApp.data.resources[r].sprite.alpha = 0.2;
        } else {
          //GameApp.data.resources[r].sprite.tint = 0xffffff;
          GameApp.data.resources[r].sprite.alpha = 1;
        }
        count ++;
      }
    }
    jQuery('#debug').html('Resources: ' + count);
  },
  
  
  /**
   * Get random resource ID from list.
   * @memberof Resources
   * @name getRandom
   * @method
   * @param {number} value - The resource value to select.
   * @returns {number} The resource ID.
   */
  getRandom : function (filters) {
    // Get value 1 resources.
    var resources = Database.get('resources', filters);
    // No resources found: return false.
    if (resources.length == 0) return false;
    // Select random resource.
    var rand_i = Math.floor(Math.random() * resources.length);
    // Return resource id.
    return resources[rand_i].id;
  },
  
  
  /**
   * Create a new istance of a resource.
   * @memberof Resources
   * @name create
   * @method
   * @param {number} type - The resource type.
   */
  create : function (type, building, station) {
    
    var x = station.sprite.x;
    var y = station.sprite.y;
    
    var resource = new Resource(type);
    resource.spawn(x, y);
    // Append new resource to GameApp.data.resources.
    GameApp.data.resources.push(
      resource
    );
  },
  
  
  /**
   * Get full name and link for a resource.
   * @memberof Resources
   * @name fullname
   * @method
   * @param {number} type - The resource type.
   */
  fullname : function (type, vars) {
    if (typeof vars === "undefined")
      vars = {};
    var full_name = Main.t('resource-' + type);
    //if (vars.link !== false) {
      // Insert link.
    //}
    return full_name;
  },
  
  
};




/**
 * Resource class.
 * @name Resource
 * @class
 * @classdesc Create a resource instance.
 * @param {number} type - Resource type.
 * @property {number} type - Resource ID.
 * @property {object} sprite - Phaser.io sprite object
 * @property {array} sprite.custom_overlap - Overlapped resources.
 * @property {object} sprite.custom_road - Overlapped road.
 */
var Resource = function (type) {
  
  // FIRST!
  // Setting defaults.
  var default_resource = Database.get('resources', {
      id : type
    });
  if (default_resource.length == 0) {
    console.log("no data for resource: " + type, default_resource);
    return;
  }
  
  // Set defaults!
  Object.assign(this, default_resource[0]);
  
  // Set item ID.
  this.id = ++ GameApp.data.indexes.buildings;
  
  this.type = type;
};

/**
 * Add the resource to the map.
 * @memberof Resource
 * @name spawn
 * @instance
 * @method
 */
Resource.prototype.spawn  = function (x, y) {

  //console.log("spawn", this);
  
  // Create sprite and add it to "buildings" group.
  this.sprite = phaser_object.groups.resources.create(x, y, 'resource-' + this.type);
  
  // Save item id on the sprite.
  this.sprite.custom_id = this.id;
  
  this.sprite.custom_overlap = new Array();
  
  // Initial speed.
  this.sprite.body.velocity.y = 0;
  this.sprite.body.velocity.x = 0;
  
  // Center anchor.
  this.sprite.anchor.setTo(0.5, 0.5);
  
  // Setting the size.
  this.sprite.width = Map.settings.resourceWidth;
  this.sprite.height = Map.settings.resourceHeight;
  
  // Physics.
  game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
  this.sprite.body.collideWorldBounds = true;
  
  // Bounces.
  this.sprite.body.bounce.setTo(0.5, 0.5);
  
  // Start friction loop.
  // Map.friction(this.sprite);


};


/**
 * Select this resource.
 * @memberof Resource
 * @name select
 * @instance
 * @method 
 */
Resource.prototype.select = function () {
  console.log("resource", this);
}


/**
 * Delete istance of a resource.
 * @memberof Resource
 * @name delete
 * @instance
 * @method 
 */
Resource.prototype.delete = function () {
  phaser_object.groups.resources.remove(this.sprite);
  //this.sprite.destroy();
  for (var i in GameApp.data.resources) {
    if (GameApp.data.resources[i].id == this.id) {
      GameApp.data.resources.splice(i, 1);
      return;
    } 
  }
}


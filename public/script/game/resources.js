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
   * Get random resource ID from list.
   * @memberof Resources
   * @name getRandom
   * @method
   * @param {number} value - The resource value to select.
   * @returns {number} The resource ID.
   */
  getRandom : function (value) {
    // Get value 1 resources.
    var resources = Database.get('resources', {
      value : 1
    });
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
  create : function (type, x, y) {
    var resource = new Resource(type);
    resource.spawn(x, y);
    // Append new resource to GameApp.data.resources.
    GameApp.data.resources.push(
      resource
    );
  }

};




/**
 * Resource class.
 * @name Resource
 * @class
 * @classdesc Create a resource instance.
 * @param {number} type - Resource type.
 * @property {number} type - Resource ID.
 * @property {object} sprite - Phaser.io sprite object
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
  
  this.id = 'to define';
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
  // Create sprite and add it to "buildings" group.
  this.sprite = phaser_object.groups.resources.create(x, y, 'resource-' + this.type);
  
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
  
  // Test:initial speed.
  this.sprite.body.velocity.y = -350;
  this.sprite.body.velocity.x = 350;
  
  // Set friction.
  Map.friction(this.sprite);
  
};


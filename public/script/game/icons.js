/**
 * Contains Icons namespace and Icons class.
 * @file
 * @see Icons
 * @see Icon
 */

/**
 * Icons functions.
 * @name Icons
 * @namespace
 * @classdesc Icons functions.
 */
var Icons = {
  
  /**
   * Update icons.
   * @memberof Icons
   * @name alternative_update
   * @method
   */
  alternative_update : function () {

    
    return false;
    
    
    // Reset icons.
    for (var i in phaser_object.icons) {
      phaser_object.icons[i].sprite.destroy();
    }
    phaser_object.icons = new Array();
    
    var b,
        building,
        r,
        req;
    // Check requests.
    for (b in GameApp.data.buildings) {
      building = GameApp.data.buildings[b];
      if (typeof building.request === "undefined" || building.request.length == 0) 
        continue;

      // Icon type 1: building request.
      for (var r in building.request) {
        req = building.request[r];
        console.log(building.name + " chiede " + req.resource);
        phaser_object.icons.push(new Icon(1, building));
        //req.amount
        //Board.get_resource_image(req.resource, {class: 'info-resource__image'});
      }
      
    }
  
    // Check needed resources for production.
    
    // Check outcoming stations for producing factories.
    
    // Check full warehouse.
  
    
  }
  
}




/**
 * Icon class.
 * @name Icon
 * @class
 * @classdesc Create an icon instance.
 * @param {number} type - type of icon
 * @param {object} ref - Reference object of the icon.
 */
var Icon = function (type, ref) {
  this.type = type;
  this.ref = ref;
  
  this.spawn();
}


/**
 * Add the icon to the map.
 * @memberof Icon
 * @name spawn
 * @instance
 * @method
 */
Icon.prototype.spawn  = function () {
  
  // Create sprite and add it to "buildings" group.
  this.sprite = phaser_object.groups.buildings.create(this.ref.sprite.x, this.ref.sprite.y, 'icon-' + this.type);
  // Center anchor.
  this.sprite.anchor.setTo(0.5, 0.5);
  
}
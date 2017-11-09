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
 * @example
 * // Icon and messages ID.
 * // 1 = "Building needs Resource"
 * // 2 = "Missing outcoming station"
 */
var Icons = {
  
  /**
   * Update icons.
   * @memberof Icons
   * @name alternative_update
   * @method
   */
  alternative_update : function () {  
    
    // Reset icons.
    /*for (var i in phaser_object.icons) {
      phaser_object.icons[i].sprite.destroy();
    }*/
    phaser_object.icons = new Array();
    
    // Create new icons.
    var b,
        building,
        r,
        req,
        i;
    
    for (b in GameApp.data.buildings) {
      building = GameApp.data.buildings[b];
      
      // Check requests.
      if (typeof building.request !== "undefined" && building.request.length > 0) {
      
        // Icon type 1: building request.
        for (r in building.request) {
          req = building.request[r];
          //console.log(building.name + " chiede " + req.resource);
          phaser_object.icons.push(new Icon(1, building, {resources: [req.resource]}));
          //req.amount
          //Board.get_resource_image(req.resource, {class: 'info-resource__image'});
        }
      }
      
      // Other buildings icons.
      for (i in building.icons) {
        phaser_object.icons.push(new Icon(i, building, building.icons[i]));
      }
      
      
    }
  
    // Check needed resources for production.
    
    // Check outcoming stations for producing factories.
    
    // Check full warehouse.
  
    // Show icons.
    Icons.show();
    
  },
  
  /**
   * Show icons.
   * @memberof Icons
   * @name show
   * @method
   */
  show : function () {
    jQuery('#icons').html("");
    for (var i in phaser_object.icons) {
      jQuery('#icons').append( phaser_object.icons[i].html() );
    }
  },
  
}




/**
 * Icon class.
 * @name Icon
 * @class
 * @classdesc Create an icon instance.
 * @param {number} type - type of icon
 * @param {object} ref - Reference object of the icon.
 * @param {object|undefined} vars - Variables.
 */
var Icon = function (type, ref, vars) {
  this.type = type;
  this.ref = ref;
  this.vars = vars;
  
  //this.spawn();
}


/**
 * Add the icon to the map.
 * @memberof Icon
 * @name spawn
 * @instance
 * @method
 */
/*
Icon.prototype.spawn  = function () {
  
  // Create sprite and add it to "buildings" group.
  this.sprite = phaser_object.groups.buildings.create(this.ref.sprite.x, this.ref.sprite.y, 'icon-' + this.type);
  // Center anchor.
  this.sprite.anchor.setTo(0.5, 0.5);
  
}*/

/**
 * Return html of the icon.
 * @memberof Icon
 * @name html
 * @instance
 * @method
 */
Icon.prototype.html  = function () {
  var html = "",
      ph2 = ""; // Placeholder 2.
  
  // Building icon.
  if (typeof this.ref !== "undefined" && 
      typeof this.ref.constructor !== "undefined" && 
      this.ref.constructor.name == "Building" || 
      this.ref.constructor.name == "Village"
     ) {
   html += Board.get_building_image(this.ref.type, {class: 'icon'});
  }
  
  // Resources icons.
  if (typeof this.vars.resources !== "undefined") {
    var res_arr = new Array();
    for (var r in this.vars.resources) {
      html += Board.get_resource_image(this.vars.resources[r], {class: 'icon'});
      res_arr.push( Main.t('resource-' + this.vars.resources[r]) );
    }
    ph2 = res_arr.join(", ");
  }

  return '<div>' + html + ' ' + Main.t('message-' + this.type, this.ref.fullname(), ph2) + '</div>';
  
}

    
/**
 * Contains the production class.
 * @file
 * @see Production
 */

/**
 * The production class.
 * @name Production
 * @namespace
 * @classdesc The production class.
 */
var Production = {

  /**
   * Get the complete production data of a building.
   * @memberof Production
   * @name get
   * @method
   * @param {number} building_type - The building type.
   * @return {object} The building production object.
   */
  get : function (building_type) {
    var ret = {}
    ret.current = [];
    ret.resources = Production.get_production(building_type);
    var r,
        required_resources;
    // Loop produced resources.
    for (var p in ret.resources) {
      // Add required resources.
      ret.resources[p].requires = Production.get_required(ret.resources[p].resource);
    }
    return ret;
  },
  
  
  /**
   * Get the production of a building.
   * @memberof Production
   * @name get_production
   * @method
   * @param {number} building_type - The building type.
   * @return {array} Array of resources produded by a building.
   */
  get_production : function (building_type) {
    var prod = Database.get('production', {
      building : building_type
    });
    return prod;
  },
  
  
  /**
   * Get the resources required to produce another resource.
   * @memberof Production
   * @name get_required
   * @method
   * @param {number} resource_type - The resource type.
   * @return {array} Array of required resources.
   */
  get_required : function (resource_type) {
    var prod = Database.get('production_resources', {
      resource : resource_type
    });
    return prod;
  },

};

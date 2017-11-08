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
   * The costs array.
   * @memberof Production
   * @name costs
   * @type {array}
   */
  costs : [],
  
  
  /**
   * Init Production.
   * @memberof Production
   * @name init
   * @method
   */
  init : function () {
    Production.costs = Production.get_costs();
  },
  
  
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
   * @return {array} Array of resources produced by a building.
   */
  get_production : function (building_type) {
    var prod = Database.get('production', {
      building : building_type
    });
    return prod;
  },
  
  
  /**
   * Get costs.
   * @memberof Production
   * @name get_costs
   * @method
   */
  get_costs : function () {
    return Database.get('costs');
  },
  
  
  /**
   * Get costs of something.
   * @memberof Production
   * @name get_item_costs
   * @method
   * @param {string} item - Item
   * @param {number} type - Item type
   */
  get_item_costs : function (item, type) {
    var ret = new Array();
    for (var i in Production.costs) {
      if (
        Production.costs[i].item == item &&
        Production.costs[i].type == type
      ) {
        ret.push(Production.costs[i]);
      }
    }
    return ret;
  },
  
  
  
  /**
   * Get the consumption of a building.
   * @memberof Production
   * @name get_consumption
   * @method
   * @param {number} building_type - The building type.
   * @return {array} Array of resources consumed by a building.
   */
  get_consumption : function (building_type) {
    return Database.get('consumption', {
      building : building_type
    });
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
  
  
  /**
   * Building receive a resource.
   * @memberof Production
   * @name receive
   * @method
   * @param {object} r - The resource sprite received.
   * @param {object} b - The building sprite that receives the resource.
   */
  receive : function (r, b) {
    if (typeof r === "undefined" || typeof b === "undefined" || r == null || b == null)
      return;
    var building = Map.findOne(b.custom_id, 'buildings');
    var resource = Map.findOne(r.custom_id, 'resources');
    // Can this building receive this resource?
    if (
      typeof building.warehouse !== "undefined" &&
      typeof building.warehouse[resource.type] !== "undefined" &&
      (typeof building.warehouse[resource.type].amount === "undefined" || building.warehouse[resource.type].amount < building.warehouse[resource.type].capacity)
    ) {
      // Store.
      building.store(resource.type);
      // Delete resource.
      resource.delete();
    }
  },
  
  
  /**
   * Check if a building can start producing or builds something.
   * @memberof Production
   * @name can_produce
   * @instance
   * @method
   * @param {object} building - Building.
   * @param {array} requires - Array of required resources.
   */
  can_produce : function (building, requires) {
    if (requires.length == 0)
      return true;

    var required,
        amount,
        gathered = new Array();
    for (var r in requires) {
      required = requires[r].requires;
      amount = requires[r].amount;
      if (building.gather(required, amount)) {
        gathered.push({required: required, amount: amount});
      } else {
        // Give back gathered resources and return false.
        for (var g in gathered) {
          building.store(gathered[g].required, gathered[g].amount);
        }
        return false;
      }
    }
    return true;

  },


};

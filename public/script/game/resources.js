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
   * Get array of resources from database.
   * @memberof Resources
   * @name get
   * @method
   * @param {object} filters - Object with filters
   * @returns {array} Array of resources.
   * @example
   * // Get all resources.
   * var resources = Resources.get();
   * // Get only level 1 resources with value = 2
   * var resources = Resources.get({
   *   level: 1,
   *   value: 2
   * });
   * // Get only level 1 resources with value > 3.
   * var resources = Resources.get({
   *   level: {
   *     value: 1,
   *     //operator: '=',  // Default
   *   },
   *   value: {
   *     value: 3,
   *     operator: '>',
   *   }
   * });
   */
  get : function (filters) {
    var operators = {
        '=': function(a, b) { return a == b },
        '<': function(a, b) { return a < b },
        '>': function(a, b) { return a > b }
    };
    var JSON_resources = game.cache.getJSON('resources');
    var arr = new Array();
    var field,
        checked,
        resource,
        operator,
        filter_value;
    // Filters:
    if (typeof filters !== "undefined" && filters !== null) {
      // Loop resources.
      for (var i in JSON_resources.list) {
        resource = JSON_resources.list[i];
        //console.log("Check: " + resource.name);
        checked = true;
        // Loop filters.
        for (field in filters) {
          // Check field exists.
          if (typeof resource[field] === "undefined") {
            //console.log("Checking undefined field: " + field);
            checked = false;
            break;
          }
          // Get default operator.
          operator = "=";
          // Filter can be value or object
          if (typeof filters[field] === "object") {
            filter_value = filters[field].value;
            if (typeof filters[field].operator !== "undefined")
              operator = filters[field].operator;
          } else {
            filter_value = filters[field];
          }
          // Check filter.
          if (!operators[operator](resource[field], filter_value)) {
            checked = false;
            break;
          }
          arr.push(resource);
        }
      }
    // Return all resources.
    } else {
      arr = JSON_resources.list;
    }
    return arr;
  },
  
  
  /**
   * Get random resource ID from list.
   * @memberof Resources
   * @name getRandom
   * @method
   * @param {number} level - The resource level to select.
   * @returns {number} The resource ID.
   */
  getRandom : function (level) {
    // Get level 1 resources.
    var resources = Resources.get({
      level : 1
    });
    // No resources found: return false.
    if (resources.length == 0) return false;
    // Select random resource.
    var rand_i = Math.floor(Math.random() * resources.length);
    // Return resource id.
    return resources[rand_i].id;
  }

};




/**
 * Resource class.
 * @name Resource
 * @class
 * @classdesc Create a resource instance.
 * @param {number} resource_id - Resource ID, defines the resource settings.
 * @property {number} resource_id - Resource ID.
 * @property {object} sprite - Phaser.io sprite object
 */
var Resource = function (resource_id) {
  this.resource_id = resource_id;
};

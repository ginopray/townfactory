/**
 * Contains Database namespace.
 * @file
 * @see Database
 */

/**
 * Database functions.
 * @name Database
 * @namespace
 * @classdesc Database functions.
 */
var Database = {
  
  /**
   * Get array of items from database.
   * @memberof Database
   * @name get
   * @method
   * @param {object} table - The file to read
   * @param {object} filters - Object with filters
   * @returns {array} Array of items.
   * @example
   * // Get all resources.
   * var resources = Database.get('resources');
   * // Get only level 1 resources with value = 2
   * var resources = Resources.get('resources', {
   *   level: 1,
   *   value: 2
   * });
   * // Get only level 1 resources with value > 3.
   * var resources = Resources.get('resources', {
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
  get : function (table, filters) {
    var operators = {
        '=': function(a, b) { return a == b },
        '<': function(a, b) { return a < b },
        '>': function(a, b) { return a > b }
    };
    var JSON_cache = game.cache.getJSON(table);
    if (typeof JSON_cache === "undefined" || JSON_cache === null) {
      GameApp.error('Table ' + table + ' not found in cache');
    }
    var arr = new Array();
    var field,
        checked,
        item,
        operator,
        filter_value;
    // Filters:
    if (typeof filters !== "undefined" && filters !== null) {
      // Loop items.
      for (var i in JSON_cache) {
        item = JSON_cache[i];
        checked = true;
        // Loop filters.
        for (field in filters) {
          // Check field exists.
          if (typeof item[field] === "undefined") {
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
          if (!operators[operator](item[field], filter_value)) {
            checked = false;
            break;
          }
          arr.push(item);
        }
      }
    // Return all items.
    } else {
      arr = JSON_cache;
    }
    return arr;
  },

};


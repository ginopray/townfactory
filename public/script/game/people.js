/**
 * Contains People namespace.
 * @file
 * @see People
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
   */
  settings : {
    people_level: 10,
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
  
  
}



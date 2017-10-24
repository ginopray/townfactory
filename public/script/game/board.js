/**
 * Contains the game board class: Board.
 * @file
 * @see Board
 */

/**
 * The game board class.
 * @name Board
 * @namespace
 * @classdesc Game board - Manage the UI: buttons, stats...
 * @property {object} flags - Flags
 * @property {bool} flags.render - Rendering on/off
 */
var Board = {
  
  flags : {
    render : 1,
  },
  
  /**
   * Initialize the board.
   * @memberof Board
   * @name init
   * @method
   */
  init : function () {
    jQuery('.board-command').each(function(){
      jQuery(this).click(function(){
        window["Board"][jQuery(this).attr("data-callback")]();
      });
    })
  },
  
  
  /**
   * Toggle geometry rendering.
   * @memberof Board
   * @name render_toggle
   * @method
   */
  render_toggle : function () {
    Board.flags.render = 1 - Board.flags.render;
    game.debug.reset();
  }

};

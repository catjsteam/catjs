var _colors = require('colors'),
    Colors = function () {

        this._colors;
        this._colorsArray = ['blue', 'yellow', 'cyan', 'magenta', 'grey', 'green'];
        this._colorCell = {};
        this._colorIndex = -1;
    };

/**
 * Remove the color from the pool according to the test id
 */
Colors.prototype.deleteColor = function (id) {

    if (id !== undefined && typeof this._colorCell[id] !== "undefined") {
        delete this._colorCell[id];
    }
};

Colors.prototype.setCurrentTheme = function (id) {
    _colors.setTheme({'current': this._colorsArray[this.getColorIndex(id)]});    
};

Colors.prototype.setTheme = function (opt) {
    _colors.setTheme({'current': opt.color});    
};

/**
 * Get color index
 *
 * @param id {String} The id of the running test
 * @returns {*}
 */
Colors.prototype.getColorIndex = function (id) {

    if (id !== undefined && typeof this._colorCell[id] !== "undefined") {
        return this._colorCell[id];
    }

    this._colorIndex++;
    if (this._colorIndex > this._colorsArray.length - 1) {
        this._colorIndex = 0;
    }

    if (id !== undefined) {
        this._colorCell[id] = this._colorIndex;
    }
    return this._colorIndex;

};

module.exports = Colors;
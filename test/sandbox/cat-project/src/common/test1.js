var customBehavior = {

    replace: function(lines) {
        return ["console('2')"];
    }

};

if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = customBehavior;
    }
}
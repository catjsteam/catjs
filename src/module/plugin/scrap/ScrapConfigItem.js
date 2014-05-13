/**
 * Scrap configuration item class
 * properties:
 *      value - the config value
 *      sign - the sign value ('!' '=')
 *
 * @type {module.exports}
 */
module.exports = function () {


    function ScrapConfigItem(config) {

        this.$$classType = "ScrapConfigItem";
        if (config) {
            this.config = config;
        }

    }

    ScrapConfigItem.prototype.get = function(key) {
        return (this.config ? this.config[key] : undefined);
    };

    ScrapConfigItem.prototype.getValue = function() {
        return this.get("value");
    };

    ScrapConfigItem.prototype.getSign = function() {
        return this.get("sign");
    };

    return {

        create: function(config) {
            return (new ScrapConfigItem(config));
        },

        instanceOf: function(obj) {
            return  (obj["$$classType"] ? true : false);
        }

    };

}();
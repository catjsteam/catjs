var _utils = catrequire("cat.utils");

module.exports = function(config) {

    var me = this,
        key;

    if (!config) {
        throw new Error('[catjs Row class] config argument is not valid ');
    }
    _utils.prepareProps({
        global: {obj: config},
        props: [
            {key: "name", require: true},
            {key: "scrapname", require: true},
            {key: "data", require: true}
        ]
    });

    if (config) {
        for  (key in config) {
            if (config.hasOwnProperty(key)) {
                me[key] = config[key];
            }
        }
    }
};
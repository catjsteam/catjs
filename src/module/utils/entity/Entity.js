var _catglobal = catrequire("cat.global"),
    _log = _catglobal.log();

module.exports = function() {

    var _globalsmap = {};
    
    return {

        /**
         *
         * @param config
         *      entity {function} The entity reference function
         *      name {String} Unique global map key;
         */
        entity: function(config) {
            var key = config.name,
                entity = config.fn,
                printer = config.printer;

            if (_globalsmap[key]) {
                _log.warn("[catjs Scrap] Override an existing global functionality: ", key);
            }
            _globalsmap[key] = new entity({printer: printer});

            return _globalsmap[key];
        },

        getEntity: function(key) {
            return _globalsmap[key];
        }        

    };
    
}();
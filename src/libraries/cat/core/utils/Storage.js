_cat.utils.Storage = function () {

    var _catjsLocal, _catjsSession;

    function _getStorage(type) {
        if (type) {
            return window[_enum[type]];
        }
    }

    function _base(type) {
        if (!type) {
            console.warning("[CAT] Storage; 'type' argument is not valid");
        }

        return _getStorage(type);
    }

    var _enum = {
        guid : "cat.core.guid",
        session: "sessionStorage",
        local: "localStorage"
    },
        _storageEnum = {
            CURRENT_SCENARIO: "current.scenario",
            SESSION: "session",
            LOCAL: "local"
        },
        _module;

    function _init() {
        var localStorage = _getStorage("local"),
            sessionStorage = _getStorage("session");

        if (sessionStorage.catjs) {
            _catjsSession = JSON.parse(sessionStorage.catjs);
        }
        if (localStorage.catjs) {
            _catjsLocal = JSON.parse(localStorage.catjs);
        }
    }

    _init();

    _module =  {


        /**
         *  Set value to a storage
         *
         * @param key The key to be stored
         * @param value The value to set
         * @param type session | local
         */
        set: function(key, value, type) {

            var storage = _base(type);
            if (storage) {
                if (!_catjsSession) {
                    _catjsSession = {};
                }
                _catjsSession[key] = value;
                storage.catjs = JSON.stringify(_catjsSession);
            }
        },

        /**
         *  Get value from the storage
         *
         * @param key
         * @param type session | local
         */
        get: function(key, type) {

            var storage = _base(type);
            if (storage) {
                if (!storage.catjs) {
                    return undefined;
                }

                _catjsSession = JSON.parse(storage.catjs);
                if (!_catjsSession) {
                    return undefined;
                }

                return _catjsSession[key];
            }

        },

        getGUID: function() {

            var guid = _module.get(_enum.guid, _storageEnum.SESSION);

            if (!guid) {
                guid =_cat.utils.Utils.generateGUID();
                _module.set(_enum.guid, guid, _storageEnum.SESSION);
            }

            return guid;

        },

        enum: _storageEnum

    };

    return _module;
}();
_cat.core.controller = function () {

    var _queue = [],
        _Action = function (config) {
            var me = this;

            this.config = config;
            this.get = function (key) {
                return me.config[key];
            };

        },

        _module = {

            add: function (config) {

                _cat.utils.Utils.prepareProps(
                    {
                        global: {
                            obj: config
                        },
                        props: [
                            {
                                key: "me",
                                default: this
                            },
                            {
                                key: "fn"
                            },
                            {
                                key: "delay",
                                default: 0
                            },
                            {
                                key: "totalDelay",
                                default: 0
                            },
                            {
                                key: "manager",
                                require: true
                            }
                        ]
                    });

                if (config.manager) {

                   // _queue.push(new _Action(config));
                    config.fn.call(config.me);
//                if (config.fn) {
//                    setTimeout(function () {
//                        fn.call(config.me);
//                    }, totalDelay);
//                    totalDelay += delay;
//                }

                }                
            },

            run: function() {

                
            }

        };


    return _module;

}();
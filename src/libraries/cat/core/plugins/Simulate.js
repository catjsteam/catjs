_cat.utils.plugins.simulate = function() {
    
    var _module = {
        
        drag: function(opt) {

            _cat.utils.Utils.prepareProps(
                {
                    global: {
                        obj: opt
                    },
                    props: [
                        {
                            key: "element",
                            require: true
                        },
                        {
                            key: "target"
                        },
                        {
                            key: "offset",
                            default: {x:0, y:0}
                        },
                        {
                            key: "cords",
                            default: false
                        },
                        {
                            key: "steps",
                            default: {delay: 0, count: 1}
                        }
                    ]
                });

            _cat.plugins.dom.fire("mouseenter", {"element": opt.element});
            _cat.plugins.dom.fire("mousedown", {"element": opt.element});
            _cat.plugins.dom.fire("mousemove", opt);
            _cat.plugins.dom.fire("mouseup", {"element": opt.element});            
        } 
    };
    
    return _module;

}();
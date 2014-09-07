_cat.utils.Loader = function () {

    var _libslength = 0,
        _ready = 0,
        _module = {

        require: function (file, callback) {

            function _css(file) {
                var node = document.createElement('link'),
                    head = (document.head || document);

                node.rel = 'stylesheet';
                node.type = 'text/css';
                node.href = file;

                node.onload = function() {
                    _ready++;
                    if (_ready === _libslength) {
                        if (callback && callback.call) {
                            callback.call(this);
                        }
                    }
                };

                document.head.appendChild(node);
            }

            function _js(file) {
                var node = document.createElement('script'),
                    head = (document.head || document);

                node.type = "text/javascript";
                node.src = file;
                node.onload = function() {
                    _ready++;
                    if (_ready === _libslength) {
                        if (callback && callback.call) {
                            callback.call(this);
                        }
                    }
                };
                
                head.appendChild(node);
            }

            var jsfile_extension = /(.js)$/i,
                cssfile_extension = /(.css)$/i;

            if (jsfile_extension.test(file)) {
                _js(file);

            } else if (cssfile_extension.test(file)) {
                _css(file);

            } else {
                console.warn("[catjs] no valid file was found ", (file || "NA"));
            }
        },

        requires: function () {

            var index = 0;

            return function (files, callback) {
                _libslength = files.length;
                index += 1;
                _module.require(files[index - 1], ((index === files.length) ? callback : undefined));

                if (index === files.length) {
                    index = 0;
                    
                } else {
                    _module.requires(files, callback);
                }
            };

        }()

    };

    return _module;

}();


//Utilities.requires(["cat.css", "cat.js", "chai.js"], function(){
//    //Call the init function in the loaded file.
//    console.log("generation done");
//})

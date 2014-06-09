_cat.utils.Loader = function () {

    return {

        require: function (file) {

            function _css(file) {
                var node = document.createElement('link'),
                    head = (document.head || document);

                node.rel = 'stylesheet';
                node.type = 'text/css';
                node.href = file;
                document.head.appendChild(node);
            }

            function _js(file) {
                var node = document.createElement('script'),
                    head = (document.head || document);

                node.type = "text/javascript";
                node.src = file;

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
            var index = 0,
                me = this;

            return function (files, callback) {
                index += 1;
                me.require(files[index - 1]);

                if (index === files.length) {
                    index = 0;
                    callback();
                } else {
                    me.requires(files, callback);
                }
            };

        }()

//        load dependencies from catproject
//        load catjs first and then others

    };

}();


//Utilities.requires(["cat.css", "cat.js", "chai.js"], function(){
//    //Call the init function in the loaded file.
//    console.log("generation done");
//})

var test = function() {

    return {

        init: function() {

            /*
                @[scrap
                    @@name test1
                    @@replace after:2
                    @@behavior[
                        @@replace cat.comment
                    ]
                ]@
             */
            console.log("This is a test line:1");
            console.log("This is a test line:2");

            /*
                @[scrap
                    @@name test2
                    @@replace after:2
                    @@behavior[
                        @@replace src/common/test1.js
                    ]
                ]@
             */
            console.log("This is a test line:3");
            console.log("This is a test line:4");

        }

    };

}();
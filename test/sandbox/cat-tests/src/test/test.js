var test = function() {

    return {

        init: function() {

            /*
                @[scrap
                    @@name test
                    @@replace after:2
                    @@behavior[
                        @@replace comment
                    ]
                ]@
             */
            console.log("This is a test line:1");
            console.log("This is a test line:2");

        }

    };

}();
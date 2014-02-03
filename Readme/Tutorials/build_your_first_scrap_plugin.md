# Build your first scrap plugin #

## intro

Today you will learn how to build a new scrap-plugin, build new scrap annotation, and use your scrap annotation.
Please make sure that you fully understanding [scrap methodology](../scrap.md)

In our example we will build a new plugin inLet add a new functionality that prints "hello world" to the console, we will name this functionality *"printHello"*

## prepare your environment

1. Select your scrap name ***myScrapName***

2. Add scrap functionality file

    2.1 In CAT_Home/src/libraries/plugins create a new folder with your scrap name

    ***CAT_Home/src/libraries/plugins/myScrapName***

    2.2 Create a new javascript file with the scrap name in the new folder

    ***CAT_Home/src/libraries/plugins/myScrapName/myScrapName.js***


3. Add scrap annotation file

    3.1 Create a new javascript file with the scrap name (scrap-"scrap name") in the location

    ***CAT_Home/src/plugins/scrap-myScrapName.js***

4. Add your new plugin to your [catproject.json](../catproject.md)

    Add your new scrap in task.scrap.plugins and task.inject.plugins

        "tasks": [
            {
                "name": "init",
                "plugins": ["init.copy", "libraries.build", "lib.copy"]
            },
            {
                "name": "scrap",
                "plugins": ["scrap-common", "scrap-myScrapName", "custom.plugin", "init.scrap"]
            },
            {
                "name": "inject",
                "plugins": ["scrap-common", "scrap-myScrapName", "custom.plugin", "project.inject", "project.minify"]
            }
        ]


## Setup your scrap functionality

In the last stage we created the functionality file in ***CAT_Home/src/libraries/plugins/myScrapName*** *(stage 2)*
Now we will add a functionality to that file.

First your file should look like this :

    _cat.plugins.myScrapName = function () {
        // private variables

        // public variables
        return {

            // supported action
            actions: {


            }
        };
    }();

Let add a new functionality that prints "hello world" to the console, we will name this functionality *"printHello"*

Now our ***myScrapName.js*** file should look like this :

    _cat.plugins.myScrapName = function () {
        // private variables

        // public variables
        return {

            // supported action
            actions: {
                printHello : function () {
                    console.log("hello world");
                }

            }
        };
    }();


## Setup your scrap annotation

We will return to scrap-myScrapName.js from stage 3 in the chapter *prepare your environment*

First your file should look like this :

    var _Scrap = catrequire("cat.common.scrap"),
        _utils = catrequire("cat.utils"),
        _scraputils = require("./Utils");

    module.exports = function () {

        return {

            init: function (config) {

                /**
                 * Annotation for myScrapName library
                 *
                 *  properties:
                 *  name    - myScrapName
                 *  single  - false
                 *  singleton - 1[default -1]
                 *  $type   - js
                 */
                _Scrap.add({name: "myScrapName",
                    single: false,

                    func: function (config) {
                        var myScrapNameRows,
                            myScrapName,
                            me = this,
                            validcode = false;

                        myScrapNameRows = this.get("myScrapName");

                        if (myScrapNameRows) {
                            _utils.prepareCode(myScrapNameRows);
                            myScrapName = myScrapNameRows.join("\n");


                            if (myScrapName) {

                                var match = _scraputils.generate({
                                    api: "apiAction",
                                    apiname: "apiAction",
                                    exp: myScrapName
                                });

                                if (match) {
                                    me.print("_cat.core.plugin('myScrapName').actions."+ match);
                                }

                            }
                        }
                    }
                });

                config.emitter.emit("job.done", {status: "done"});

            },

            apply: function () {

            },

            getType: function () {
                return "scrap-myScrapName";
            }
        }

    };



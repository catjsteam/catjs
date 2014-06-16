/**
 * {{comment}}
 */
require.config({{config}});
require({{require}}, function({{requirerefs}}) {

    if (typeof chai !== "undefined") {
        window["chai"] = chai;
    }
    _cat.utils.Loader.requires({{cssfiles}})

});
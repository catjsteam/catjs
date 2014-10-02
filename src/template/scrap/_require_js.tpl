/**
 * {{comment}}
 */
require.config({{config}});
require({{require}}, function({{requirerefs}}) {

    if (typeof chai !== "undefined") {
        window["chai"] = chai;
    }
    if (typeof jspath !== "undefined") {
        window["JSPath"] = jspath;
    }
    _cat.utils.Loader.requires({{cssfiles}})

});
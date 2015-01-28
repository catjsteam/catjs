/**
 * {{comment}}
 */
require.config({{config}});
require({{require}}, function({{requirerefs}}) {

    {{globals}}
    
    _cat.utils.Loader.requires({{cssfiles}});
    
    if (_cat) {
        _cat.core.init({ "catjspath": "{{catjspath}}" });     
    }

});
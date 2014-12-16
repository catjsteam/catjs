_cat.core.define("{{name}}", function({{arguments}}) {

    var pkgName = "{{name}}",
        _argsrefs = arguments,
        _argsnames = "{{arguments}}",
        _args = {},
        _ipkg = _cat.core.getVar(pkgName),
        context,
        _counter=0;

    if (_args) {    
        _argsnames = _argsnames.split(",");
        _argsnames.forEach(function(arg) {
            _args[arg] = _argsrefs[_counter];
             _counter++;
        });
    }

    context = {scrap : _ipkg.scrap, args  : _args};


    /* test content in here */
    {{output}}
});

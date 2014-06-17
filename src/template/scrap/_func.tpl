_cat.core.define("{{name}}", function({{arguments}}) {

    var pkgName = "{{name}}",
        _argsrefs = arguments,
        _argsnames = "{{arguments}}",
        _args = {},
        _counter=0;

    if (_args) {
        _argsnames = _argsnames.split(",");
        _argsnames.forEach(function(arg) {
            _args[arg] = _argsrefs[_counter];
             _counter++;
        });
    }

    /* test content in here */
    {{output}}
});

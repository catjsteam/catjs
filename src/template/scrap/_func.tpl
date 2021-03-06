_cat.core.define("{{name}}", function({{arguments}}) {

    var pkgName = "{{name}}",
        _argsrefs = arguments,
        _argsnames = "{{arguments}}",
        _args = {},
        _ipkg = _cat.core.getVar(pkgName),
        _thisargs = this.get(pkgName),
        _def = (_thisargs && "def" in _thisargs ? _thisargs.def : undefined),
        _done = (_thisargs && "done" in _thisargs ? _thisargs.done : undefined),
        context,
        _counter=0,
        _catConfig = _cat.core.getConfig(),
        _delay = _catConfig.getTestDelay(),
        _supportedDelay = function(type, delay) {
           return _catConfig.isAnnotationDelaySupported(type, delay);
        };

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
    
     _cat.core.manager.controller.state().wait({
        delay: 0,
        steps: 0,
        match: undefined,
        callback: function() {
            if (_done) {
                _done.call(this);
            }
        }
     });
    
});

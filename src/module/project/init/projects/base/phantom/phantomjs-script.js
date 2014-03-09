var _system = require('system'),
    _page = require('webpage').create(),
    _url = _system.args[1];

_page.open( _url, function (status) {

    var hasPhantomjs;
    console.log("[phantom] opening url: ", _url );

    if (status !== 'success') {
        console.log('FAIL to load the address, status:', status);

    } else {
        _page.evaluate(function () {
            hasPhantomjs = true;
        });

        setTimeout(function () {
            console.log("render...");
            _page.render('app-view.png');
            phantom.exit();
        }, 2000);

    }


});
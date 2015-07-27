var _global = catrequire("cat.global"),
    _log = _global.log(),
    _catinfo = catrequire("cat.info"),
    _useragent = require('express-useragent'),
    _utils = catrequire("cat.utils"),    
    _fs = require("fs");



/**
 * Initial settings
 * - Loading colors module
 * - Loading cat configuration
 */
function init() {


}


// Initialization
init();


exports.post = function (req, res) {

    var deviceinfo,
        deviceName,
        _userAgent,
        deviceName, deviceId,
        saveScreenshot,
        ua,
        ismobile;

    _userAgent = function (req) {

        var source = req.headers['user-agent'],
            us;
        if (source) {
            us = _useragent.parse(source);
        }
        if (req.body.deviceType) {
            us.isMobile = true;
            us.isAndroid = (req.body.deviceType === "android");
            us.isiOS = (req.body.deviceType === "iOS");
            us.Version = req.body.deviceType;
        }

        return us;
    }

    ua = _userAgent(req);
    ismobile = ("isMobile" in ua && _utils.getProperty(ua, "isMobile"));


    deviceinfo = JSON.stringify(req.body);
    console.log("got device info : " + deviceinfo);
    _catinfo.set({
        id: req.body.deviceId,
        device: (ismobile ? "device" : "browser"),
        model : (_utils.getProperty(ua, "Version")),
        type: (ismobile ? _utils.getProperty(ua, "Platform") : _utils.getProperty(ua, "Browser")),
        entity: "deviceinfo",
        data: deviceinfo
    });


    res.setHeader('Content-Type', 'text/javascript;charset=UTF-8');
    res.send('{"deviceinfo": "save",' +

        '"deviceName" : "' + deviceName + '",' +
        '"deviceId" : "' + deviceId + '",' +
        '}');

};


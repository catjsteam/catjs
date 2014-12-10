var _global = catrequire("cat.global"),
    _log = _global.log(),
    _catinfo = catrequire("cat.info"),
    _useragent = require('express-useragent'),
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

     var    pic,
            imageBuffer,
            scrapName,
            deviceName,
            _userAgent,
            deviceName, deviceId,
            saveScreenshot,
            ua,
            ismobile;


    saveScreenshot = function (data) {
        var filename = [scrapName, deviceName ,deviceId].join("_");
        console.log("save screenshot : " + filename);
        _catinfo.set({
                id: deviceId,
                device: (ismobile ? "device" : "browser"),
                model : (ua.Version),
                type: (ismobile ? ua.Platform : ua.Browser),
                entity: "screenshot",
                filename: filename,
                data: data
        });

        res.setHeader('Content-Type', 'text/javascript;charset=UTF-8');
        res.send('{"screenshot": "save",' +
            '"scrapName" : "' + scrapName + '",' +
            '"deviceName" : "' + deviceName + '",' +
            '"deviceId" : "' + deviceId + '",' +
        '}');
    }


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
    ismobile = ("isMobile" in ua && ua.isMobile);
    scrapName = req.body.scrapName;
    deviceName = req.body.deviceName;
    deviceId = req.body.deviceId;

    // get the screenshot and convert to base64
    pic = (req.body.pic);
    pic = pic.replace(new RegExp('\n| ', 'g'), '');

    imageBuffer = new Buffer(pic, 'base64');
    saveScreenshot(imageBuffer);

};


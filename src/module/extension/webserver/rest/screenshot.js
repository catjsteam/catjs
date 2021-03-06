var _global = catrequire("cat.global"),
    _log = _global.log(),
    _catinfo = catrequire("cat.info"),
    _useragent = require('express-useragent'),
    _fs = require("fs"),
    _utils = catrequire("cat.utils"),
    _date = require("date-format-lite");


exports.post = function (req, res) {

     var    pic,
            scrapName,
            _userAgent,
            deviceName, deviceId,
            save,
            ua,
            ismobile;


    save = function (data) {
        var filename;
        
        if (scrapName.indexOf("_$$_") === 0) {
            scrapName = scrapName.substring(4);
            filename = scrapName;

        } else {
            scrapName = [scrapName, "_", (new Date()).format("hh_mm_ss_S")].join("");
            filename = [scrapName, deviceName ,deviceId ].join("_");
        }
        
        _catinfo.set({
                id: deviceId,
                device: (ismobile ? "device" : "browser"),
                model :  _utils.getProperty(ua, "Version"),
                type: (ismobile ?  _utils.getProperty(ua, "platform") :  _utils.getProperty(ua, "Browser")),
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
    };


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
    };

    ua = _userAgent(req);
    ismobile = _utils.getProperty(ua, "isMobile");
    scrapName = req.body.scrapName;
    deviceName = req.body.deviceName;
    deviceId = req.body.deviceId;

    // get the screenshot and convert to base64
    pic = (req.body.pic);
    pic = pic.replace(new RegExp('\n| ', 'g'), '');
       
    save(pic);

};


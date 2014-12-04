var _global = catrequire("cat.global"),
    _log = _global.log(),
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

        var isAndroid,
            pic,
            imageBuffer,
            scrapName,
            deviceName,
            finalScreenshotName,
            scarpName, deviceName, deviceId,
            saveScreenshot;

        saveScreenshot = function (data) {
            finalScreenshotName = scrapName + "_" + deviceName + "_" + deviceId + ".png";

            _fs.writeFile(finalScreenshotName, data, function (err) {
                res.redirect("back");
            });
        }

        scrapName = req.body.scrapName;
        deviceName = req.body.deviceName;
        deviceId = req.body.deviceId;




    // check if it android device or ios
        isAndroid = (req.body.pic) ? true : false;
        if (isAndroid) {
            pic = (req.body.pic);
            pic = pic.replace(new RegExp('\n| ', 'g'), '');

            imageBuffer = new Buffer(pic, 'base64');
            saveScreenshot(imageBuffer);

        } else {
            _fs.readFile(req.files.photo.path, function (err, data) {
                saveScreenshot(data);
            });

        }








};


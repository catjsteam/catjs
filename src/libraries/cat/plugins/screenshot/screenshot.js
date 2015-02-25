_cat.plugins.screenshot = function () {



    return {

        actions: {


            screenshot: function (scrapName) {

                var url = "catjsgetscreenshot://scrapName=" + scrapName + "&deviceId=" + _cat.core.guid(),
                iframe = document.createElement("IFRAME");

                iframe.setAttribute("src", url);
                document.documentElement.appendChild(iframe);
                iframe.parentNode.removeChild(iframe);
                iframe = null;
            }
        }


    };

}();

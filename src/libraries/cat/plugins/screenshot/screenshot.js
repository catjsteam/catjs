_cat.plugins.screenshot = function () {



    return {

        actions: {


            screenshot: function (scrapName) {

                console.log("screenshot");
                var url = "catjsgetscreenshot://scrapName=" + scrapName,
                iframe = document.createElement("IFRAME");

                iframe.setAttribute("src", url);
                document.documentElement.appendChild(iframe);
                iframe.parentNode.removeChild(iframe);
                iframe = null;
            }
        }


    };

}();

_cat.plugins.deviceinfo = function () {



    return {

        actions: {


            deviceinfo: function (scrapName) {

                console.log("deviceinfo");
                var url = "catjsdeviceinfo:\\scrapName=" + scrapName,
                    iframe = document.createElement("IFRAME");

                iframe.setAttribute("src", url);
                document.documentElement.appendChild(iframe);
                iframe.parentNode.removeChild(iframe);
                iframe = null;
            }
        }


    };

}();

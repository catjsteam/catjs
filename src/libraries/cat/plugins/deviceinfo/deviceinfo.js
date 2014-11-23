_cat.plugins.deviceinfo = function () {



    return {

        actions: {


            deviceinfo: function (interval) {
                 if (typeof interval === "undefined") {
                     interval = true;
                 }

                var url = "catjsdeviceinfo://interval=" + interval,
                    iframe = document.createElement("IFRAME");

                iframe.setAttribute("src", url);
                document.documentElement.appendChild(iframe);
                iframe.parentNode.removeChild(iframe);
                iframe = null;
            }
        }


    };

}();

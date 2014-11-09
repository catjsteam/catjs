var animation = false;


_cat.plugins.vnc = function () {



    return {

        actions: {


            mouseClick: function (x, y) {
                window.rfb.mouseClick(x, y);
            },

            mouseScrollVer: function (x, y1, y2) {
                window.rfb.mouseScrollVer(x, y1, y2);
            },

            mouseSlide: function (x1, y1, x2, y2) {
                window.rfb.mouseSlide(x1, y1, x2, y2);
            },

            mouseLongClick: function (x1, y1) {
                window.rfb.mouseLongClick(x1, y1);
            },

            swipeRight: function () {
                window.rfb.swipeRight();
            },

            swipeLeft: function () {
                window.rfb.swipeLeft();
            },
            back: function () {
                window.rfb.back();
            },

            setText: function (text) {
                window.rfb.setText(text);
            },

            home: function () {
                window.rfb.home();
            }

        }
    };

}();

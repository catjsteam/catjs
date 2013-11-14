_cat.core.ui = function() {

    function _create() {

        var catElement;
        if (typeof document !== "undefined") {
            var catElement = document.createElement("DIV");
            catElement.style.width = "200px";
            catElement.style.height = "200px";
            catElement.style.position = "fixed";
            catElement.style.bottom = "10px";
            catElement.style.zIndex = "10000000";
            catElement.innerHTML = '<div id="cat-status" class="cat-dynamic cat-status-open">' +
                '<div id=loading></div>' +
                '<div id="catlogo"></div>' +
                '<div id="cat-status-content">' +
                    '<div class="text-top"><span style="color:green">This is a text</span></div>' +
                    '<div class="text">this is a text</div>' +
                '</div>' +
            '</div>';

            if (document.body) {
                document.body.appendChild(catElement);
            }
        }
    }

    function _getCATElt() {
        var catElement;
        if (typeof document !== "undefined") {
            return document.getElementById("__catelement");
        }
        return undefined;
    }

    return {

        on: function() {

            var catElement;
            if (typeof document !== "undefined") {

                if (catElement) {
                    catElement.style.display = "";
                } else {
                    _create();
                }
            }

        },

        off: function() {

            var catElement = _getCATElt();
            if (catElement) {
                catElement.style.display = "";
            }

        }

    };

}();
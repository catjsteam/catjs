
module.exports = function () {


    return {

        uicontent: function(config) {
            var scrap = config.scrap,
                rows = config.rows;

            return [
                "_cat.core.ui.setContent(",
                ["{style: 'color:#0080FF', header: '", (scrap.name || "'NA'"), "', desc: '", rows, "',tips: ''}"].join(""),
                ");"
            ].join("")
        },

        assert: function() {

            return [
                "_cat.utils.chai.assert(",
                    "context",
                    ");"
            ].join("");


        }
    };

}();

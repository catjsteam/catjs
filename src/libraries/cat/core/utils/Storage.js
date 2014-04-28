_cat.utils.Storage = function () {


    function _generateGUID() {

        //GUID generator
        function S4() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
        }
        function guid() {
            return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
        }

        return guid();
    }

    var _enum = {
        guid : "cat.core.guid"

    };

    return {


        getGUID: function() {

            var storage = window.sessionStorage,
                guid;

            if (storage) {
                guid = (storage[_enum.guid] || _generateGUID());
                storage[_enum.guid] = guid;

            } else {
                guid =_generateGUID();
            }

            return guid;

        }


    };

}();
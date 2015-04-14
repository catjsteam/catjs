_cat.utils.scrap = function() {
    
    return {

        isStandalone: function(scrap) {
            var standalone = ("$standalone" in scrap ? scrap.$standalone : undefined);
            return standalone;
        }


};
    
}();
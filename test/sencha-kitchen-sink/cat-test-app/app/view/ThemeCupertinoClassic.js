Ext.define('Kitchensink.view.ThemeCupertinoClassic', {
    extend: 'Ext.Component',
    constructor: function() {
        this.callParent();
        window.location.assign(location.pathname + '?platform=ios-classic');
    }
});

Ext.define('Kitchensink.view.ThemeCupertino', {
    extend: 'Ext.Component',
    constructor: function() {
        this.callParent();
        window.location.assign(location.pathname + '?platform=ios');
    }
});

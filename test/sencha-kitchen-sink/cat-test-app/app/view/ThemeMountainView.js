Ext.define('Kitchensink.view.ThemeMountainView', {
    extend: 'Ext.Component',
    constructor: function() {
        this.callParent();
        window.location.assign(location.pathname + '?platform=android');
    }
});

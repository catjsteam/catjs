Ext.define('Kitchensink.view.ThemeTizen', {
    extend: 'Ext.Component',
    constructor: function() {
        this.callParent();
        window.location.assign(location.pathname + '?platform=tizen');
    }
});

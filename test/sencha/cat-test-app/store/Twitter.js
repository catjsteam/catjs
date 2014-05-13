Ext.define("CAT.store.Twitter", {
    extend: "Ext.data.Store",
    config: {
        model: "CAT.model.Twitter",

        proxy: {
            type: 'ajax',
            url : 'data/metadata.json',
            reader: {
                type: 'json',
                rootProperty: 'mainview'
            }
        },
        autoLoad: false
    }
});
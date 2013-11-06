Ext.define("CAT.store.Tweets", {
    extend: "Ext.data.Store",
    config: {
        model: "CAT.model.Tweets",

        proxy: {
            type: 'ajax',
            url : 'data/tweets.json',
            reader: {
                type: 'json'
            }
        },
        autoLoad: false
    }
});
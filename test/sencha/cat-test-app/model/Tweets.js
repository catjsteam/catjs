Ext.define("CAT.model.Tweets", {
    extend: "Ext.data.Model",
    config: {
        fields: [
            { name: 'id', type: 'string' },
            { name: 'img', type: 'string' },
            { name: 'name', type: 'string' },
            { name: 'username', type: 'string' },
            { name: 'email', type: 'string' },
            { name: 'desc', type: 'string' },
            { name: 'dateCreated', type: 'long' }

        ]

    }
});
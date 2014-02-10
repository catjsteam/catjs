/**
 * Demonstrates a NestedList, which uses a TreeStore to drill down through hierarchical data
 */
Ext.define('Kitchensink.view.NestedList', {
    extend: 'Ext.NestedList',
    requires: [
        'Ext.data.TreeStore',
        'Kitchensink.view.EditorPanel',
        'Kitchensink.model.Cars'
    ],

    config: {
        store: {
            type: 'tree',
            id: 'NestedListStore',
            model: 'Kitchensink.model.Cars',
            root: {},
            proxy: {
                type: 'ajax',
                url: 'carregions.json'
            }
        },
        displayField: 'text',
        itemId : 'nestedListView',
        listeners: {
            leafitemtap: function(me, list, index, item) {
                var editorPanel = Ext.getCmp('editorPanel') || new Kitchensink.view.EditorPanel();
                editorPanel.setRecord(list.getStore().getAt(index));
                if (!editorPanel.getParent()) {
                    Ext.Viewport.add(editorPanel);
                }
                editorPanel.show();
            },

            painted: function (element, options) {
                debugger;
            },

            activate : function( newActiveItem, oldActiveItem, eOpts ) {
                debugger;
            },
            activateitemchange : function( newActiveItem, oldActiveItem, eOpts ) {
                debugger;
            },
            add : function( newActiveItem, oldActiveItem, eOpts ) {
                debugger;
            },
            back : function( newActiveItem, oldActiveItem, eOpts ) {
                debugger;
            },
            beforeload : function( newActiveItem, oldActiveItem, eOpts ) {
                debugger;
            },
            fullscreen : function( newActiveItem, oldActiveItem, eOpts ) {
                debugger;
            },
            itemtap : function(list, index, target, record, e, eOpts ) {
                debugger;
            }

        }
    },

    platformConfig: [{
        platform: 'blackberry',
        toolbar: {
            ui: 'dark'
        }
    }]
});

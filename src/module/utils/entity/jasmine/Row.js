var _BaseEntity = require("./../BaseEntity.js");


function Row(config) {

    var me = this,
        key;

    _BaseEntity.call(this, config);
}

module.exports = Row;
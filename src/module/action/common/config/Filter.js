module.exports = function (config) {

    if (config) {
        this.type = (config.type || undefined);
        this.ext = (config.ext || undefined);
        this.exclude = (config.exclude || undefined);
    }

};
function _catjs_settings() {
  
    // aliases
    _cat.core.alias("manager");
    _cat.core.alias("manager.wait", _cat.core.manager.statecontroller.wait);
    _cat.core.alias("manager.resolve", _cat.core.manager.statecontroller.resolve);
    _cat.core.alias("manager.defer", _cat.core.manager.statecontroller.defer);
    _cat.core.alias("plugin.get", _cat.core.plugin);
    _cat.core.alias("testdata", _cat.utils.TestsDB);
    _cat.core.alias("ui.console", _cat.core.ui.console);

}

if (typeof exports !== "object") {

    _catjs_settings();

}
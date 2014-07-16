_cat.core.declare('C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setUsername$$cat', {
  scrap: {
    "name": ["setUsername"],
    "embed": ["true"],
    "jqm": ["setText(\"#username\", \"test\");"],
    "file": "C:/Users/snirr/workspace/catjs/test/check_path/cat-project/target/checkpath/path2/path3/index.html",
    "scrapinfo": {
      "start": {
        "line": 31,
        "col": 3
      },
      "end": {
        "line": 35,
        "col": 5
      }
    },
    "commentinfo": {
      "start": {
        "line": 30,
        "col": 8
      },
      "end": {
        "line": 36,
        "col": 11
      }
    },
    "single": {
      "name": true,
      "embed": true,
      "jqm": false,
      "file": true,
      "scrapinfo": true,
      "commentinfo": true,
      "single": true,
      "singleton": true,
      "arguments": true,
      "context": false,
      "auto": true,
      "injectcode": true,
      "id": true,
      "$type": true,
      "numCommands": true
    },
    "singleton": {
      "name": -1,
      "embed": -1,
      "jqm": -1,
      "file": -1,
      "scrapinfo": -1,
      "commentinfo": -1,
      "single": -1,
      "singleton": -1,
      "arguments": -1,
      "context": 1,
      "auto": -1,
      "injectcode": -1,
      "id": -1,
      "$type": -1,
      "numCommands": -1
    },
    "arguments": ["thi$"],
    "context": ["thi$"],
    "auto": true,
    "injectcode": false,
    "id": "scrap_6c99a196-6671-f130-39a0-6d345566adf6",
    "$type": "html",
    "numCommands": 2,
    "pkgName": "C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setUsername"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setUsername$$cat", function(thi$) {

  var pkgName = "C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setUsername$$cat",
    _argsrefs = arguments,
    _argsnames = "thi$",
    _args = {},
    _ipkg = _cat.core.getVar(pkgName),
    _counter = 0;

  if (_args) {
    _argsnames = _argsnames.split(",");
    _argsnames.forEach(function(arg) {
      _args[arg] = _argsrefs[_counter];
      _counter++;
    });
  }

  /* test content in here */
  _cat.core.clientmanager.delayManager(["_cat.core.ui.setContent({style: 'color:#0080FF', header: 'setUsername', desc: 'setText(\"#username\", \"test\");',tips: ''});"], {
    scrap: _ipkg.scrap,
    args: _args
  });
  _cat.core.clientmanager.delayManager(["_cat.core.plugin(\"jqm\").actions.setText(\"#username\", \"test\");"], {
    scrap: _ipkg.scrap,
    args: _args
  });
});
_cat.core.declare('C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setPassword$$cat', {
  scrap: {
    "name": ["setPassword"],
    "jqm": ["setText(\"#password\", \"test\");"],
    "file": "C:/Users/snirr/workspace/catjs/test/check_path/cat-project/target/checkpath/path2/path3/index.html",
    "scrapinfo": {
      "start": {
        "line": 66,
        "col": 12
      },
      "end": {
        "line": 70,
        "col": 14
      }
    },
    "commentinfo": {
      "start": {
        "line": 65,
        "col": 8
      },
      "end": {
        "line": 71,
        "col": 11
      }
    },
    "single": {
      "name": true,
      "jqm": false,
      "file": true,
      "scrapinfo": true,
      "commentinfo": true,
      "single": true,
      "singleton": true,
      "arguments": true,
      "context": false,
      "auto": true,
      "injectcode": true,
      "id": true,
      "$type": true,
      "embed": true,
      "numCommands": true
    },
    "singleton": {
      "name": -1,
      "jqm": -1,
      "file": -1,
      "scrapinfo": -1,
      "commentinfo": -1,
      "single": -1,
      "singleton": -1,
      "arguments": -1,
      "context": 1,
      "auto": -1,
      "injectcode": -1,
      "id": -1,
      "$type": -1,
      "embed": -1,
      "numCommands": -1
    },
    "arguments": ["thi$"],
    "context": ["thi$"],
    "auto": true,
    "injectcode": false,
    "id": "scrap_9f75613e-d970-aadd-24c6-0ed7035721b9",
    "$type": "html",
    "embed": ["true"],
    "numCommands": 2,
    "pkgName": "C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setPassword"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setPassword$$cat", function(thi$) {

  var pkgName = "C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setPassword$$cat",
    _argsrefs = arguments,
    _argsnames = "thi$",
    _args = {},
    _ipkg = _cat.core.getVar(pkgName),
    _counter = 0;

  if (_args) {
    _argsnames = _argsnames.split(",");
    _argsnames.forEach(function(arg) {
      _args[arg] = _argsrefs[_counter];
      _counter++;
    });
  }

  /* test content in here */
  _cat.core.clientmanager.delayManager(["_cat.core.ui.setContent({style: 'color:#0080FF', header: 'setPassword', desc: 'setText(\"#password\", \"test\");',tips: ''});"], {
    scrap: _ipkg.scrap,
    args: _args
  });
  _cat.core.clientmanager.delayManager(["_cat.core.plugin(\"jqm\").actions.setText(\"#password\", \"test\");"], {
    scrap: _ipkg.scrap,
    args: _args
  });
});
_cat.core.declare('C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setEmail$$cat', {
  scrap: {
    "name": ["setEmail"],
    "embed": ["true"],
    "jqm": ["setText(\"#email\", \"test\");"],
    "file": "C:/Users/snirr/workspace/catjs/test/check_path/cat-project/target/checkpath/path2/path3/index.html",
    "scrapinfo": {
      "start": {
        "line": 54,
        "col": 12
      },
      "end": {
        "line": 58,
        "col": 5
      }
    },
    "commentinfo": {
      "start": {
        "line": 53,
        "col": 8
      },
      "end": {
        "line": 59,
        "col": 5
      }
    },
    "single": {
      "name": true,
      "embed": true,
      "jqm": false,
      "file": true,
      "scrapinfo": true,
      "commentinfo": true,
      "single": true,
      "singleton": true,
      "arguments": true,
      "context": false,
      "auto": true,
      "injectcode": true,
      "id": true,
      "$type": true,
      "numCommands": true
    },
    "singleton": {
      "name": -1,
      "embed": -1,
      "jqm": -1,
      "file": -1,
      "scrapinfo": -1,
      "commentinfo": -1,
      "single": -1,
      "singleton": -1,
      "arguments": -1,
      "context": 1,
      "auto": -1,
      "injectcode": -1,
      "id": -1,
      "$type": -1,
      "numCommands": -1
    },
    "arguments": ["thi$"],
    "context": ["thi$"],
    "auto": true,
    "injectcode": false,
    "id": "scrap_29bb53bd-50a8-1706-3264-160493684a66",
    "$type": "html",
    "numCommands": 2,
    "pkgName": "C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setEmail"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setEmail$$cat", function(thi$) {

  var pkgName = "C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setEmail$$cat",
    _argsrefs = arguments,
    _argsnames = "thi$",
    _args = {},
    _ipkg = _cat.core.getVar(pkgName),
    _counter = 0;

  if (_args) {
    _argsnames = _argsnames.split(",");
    _argsnames.forEach(function(arg) {
      _args[arg] = _argsrefs[_counter];
      _counter++;
    });
  }

  /* test content in here */
  _cat.core.clientmanager.delayManager(["_cat.core.ui.setContent({style: 'color:#0080FF', header: 'setEmail', desc: 'setText(\"#email\", \"test\");',tips: ''});"], {
    scrap: _ipkg.scrap,
    args: _args
  });
  _cat.core.clientmanager.delayManager(["_cat.core.plugin(\"jqm\").actions.setText(\"#email\", \"test\");"], {
    scrap: _ipkg.scrap,
    args: _args
  });
});
_cat.core.declare('C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setRepeatPassword$$cat', {
  scrap: {
    "name": ["setRepeatPassword"],
    "embed": ["true"],
    "jqm": ["setText(\"#repeatpassword\", \"123456789\");"],
    "file": "C:/Users/snirr/workspace/catjs/test/check_path/cat-project/target/checkpath/path2/path3/index.html",
    "scrapinfo": {
      "start": {
        "line": 78,
        "col": 3
      },
      "end": {
        "line": 82,
        "col": 14
      }
    },
    "commentinfo": {
      "start": {
        "line": 77,
        "col": 8
      },
      "end": {
        "line": 83,
        "col": 11
      }
    },
    "single": {
      "name": true,
      "embed": true,
      "jqm": false,
      "file": true,
      "scrapinfo": true,
      "commentinfo": true,
      "single": true,
      "singleton": true,
      "arguments": true,
      "context": false,
      "auto": true,
      "injectcode": true,
      "id": true,
      "$type": true,
      "numCommands": true
    },
    "singleton": {
      "name": -1,
      "embed": -1,
      "jqm": -1,
      "file": -1,
      "scrapinfo": -1,
      "commentinfo": -1,
      "single": -1,
      "singleton": -1,
      "arguments": -1,
      "context": 1,
      "auto": -1,
      "injectcode": -1,
      "id": -1,
      "$type": -1,
      "numCommands": -1
    },
    "arguments": ["thi$"],
    "context": ["thi$"],
    "auto": true,
    "injectcode": false,
    "id": "scrap_1707b411-a1bc-484f-8996-c13c53f441f9",
    "$type": "html",
    "numCommands": 2,
    "pkgName": "C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setRepeatPassword"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setRepeatPassword$$cat", function(thi$) {

  var pkgName = "C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setRepeatPassword$$cat",
    _argsrefs = arguments,
    _argsnames = "thi$",
    _args = {},
    _ipkg = _cat.core.getVar(pkgName),
    _counter = 0;

  if (_args) {
    _argsnames = _argsnames.split(",");
    _argsnames.forEach(function(arg) {
      _args[arg] = _argsrefs[_counter];
      _counter++;
    });
  }

  /* test content in here */
  _cat.core.clientmanager.delayManager(["_cat.core.ui.setContent({style: 'color:#0080FF', header: 'setRepeatPassword', desc: 'setText(\"#repeatpassword\", \"123456789\");',tips: ''});"], {
    scrap: _ipkg.scrap,
    args: _args
  });
  _cat.core.clientmanager.delayManager(["_cat.core.plugin(\"jqm\").actions.setText(\"#repeatpassword\", \"123456789\");"], {
    scrap: _ipkg.scrap,
    args: _args
  });
});
_cat.core.declare('C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setmobileweb$$cat', {
  scrap: {
    "name": ["setmobileweb"],
    "embed": ["true"],
    "jqm": ["setCheck(\"#mobileweb\");"],
    "file": "C:/Users/snirr/workspace/catjs/test/check_path/cat-project/target/checkpath/path2/path3/index.html",
    "scrapinfo": {
      "start": {
        "line": 90,
        "col": 12
      },
      "end": {
        "line": 94,
        "col": 5
      }
    },
    "commentinfo": {
      "start": {
        "line": 89,
        "col": 2
      },
      "end": {
        "line": 95,
        "col": 5
      }
    },
    "single": {
      "name": true,
      "embed": true,
      "jqm": false,
      "file": true,
      "scrapinfo": true,
      "commentinfo": true,
      "single": true,
      "singleton": true,
      "arguments": true,
      "context": false,
      "auto": true,
      "injectcode": true,
      "id": true,
      "$type": true,
      "numCommands": true
    },
    "singleton": {
      "name": -1,
      "embed": -1,
      "jqm": -1,
      "file": -1,
      "scrapinfo": -1,
      "commentinfo": -1,
      "single": -1,
      "singleton": -1,
      "arguments": -1,
      "context": 1,
      "auto": -1,
      "injectcode": -1,
      "id": -1,
      "$type": -1,
      "numCommands": -1
    },
    "arguments": ["thi$"],
    "context": ["thi$"],
    "auto": true,
    "injectcode": false,
    "id": "scrap_c213389f-ed3b-a82a-7f75-422a7df1e4d9",
    "$type": "html",
    "numCommands": 2,
    "pkgName": "C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setmobileweb"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setmobileweb$$cat", function(thi$) {

  var pkgName = "C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setmobileweb$$cat",
    _argsrefs = arguments,
    _argsnames = "thi$",
    _args = {},
    _ipkg = _cat.core.getVar(pkgName),
    _counter = 0;

  if (_args) {
    _argsnames = _argsnames.split(",");
    _argsnames.forEach(function(arg) {
      _args[arg] = _argsrefs[_counter];
      _counter++;
    });
  }

  /* test content in here */
  _cat.core.clientmanager.delayManager(["_cat.core.ui.setContent({style: 'color:#0080FF', header: 'setmobileweb', desc: 'setCheck(\"#mobileweb\");',tips: ''});"], {
    scrap: _ipkg.scrap,
    args: _args
  });
  _cat.core.clientmanager.delayManager(["_cat.core.plugin(\"jqm\").actions.setCheck(\"#mobileweb\");"], {
    scrap: _ipkg.scrap,
    args: _args
  });
});
_cat.core.declare('C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setweb$$cat', {
  scrap: {
    "name": ["setweb"],
    "embed": ["true"],
    "jqm": ["setCheck(\"#web\");"],
    "file": "C:/Users/snirr/workspace/catjs/test/check_path/cat-project/target/checkpath/path2/path3/index.html",
    "scrapinfo": {
      "start": {
        "line": 98,
        "col": 12
      },
      "end": {
        "line": 102,
        "col": 5
      }
    },
    "commentinfo": {
      "start": {
        "line": 97,
        "col": 2
      },
      "end": {
        "line": 103,
        "col": 5
      }
    },
    "single": {
      "name": true,
      "embed": true,
      "jqm": false,
      "file": true,
      "scrapinfo": true,
      "commentinfo": true,
      "single": true,
      "singleton": true,
      "arguments": true,
      "context": false,
      "auto": true,
      "injectcode": true,
      "id": true,
      "$type": true,
      "numCommands": true
    },
    "singleton": {
      "name": -1,
      "embed": -1,
      "jqm": -1,
      "file": -1,
      "scrapinfo": -1,
      "commentinfo": -1,
      "single": -1,
      "singleton": -1,
      "arguments": -1,
      "context": 1,
      "auto": -1,
      "injectcode": -1,
      "id": -1,
      "$type": -1,
      "numCommands": -1
    },
    "arguments": ["thi$"],
    "context": ["thi$"],
    "auto": true,
    "injectcode": false,
    "id": "scrap_24a6d37e-ac85-49ea-a23b-581fa29cc73c",
    "$type": "html",
    "numCommands": 2,
    "pkgName": "C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setweb"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setweb$$cat", function(thi$) {

  var pkgName = "C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.setweb$$cat",
    _argsrefs = arguments,
    _argsnames = "thi$",
    _args = {},
    _ipkg = _cat.core.getVar(pkgName),
    _counter = 0;

  if (_args) {
    _argsnames = _argsnames.split(",");
    _argsnames.forEach(function(arg) {
      _args[arg] = _argsrefs[_counter];
      _counter++;
    });
  }

  /* test content in here */
  _cat.core.clientmanager.delayManager(["_cat.core.ui.setContent({style: 'color:#0080FF', header: 'setweb', desc: 'setCheck(\"#web\");',tips: ''});"], {
    scrap: _ipkg.scrap,
    args: _args
  });
  _cat.core.clientmanager.delayManager(["_cat.core.plugin(\"jqm\").actions.setCheck(\"#web\");"], {
    scrap: _ipkg.scrap,
    args: _args
  });
});
_cat.core.declare('C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.slider90$$cat', {
  scrap: {
    "name": ["slider90"],
    "embed": ["true"],
    "jqm": ["slide(\"#usetesting\" , 90);"],
    "file": "C:/Users/snirr/workspace/catjs/test/check_path/cat-project/target/checkpath/path2/path3/index.html",
    "scrapinfo": {
      "start": {
        "line": 121,
        "col": 3
      },
      "end": {
        "line": 125,
        "col": 5
      }
    },
    "commentinfo": {
      "start": {
        "line": 120,
        "col": 2
      },
      "end": {
        "line": 126,
        "col": 5
      }
    },
    "single": {
      "name": true,
      "embed": true,
      "jqm": false,
      "file": true,
      "scrapinfo": true,
      "commentinfo": true,
      "single": true,
      "singleton": true,
      "arguments": true,
      "context": false,
      "auto": true,
      "injectcode": true,
      "id": true,
      "$type": true,
      "numCommands": true
    },
    "singleton": {
      "name": -1,
      "embed": -1,
      "jqm": -1,
      "file": -1,
      "scrapinfo": -1,
      "commentinfo": -1,
      "single": -1,
      "singleton": -1,
      "arguments": -1,
      "context": 1,
      "auto": -1,
      "injectcode": -1,
      "id": -1,
      "$type": -1,
      "numCommands": -1
    },
    "arguments": ["thi$"],
    "context": ["thi$"],
    "auto": true,
    "injectcode": false,
    "id": "scrap_35db983e-2923-9f93-a37a-5008313c3e5c",
    "$type": "html",
    "numCommands": 2,
    "pkgName": "C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.slider90"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.slider90$$cat", function(thi$) {

  var pkgName = "C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.slider90$$cat",
    _argsrefs = arguments,
    _argsnames = "thi$",
    _args = {},
    _ipkg = _cat.core.getVar(pkgName),
    _counter = 0;

  if (_args) {
    _argsnames = _argsnames.split(",");
    _argsnames.forEach(function(arg) {
      _args[arg] = _argsrefs[_counter];
      _counter++;
    });
  }

  /* test content in here */
  _cat.core.clientmanager.delayManager(["_cat.core.ui.setContent({style: 'color:#0080FF', header: 'slider90', desc: 'slide(\"#usetesting\" , 90);',tips: ''});"], {
    scrap: _ipkg.scrap,
    args: _args
  });
  _cat.core.clientmanager.delayManager(["_cat.core.plugin(\"jqm\").actions.slide(\"#usetesting\" , 90);"], {
    scrap: _ipkg.scrap,
    args: _args
  });
});
_cat.core.declare('C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.clickSignup$$cat', {
  scrap: {
    "name": ["clickSignup"],
    "embed": ["true"],
    "jqm": ["clickButton(\"#signup\");"],
    "file": "C:/Users/snirr/workspace/catjs/test/check_path/cat-project/target/checkpath/path2/path3/index.html",
    "scrapinfo": {
      "start": {
        "line": 133,
        "col": 3
      },
      "end": {
        "line": 137,
        "col": 5
      }
    },
    "commentinfo": {
      "start": {
        "line": 132,
        "col": 2
      },
      "end": {
        "line": 138,
        "col": 5
      }
    },
    "single": {
      "name": true,
      "embed": true,
      "jqm": false,
      "file": true,
      "scrapinfo": true,
      "commentinfo": true,
      "single": true,
      "singleton": true,
      "arguments": true,
      "context": false,
      "auto": true,
      "injectcode": true,
      "id": true,
      "$type": true,
      "numCommands": true
    },
    "singleton": {
      "name": -1,
      "embed": -1,
      "jqm": -1,
      "file": -1,
      "scrapinfo": -1,
      "commentinfo": -1,
      "single": -1,
      "singleton": -1,
      "arguments": -1,
      "context": 1,
      "auto": -1,
      "injectcode": -1,
      "id": -1,
      "$type": -1,
      "numCommands": -1
    },
    "arguments": ["thi$"],
    "context": ["thi$"],
    "auto": true,
    "injectcode": false,
    "id": "scrap_20be1989-a333-293b-41e2-f33885adfa4e",
    "$type": "html",
    "numCommands": 2,
    "pkgName": "C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.clickSignup"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.clickSignup$$cat", function(thi$) {

  var pkgName = "C:.Users.snirr.workspace.catjs.test.check_path.cat-project.target.checkpath.path2.path3.index.html.clickSignup$$cat",
    _argsrefs = arguments,
    _argsnames = "thi$",
    _args = {},
    _ipkg = _cat.core.getVar(pkgName),
    _counter = 0;

  if (_args) {
    _argsnames = _argsnames.split(",");
    _argsnames.forEach(function(arg) {
      _args[arg] = _argsrefs[_counter];
      _counter++;
    });
  }

  /* test content in here */
  _cat.core.clientmanager.delayManager(["_cat.core.ui.setContent({style: 'color:#0080FF', header: 'clickSignup', desc: 'clickButton(\"#signup\");',tips: ''});"], {
    scrap: _ipkg.scrap,
    args: _args
  });
  _cat.core.clientmanager.delayManager(["_cat.core.plugin(\"jqm\").actions.clickButton(\"#signup\");"], {
    scrap: _ipkg.scrap,
    args: _args
  });
});
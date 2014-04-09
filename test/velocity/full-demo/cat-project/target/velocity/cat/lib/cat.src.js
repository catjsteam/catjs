_cat.core.declare('C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.testButtonListener$$cat', {
  scrap: {
    "name": ["testButtonListener"],
    "context": ["description"],
    "log": ["\"Description: \", description.text().trim()"],
    "assert": ["ok((description.text().trim() !== \"Clicks +3\"), \"More then 2 clicks is too much...\")"],
    "file": "C:/Users/snirr/workspace/CATCore/test/velocity/full-demo/cat-project/target/velocity/app.js",
    "scrapinfo": {
      "start": {
        "line": 22,
        "col": 13
      },
      "end": {
        "line": 27,
        "col": 15
      }
    },
    "commentinfo": {
      "start": {
        "line": 19,
        "col": 12
      },
      "end": {
        "line": 28,
        "col": 15
      }
    },
    "single": {
      "name": true,
      "context": false,
      "log": true,
      "assert": false,
      "file": true,
      "scrapinfo": true,
      "commentinfo": true,
      "single": true,
      "singleton": true,
      "arguments": true,
      "auto": true,
      "id": true,
      "$type": true
    },
    "singleton": {
      "name": -1,
      "context": 1,
      "log": -1,
      "assert": -1,
      "file": -1,
      "scrapinfo": -1,
      "commentinfo": -1,
      "single": -1,
      "singleton": -1,
      "arguments": -1,
      "auto": -1,
      "id": -1,
      "$type": -1
    },
    "arguments": ["description"],
    "auto": true,
    "id": "scrap_1",
    "$type": "js",
    "pkgName": "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.testButtonListener"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.testButtonListener$$cat", function(description) {

  var pkgName = "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.testButtonListener$$cat";

  /* test content in here */

  /*  Generated log statement according to the scrap comment (see @@code) */
  console.log("Description: ", description.text().trim());
  _cat.utils.chai.assert({
    code: "assert.ok(description.text().trim()!==\"Clicks +3\",\"More then 2 clicks is too much...\")\n",
    fail: true,
    scrap: {
      "config": {
        "name": ["testButtonListener"],
        "context": ["description"],
        "log": ["\"Description: \", description.text().trim()"],
        "assert": ["ok((description.text().trim() !== \"Clicks +3\"), \"More then 2 clicks is too much...\")"],
        "file": "C:/Users/snirr/workspace/CATCore/test/velocity/full-demo/cat-project/target/velocity/app.js",
        "scrapinfo": {
          "start": {
            "line": 22,
            "col": 13
          },
          "end": {
            "line": 27,
            "col": 15
          }
        },
        "commentinfo": {
          "start": {
            "line": 19,
            "col": 12
          },
          "end": {
            "line": 28,
            "col": 15
          }
        },
        "single": {
          "name": true,
          "context": false,
          "log": true,
          "assert": false,
          "file": true,
          "scrapinfo": true,
          "commentinfo": true,
          "single": true,
          "singleton": true,
          "arguments": true,
          "auto": true,
          "id": true,
          "$type": true
        },
        "singleton": {
          "name": -1,
          "context": 1,
          "log": -1,
          "assert": -1,
          "file": -1,
          "scrapinfo": -1,
          "commentinfo": -1,
          "single": -1,
          "singleton": -1,
          "arguments": -1,
          "auto": -1,
          "id": -1,
          "$type": -1
        },
        "arguments": ["description"],
        "auto": true,
        "id": "scrap_1",
        "$type": "js"
      },
      "output": ["\n/*  Generated log statement according to the scrap comment (see @@code) */\nconsole.log(\"Description: \", description.text().trim());"],
      "$$context": {
        "$$context": {
          "name": "testButtonListener",
          "context": ["description"],
          "log": "\"Description: \", description.text().trim()",
          "assert": ["ok((description.text().trim() !== \"Clicks +3\"), \"More then 2 clicks is too much...\")"]
        }
      }
    },
    args: {
      description: description
    }
  });
});
_cat.core.setManager("manager", "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.testButtonClick$$cat");
_cat.core.declare('C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.testButtonClick$$cat', {
  scrap: {
    "name": ["testButtonClick"],
    "run@": ["manager"],
    "context": ["testButton"],
    "assert": ["ok(testButton[0], \"No valid test element button\")"],
    "code": ["testButton.click();"],
    "file": "C:/Users/snirr/workspace/CATCore/test/velocity/full-demo/cat-project/target/velocity/app.js",
    "scrapinfo": {
      "start": {
        "line": 35,
        "col": 5
      },
      "end": {
        "line": 41,
        "col": 7
      }
    },
    "commentinfo": {
      "start": {
        "line": 32,
        "col": 4
      },
      "end": {
        "line": 42,
        "col": 7
      }
    },
    "single": {
      "name": true,
      "run@": true,
      "context": false,
      "assert": false,
      "code": false,
      "file": true,
      "scrapinfo": true,
      "commentinfo": true,
      "single": true,
      "singleton": true,
      "arguments": true,
      "auto": true,
      "id": true,
      "$type": true
    },
    "singleton": {
      "name": -1,
      "run@": -1,
      "context": 1,
      "assert": -1,
      "code": -1,
      "file": -1,
      "scrapinfo": -1,
      "commentinfo": -1,
      "single": -1,
      "singleton": -1,
      "arguments": -1,
      "auto": -1,
      "id": -1,
      "$type": -1
    },
    "arguments": ["testButton"],
    "auto": true,
    "id": "scrap_2",
    "$type": "js",
    "pkgName": "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.testButtonClick"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.testButtonClick$$cat", function(testButton) {

  var pkgName = "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.testButtonClick$$cat";

  /* test content in here */
  _cat.utils.chai.assert({
    code: "assert.ok(testButton[0],\"No valid test element button\")\n",
    fail: true,
    scrap: {
      "config": {
        "name": ["testButtonClick"],
        "run@": ["manager"],
        "context": ["testButton"],
        "assert": ["ok(testButton[0], \"No valid test element button\")"],
        "code": ["testButton.click();"],
        "file": "C:/Users/snirr/workspace/CATCore/test/velocity/full-demo/cat-project/target/velocity/app.js",
        "scrapinfo": {
          "start": {
            "line": 35,
            "col": 5
          },
          "end": {
            "line": 41,
            "col": 7
          }
        },
        "commentinfo": {
          "start": {
            "line": 32,
            "col": 4
          },
          "end": {
            "line": 42,
            "col": 7
          }
        },
        "single": {
          "name": true,
          "run@": true,
          "context": false,
          "assert": false,
          "code": false,
          "file": true,
          "scrapinfo": true,
          "commentinfo": true,
          "single": true,
          "singleton": true,
          "arguments": true,
          "auto": true,
          "id": true,
          "$type": true
        },
        "singleton": {
          "name": -1,
          "run@": -1,
          "context": 1,
          "assert": -1,
          "code": -1,
          "file": -1,
          "scrapinfo": -1,
          "commentinfo": -1,
          "single": -1,
          "singleton": -1,
          "arguments": -1,
          "auto": -1,
          "id": -1,
          "$type": -1
        },
        "arguments": ["testButton"],
        "auto": true,
        "id": "scrap_2",
        "$type": "js"
      },
      "output": [],
      "$$context": {
        "$$context": {
          "name": "testButtonClick",
          "context": ["testButton"],
          "code": ["testButton.click();"],
          "run@": "manager",
          "assert": ["ok(testButton[0], \"No valid test element button\")"]
        }
      }
    },
    args: {
      testButton: testButton
    }
  });

  /*  Generated code according to the scrap comment (see @@code) */
  testButton.click();
});
_cat.core.declare('C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.manager$$cat', {
  scrap: {
    "name": ["manager"],
    "perform": ["@@testButtonClick repeat(3)"],
    "catui": ["on"],
    "manager": ["true"],
    "signal": ["TESTEND"],
    "file": "C:/Users/snirr/workspace/CATCore/test/velocity/full-demo/cat-project/target/velocity/app.js",
    "scrapinfo": {
      "start": {
        "line": 49,
        "col": 5
      },
      "end": {
        "line": 57,
        "col": 7
      }
    },
    "commentinfo": {
      "start": {
        "line": 44,
        "col": 4
      },
      "end": {
        "line": 59,
        "col": 7
      }
    },
    "single": {
      "name": true,
      "perform": false,
      "catui": true,
      "manager": false,
      "signal": true,
      "file": true,
      "scrapinfo": true,
      "commentinfo": true,
      "single": true,
      "singleton": true,
      "arguments": true,
      "auto": true,
      "id": true,
      "$type": true
    },
    "singleton": {
      "name": -1,
      "perform": -1,
      "catui": -1,
      "manager": 1,
      "signal": -1,
      "file": -1,
      "scrapinfo": -1,
      "commentinfo": -1,
      "single": -1,
      "singleton": -1,
      "arguments": -1,
      "auto": -1,
      "id": -1,
      "$type": -1
    },
    "arguments": [],
    "auto": true,
    "id": "scrap_3",
    "$type": "js",
    "pkgName": "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.manager"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.manager$$cat", function() {

  var pkgName = "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.manager$$cat";

  /* test content in here */

  /*  Add Manager behavior  */
  _cat.core.setManagerBehavior('manager', 'testButtonClick', 'repeat(3)');

  /*  CAT UI call  */
  _cat.core.ui.on();

  /*  Manager call  */
  (function() {
    _cat.core.managerCall('manager', function() {
      _cat.utils.Signal.send('TESTEND');
    });
  })();
});
_cat.core.declare('C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setUsername$$cat', {
  scrap: {
    "name": ["setUsername"],
    "embed": ["true"],
    "jqm": ["setText(\"username\", \"test1\");"],
    "file": "C:/Users/snirr/workspace/CATCore/test/velocity/full-demo/cat-project/target/velocity/index.html",
    "scrapinfo": {
      "start": {
        "line": 34,
        "col": 18
      },
      "end": {
        "line": 38,
        "col": 20
      }
    },
    "commentinfo": {
      "start": {
        "line": 33,
        "col": 8
      },
      "end": {
        "line": 39,
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
      "auto": true,
      "id": true,
      "$type": true
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
      "auto": -1,
      "id": -1,
      "$type": -1
    },
    "arguments": [],
    "auto": true,
    "id": "scrap_5",
    "$type": "html",
    "pkgName": "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setUsername"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setUsername$$cat", function() {

  var pkgName = "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setUsername$$cat";

  /* test content in here */
  _cat.core.ui.setContent({
    style: 'color:#0080FF',
    header: 'setUsername',
    desc: 'setText("username", "test1");',
    tips: ''
  });
  _cat.core.plugin('jqm').actions.setText("username", "test1");
});
_cat.core.declare('C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setUsername2$$cat', {
  scrap: {
    "name": ["setUsername2"],
    "embed": ["true"],
    "jqm": ["setText(\"username\", \"test2\");"],
    "file": "C:/Users/snirr/workspace/CATCore/test/velocity/full-demo/cat-project/target/velocity/index.html",
    "scrapinfo": {
      "start": {
        "line": 42,
        "col": 18
      },
      "end": {
        "line": 46,
        "col": 20
      }
    },
    "commentinfo": {
      "start": {
        "line": 41,
        "col": 8
      },
      "end": {
        "line": 47,
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
      "auto": true,
      "id": true,
      "$type": true
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
      "auto": -1,
      "id": -1,
      "$type": -1
    },
    "arguments": [],
    "auto": true,
    "id": "scrap_6",
    "$type": "html",
    "pkgName": "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setUsername2"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setUsername2$$cat", function() {

  var pkgName = "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setUsername2$$cat";

  /* test content in here */
  _cat.core.ui.setContent({
    style: 'color:#0080FF',
    header: 'setUsername2',
    desc: 'setText("username", "test2");',
    tips: ''
  });
  _cat.core.plugin('jqm').actions.setText("username", "test2");
});
_cat.core.declare('C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setFullname$$cat', {
  scrap: {
    "name": ["setFullname"],
    "embed": ["true"],
    "jqm": ["setText(\"fullname\", \"this is my name\");"],
    "file": "C:/Users/snirr/workspace/CATCore/test/velocity/full-demo/cat-project/target/velocity/index.html",
    "scrapinfo": {
      "start": {
        "line": 54,
        "col": 18
      },
      "end": {
        "line": 58,
        "col": 20
      }
    },
    "commentinfo": {
      "start": {
        "line": 53,
        "col": 8
      },
      "end": {
        "line": 59,
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
      "auto": true,
      "id": true,
      "$type": true
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
      "auto": -1,
      "id": -1,
      "$type": -1
    },
    "arguments": [],
    "auto": true,
    "id": "scrap_7",
    "$type": "html",
    "pkgName": "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setFullname"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setFullname$$cat", function() {

  var pkgName = "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setFullname$$cat";

  /* test content in here */
  _cat.core.ui.setContent({
    style: 'color:#0080FF',
    header: 'setFullname',
    desc: 'setText("fullname", "this is my name");',
    tips: ''
  });
  _cat.core.plugin('jqm').actions.setText("fullname", "this is my name");
});
_cat.core.declare('C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setEmail$$cat', {
  scrap: {
    "name": ["setEmail"],
    "embed": ["true"],
    "jqm": ["setText(\"email\", \"catjsteam@gmail.com\");"],
    "file": "C:/Users/snirr/workspace/CATCore/test/velocity/full-demo/cat-project/target/velocity/index.html",
    "scrapinfo": {
      "start": {
        "line": 66,
        "col": 26
      },
      "end": {
        "line": 70,
        "col": 28
      }
    },
    "commentinfo": {
      "start": {
        "line": 65,
        "col": 8
      },
      "end": {
        "line": 71,
        "col": 19
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
      "auto": true,
      "id": true,
      "$type": true
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
      "auto": -1,
      "id": -1,
      "$type": -1
    },
    "arguments": [],
    "auto": true,
    "id": "scrap_8",
    "$type": "html",
    "pkgName": "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setEmail"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setEmail$$cat", function() {

  var pkgName = "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setEmail$$cat";

  /* test content in here */
  _cat.core.ui.setContent({
    style: 'color:#0080FF',
    header: 'setEmail',
    desc: 'setText("email", "catjsteam@gmail.com");',
    tips: ''
  });
  _cat.core.plugin('jqm').actions.setText("email", "catjsteam@gmail.com");
});
_cat.core.declare('C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setPassword$$cat', {
  scrap: {
    "name": ["setPassword"],
    "embed": ["true"],
    "jqm": ["setText(\"password\", \"123456789\");"],
    "file": "C:/Users/snirr/workspace/CATCore/test/velocity/full-demo/cat-project/target/velocity/index.html",
    "scrapinfo": {
      "start": {
        "line": 78,
        "col": 34
      },
      "end": {
        "line": 82,
        "col": 36
      }
    },
    "commentinfo": {
      "start": {
        "line": 77,
        "col": 8
      },
      "end": {
        "line": 83,
        "col": 27
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
      "auto": true,
      "id": true,
      "$type": true
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
      "auto": -1,
      "id": -1,
      "$type": -1
    },
    "arguments": [],
    "auto": true,
    "id": "scrap_9",
    "$type": "html",
    "pkgName": "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setPassword"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setPassword$$cat", function() {

  var pkgName = "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setPassword$$cat";

  /* test content in here */
  _cat.core.ui.setContent({
    style: 'color:#0080FF',
    header: 'setPassword',
    desc: 'setText("password", "123456789");',
    tips: ''
  });
  _cat.core.plugin('jqm').actions.setText("password", "123456789");
});
_cat.core.declare('C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setRepeatPassword$$cat', {
  scrap: {
    "name": ["setRepeatPassword"],
    "embed": ["true"],
    "jqm": ["setText(\"repeatpassword\", \"123456789\");"],
    "file": "C:/Users/snirr/workspace/CATCore/test/velocity/full-demo/cat-project/target/velocity/index.html",
    "scrapinfo": {
      "start": {
        "line": 90,
        "col": 34
      },
      "end": {
        "line": 94,
        "col": 36
      }
    },
    "commentinfo": {
      "start": {
        "line": 89,
        "col": 8
      },
      "end": {
        "line": 95,
        "col": 27
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
      "auto": true,
      "id": true,
      "$type": true
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
      "auto": -1,
      "id": -1,
      "$type": -1
    },
    "arguments": [],
    "auto": true,
    "id": "scrap_10",
    "$type": "html",
    "pkgName": "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setRepeatPassword"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setRepeatPassword$$cat", function() {

  var pkgName = "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setRepeatPassword$$cat";

  /* test content in here */
  _cat.core.ui.setContent({
    style: 'color:#0080FF',
    header: 'setRepeatPassword',
    desc: 'setText("repeatpassword", "123456789");',
    tips: ''
  });
  _cat.core.plugin('jqm').actions.setText("repeatpassword", "123456789");
});
_cat.core.define("C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.testButtonListener", function() {

  var pkgName = "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.testButtonListener";

  return {

    /**
     * Init functionality for scrap C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.testButtonListener
     *
     * @param content CAT Context object
     */
    init: function(context) {

    }
  };

}());
_cat.core.define("C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.testButtonClick", function() {

  var pkgName = "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.testButtonClick";

  return {

    /**
     * Init functionality for scrap C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.testButtonClick
     *
     * @param content CAT Context object
     */
    init: function(context) {

    }
  };

}());
_cat.core.define("C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.manager", function() {

  var pkgName = "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.manager";

  return {

    /**
     * Init functionality for scrap C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.app.manager
     *
     * @param content CAT Context object
     */
    init: function(context) {

    }
  };

}());
_cat.core.define("C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setUsername", function() {

  var pkgName = "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setUsername";

  return {

    /**
     * Init functionality for scrap C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setUsername
     *
     * @param content CAT Context object
     */
    init: function(context) {

    }
  };

}());
_cat.core.define("C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setUsername2", function() {

  var pkgName = "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setUsername2";

  return {

    /**
     * Init functionality for scrap C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setUsername2
     *
     * @param content CAT Context object
     */
    init: function(context) {

    }
  };

}());
_cat.core.define("C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setFullname", function() {

  var pkgName = "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setFullname";

  return {

    /**
     * Init functionality for scrap C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setFullname
     *
     * @param content CAT Context object
     */
    init: function(context) {

    }
  };

}());
_cat.core.define("C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setEmail", function() {

  var pkgName = "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setEmail";

  return {

    /**
     * Init functionality for scrap C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setEmail
     *
     * @param content CAT Context object
     */
    init: function(context) {

    }
  };

}());
_cat.core.define("C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setPassword", function() {

  var pkgName = "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setPassword";

  return {

    /**
     * Init functionality for scrap C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setPassword
     *
     * @param content CAT Context object
     */
    init: function(context) {

    }
  };

}());
_cat.core.define("C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setRepeatPassword", function() {

  var pkgName = "C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setRepeatPassword";

  return {

    /**
     * Init functionality for scrap C:.Users.snirr.workspace.CATCore.test.velocity.full-demo.cat-project.target.velocity.index.html.setRepeatPassword
     *
     * @param content CAT Context object
     */
    init: function(context) {

    }
  };

}());
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
      "id": -1,
      "$type": -1
    },
    "arguments": ["description"],
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
          "id": -1,
          "$type": -1
        },
        "arguments": ["description"],
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
      "id": -1,
      "$type": -1
    },
    "arguments": ["testButton"],
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
          "id": -1,
          "$type": -1
        },
        "arguments": ["testButton"],
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
      "id": -1,
      "$type": -1
    },
    "arguments": [],
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
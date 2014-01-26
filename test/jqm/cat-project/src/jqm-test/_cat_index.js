_cat.core.setManager("mainPageManager", "C:.Users.snirr.workspace.CATBackup.backup.cat.test.jqm.cat-project.target.jqm-test.index.html.formWidgetsScroll$$cat");
_cat.core.declare('C:.Users.snirr.workspace.CATBackup.backup.cat.test.jqm.cat-project.target.jqm-test.index.html.formWidgetsScroll$$cat', {
  scrap: {
    "name": ["formWidgetsScroll"],
    "run@": ["mainPageManager"],
    "embed": ["true"],
    "jqm": ["scrollTo(\"formWidgets\");"],
    "file": "C:/Users/snirr/workspace/CATBackup/backup/cat/test/jqm/cat-project/target/jqm-test/index.html",
    "scrapinfo": {
      "start": {
        "line": 85,
        "col": 18
      },
      "end": {
        "line": 90,
        "col": 20
      }
    },
    "commentinfo": {
      "start": {
        "line": 84,
        "col": 16
      },
      "end": {
        "line": 91,
        "col": 16
      }
    },
    "single": {
      "name": true,
      "run@": true,
      "embed": true,
      "jqm": false,
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
      "embed": -1,
      "jqm": -1,
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
    "id": "scrap_23",
    "$type": "html",
    "pkgName": "C:.Users.snirr.workspace.CATBackup.backup.cat.test.jqm.cat-project.target.jqm-test.index.html.formWidgetsScroll"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.CATBackup.backup.cat.test.jqm.cat-project.target.jqm-test.index.html.formWidgetsScroll$$cat", function() {

  var pkgName = "C:.Users.snirr.workspace.CATBackup.backup.cat.test.jqm.cat-project.target.jqm-test.index.html.formWidgetsScroll$$cat";

  /* test content in here */
  _cat.core.plugin('jqm').actions.scrollTo("formWidgets");
});
_cat.core.setManager("mainPageManager", "C:.Users.snirr.workspace.CATBackup.backup.cat.test.jqm.cat-project.target.jqm-test.index.html.checkboxradioClick$$cat");
_cat.core.declare('C:.Users.snirr.workspace.CATBackup.backup.cat.test.jqm.cat-project.target.jqm-test.index.html.checkboxradioClick$$cat', {
  scrap: {
    "name": ["checkboxradioClick"],
    "run@": ["mainPageManager"],
    "embed": ["true"],
    "jqm": ["clickRef(\"checkboxradioPage\");"],
    "file": "C:/Users/snirr/workspace/CATBackup/backup/cat/test/jqm/cat-project/target/jqm-test/index.html",
    "scrapinfo": {
      "start": {
        "line": 96,
        "col": 22
      },
      "end": {
        "line": 101,
        "col": 24
      }
    },
    "commentinfo": {
      "start": {
        "line": 95,
        "col": 20
      },
      "end": {
        "line": 102,
        "col": 23
      }
    },
    "single": {
      "name": true,
      "run@": true,
      "embed": true,
      "jqm": false,
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
      "embed": -1,
      "jqm": -1,
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
    "id": "scrap_24",
    "$type": "html",
    "pkgName": "C:.Users.snirr.workspace.CATBackup.backup.cat.test.jqm.cat-project.target.jqm-test.index.html.checkboxradioClick"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.CATBackup.backup.cat.test.jqm.cat-project.target.jqm-test.index.html.checkboxradioClick$$cat", function() {

  var pkgName = "C:.Users.snirr.workspace.CATBackup.backup.cat.test.jqm.cat-project.target.jqm-test.index.html.checkboxradioClick$$cat";

  /* test content in here */
  _cat.core.plugin('jqm').actions.clickRef("checkboxradioPage");
});
_cat.core.declare('C:.Users.snirr.workspace.CATBackup.backup.cat.test.jqm.cat-project.target.jqm-test.index.html.mainPageManager$$cat', {
  scrap: {
    "name": ["mainPageManager"],
    "perform": ["@@formWidgetsScroll repeat(1)", "@@checkboxradioClick repeat(1)"],
    "catui": ["on"],
    "embed": ["true"],
    "manager": ["true"],
    "signal": ["TESTEND"],
    "file": "C:/Users/snirr/workspace/CATBackup/backup/cat/test/jqm/cat-project/target/jqm-test/index.html",
    "scrapinfo": {
      "start": {
        "line": 115,
        "col": 6
      },
      "end": {
        "line": 126,
        "col": 8
      }
    },
    "commentinfo": {
      "start": {
        "line": 114,
        "col": 8
      },
      "end": {
        "line": 127,
        "col": 9
      }
    },
    "single": {
      "name": true,
      "perform": false,
      "catui": true,
      "embed": true,
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
      "embed": -1,
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
    "id": "scrap_25",
    "$type": "html",
    "pkgName": "C:.Users.snirr.workspace.CATBackup.backup.cat.test.jqm.cat-project.target.jqm-test.index.html.mainPageManager"
  }
}, 'scrap');
_cat.core.define("C:.Users.snirr.workspace.CATBackup.backup.cat.test.jqm.cat-project.target.jqm-test.index.html.mainPageManager$$cat", function() {

  var pkgName = "C:.Users.snirr.workspace.CATBackup.backup.cat.test.jqm.cat-project.target.jqm-test.index.html.mainPageManager$$cat";

  /* test content in here */

  /*  Add Manager behavior  */
  _cat.core.setManagerBehavior('mainPageManager', 'formWidgetsScroll ', 'repeat(1)');

  /*  Add Manager behavior  */
  _cat.core.setManagerBehavior('mainPageManager', 'checkboxradioClick ', 'repeat(1)');

  /*  CAT UI call  */
  _cat.core.ui.on();

  /*  Manager call  */
  (function() {
    _cat.core.managerCall('mainPageManager', function() {
      _cat.utils.Signal.send('TESTEND');
    });
  })();
});
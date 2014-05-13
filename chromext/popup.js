
// Add links to allLinks and visibleLinks, sort and show them.  send_links.js is
// injected into all frames of the active tab, so this listener may be called
// multiple times.
chrome.extension.onRequest.addListener(
	function(data) {
		switch(data.requestId){
			case 1:
				if(data.console!=null){
					document.getElementById("showConsole").checked = data.console;
				}
				chrome.tabs.getSelected(null, function(tab) {
					chrome.tabs.sendRequest(tab.id,
						{"getStepsInfo": true},
						function readResponse() {}
					);
				});
				break;
			case 2:
				var steps = data.steps.split(",");
				var currentStep = data.currentStep;
				
				console.log("popup currentStep>>", currentStep)
				
				if(!currentStep || currentStep=="" || currentStep.length==0){
					currentStep = steps[0];
				};
				var msg = data.msg;
				document.getElementById("canRun").innerHTML = msg;
				document.getElementById("canRun").style.color = "#999";
				document.getElementById("btnGo").disabled = false;
				// clear all drop-down nodes - reset
				var dropdown = document.getElementById("testSelection");
				while ( dropdown.firstChild ) {
					dropdown.removeChild( dropdown.firstChild )
				}
				// add new nodes
				for(var i=0;i<steps.length;i++){
					dropdown.add(new Option("Step " + steps[i], steps[i]), null) //add new option to end of "sample"
					if(steps[i] == currentStep){
						dropdown.selectedIndex = i;
					}
				}
				break;
		}
	}
);

// Set up event handlers and inject send_links.js into all frames in the active
// tab.
window.onload = function() {
	chrome.windows.getCurrent(function (currentWindow) {
		chrome.tabs.query({active: true, windowId: currentWindow.id},
                    function(activeTabs) {
							chrome.tabs.executeScript(
								activeTabs[0].id, {file: 'contentscript.js', allFrames: true}
							);
							chrome.tabs.insertCSS(
								activeTabs[0].id, {file: 'contentcss.css', allFrames: true}
							);
					});
		});

	document.getElementById("btnGo").onclick = function() {
			var elt = document.getElementById("testSelection");
			var stepIdx = elt.options[elt.selectedIndex].value;
			//var previewMode = document.getElementById("previewMode").checked;
			//console.log(previewMode);
			chrome.tabs.getSelected(null, function(tab) {
				  chrome.tabs.sendRequest(tab.id,
										 {"stepIdx": stepIdx}, /*,	"previewMode": previewMode*/
										 function readResponse() {}
				   );
				   window.close();
		});
	}
	document.getElementById("showConsole").onclick = function() {
		var isChecked = this.checked;
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.sendRequest(tab.id,
				{"console": isChecked},
				function readResponse() {}
			);
		});
	}
	// will init the popup with creating a div
	setTimeout(function(){
		chrome.tabs.getSelected(null, function(tab) {
			chrome.tabs.sendRequest(tab.id,
				{"initDiv": true},
				function readResponse() {}
			);
		});
	}, 300);
};






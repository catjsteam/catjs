console.log("extension test....");



function stepInfoWaitForEventor(){
	var obj = document.getElementById("eventor");
	if(!obj){
		setTimeout(stepInfoWaitForEventor, 200);
		return;
	}
	// set attribute to the div in order to read it and use it later
	var attribute = document.createAttribute("extensionFunction");
	attribute.nodeValue = "callStepsInfo";
	obj.setAttributeNode(attribute);
	fireEvent(obj,'popupEvent');
}
function stepInfoWaitForSteps(){
	var obj = document.getElementById("stepsHolder");
	if(!obj){
		setTimeout(stepInfoWaitForSteps, 200);
		return;
	}
	sendStepsToPopup();
}
function sendStepsToPopup(){
	var steps = document.getElementById('stepsHolder').value;
	var currentStep = document.getElementById('selectedStep').value;
	
	chrome.extension.sendRequest({"requestId":2, "msg":"You can run CAT test on this page", "steps":steps, "currentStep":currentStep});
}

chrome.extension.onRequest.addListener(function(request, sender, sendResponse) {
    console.log("onRequest>>", request, sender)

	if(request.initDiv===true){
		// first inject a div with a listener
		injectScript(injectedScript);
		if(document.getElementById('logConsoleWrap')){
			// case users click on the extension icon for the second time - deal with handler of draggin
			var obj = document.getElementById("eventor");
			// set attribute to the div in order to read it and use it later
			var attribute = document.createAttribute("extensionFunction");
			attribute.nodeValue = "reInitLogConsole";
			obj.setAttributeNode(attribute);
		
			fireEvent(obj,'popupEvent');
		}
	}else if(request.getStepsInfo){
		stepInfoWaitForEventor();
		stepInfoWaitForSteps();
	}else if(request.stepIdx){
		document.getElementById("selectedStep").value = request.stepIdx;
		//document.getElementById("previewMode").value = request.previewMode;
		//console.log("request.stepIdx currentStep>>", request.stepIdx)
		
		var obj = document.getElementById("eventor");
		// set attribute to the div in order to read it and use it later
		var attribute = document.createAttribute("extensionFunction");
		attribute.nodeValue = "setCurrentStep";
		obj.setAttributeNode(attribute);
		
		fireEvent(obj,'popupEvent');
        document.location.reload();

	}else if(request.console!=null){
		var obj = document.getElementById("eventor");
		// set attribute to the div in order to read it and use it later
		var attribute = document.createAttribute("extensionFunction");
		attribute.nodeValue = request.console===true?"drawLogConsole":"removeLogConsole";
		obj.setAttributeNode(attribute);
		
		fireEvent(obj,'popupEvent');
	}
})
function fireEvent(element,event, params){
	if (document.createEventObject){
		// dispatch for IE
		var evt = document.createEventObject();
		return element.fireEvent('on'+event,evt)
	}else{
		// dispatch for firefox + others
		var evt = document.createEvent("HTMLEvents");
		evt.initEvent(event, true, true ); // event type,bubbling,cancelable
		return !element.dispatchEvent(evt);
	}
}
function injectedScript(){
	console.log("injectedScript");
	var _body = document.getElementsByTagName('body')[0];
	var evtDiv, logDiv, logDivTitle, logDivBackground, steps, stepsHolder, currentStep;
	var startDragX, startDragY;
	// this div will hold and handle all events fired
	function createEventDiv(){
		if(!document.getElementById("eventor")){
			console.log("eventor was created");
			evtDiv = document.createElement("div");
			evtDiv.setAttribute('id', 'eventor');
			evtDiv.addEventListener('popupEvent',function (vars) {
				console.log("vars=", vars);
				popupExtensionEvent(evtDiv);
			},false);
			_body.appendChild(evtDiv);
		}
	}
	function callStepsInfo(){
		// selected step
		if(!document.getElementById("selectedStep")){
			currentStep = _test.project.main.getCookie("CAT_step");
			selectedStep = document.createElement("input");
			selectedStep.setAttribute('id', 'selectedStep');
			selectedStep.setAttribute('value', currentStep);
			_body.appendChild(selectedStep);
		}
		// steps holder
		if(!document.getElementById("stepsHolder")){
			steps = _test.project.main.getStepsInfo();
			console.log("steps>>>>", steps);
			stepsHolder = document.createElement("input");
			stepsHolder.setAttribute('id', 'stepsHolder');
			stepsHolder.setAttribute('value', steps);
			_body.appendChild(stepsHolder);
		}
	}
	function setCurrentStep(){
		var step = document.getElementById("selectedStep").value;
		console.log("setCurrentStep>>>>", document.getElementById("selectedStep"), step);
		_test.project.main.setCookie("CAT_step", step);
		_test.project.main.setExtensionStep(step);
	}
	function drawLogConsole(){
		//console.log("*********** drawLogConsole *************") ;
		if(!document.getElementById("logConsoleWrap")){
			
			logDiv = document.createElement("div");
			logDiv.setAttribute('id', 'logConsoleWrap');
			logDiv.setAttribute('class', 'catLogConsole');
			
			logDivBackground = document.createElement("div");
			logDivBackground.setAttribute('class', 'catLogBackground');
			
			logDivTitle = document.createElement("span");
			logDivTitle.setAttribute('id', 'logConsoleTitle');
			logDivTitle.setAttribute('class', 'catLogConsoleTitle');
			logDivTitle.innerHTML = "CAT console"
			
			addListeners(logDivTitle);
			
			textDiv = document.createElement("div");
			textDiv.setAttribute('id', 'logConsole');
			textDiv.innerHTML = "<ol id='logConsoleList'></ol>"
			
			logDiv.appendChild(logDivBackground);
			logDiv.appendChild(textDiv);
			logDiv.appendChild(logDivTitle);
			_body.appendChild(logDiv);
			
			overrideConsole();
		}else{
			var logDiv = document.getElementById('logConsoleWrap');
			logDiv.style.left = 10 + 'px';
			logDiv.style.top = 10 + 'px';
			
			var logDivTitle = document.getElementById("logConsoleTitle");
			addListeners(logDivTitle);
		}
	}
	function reInitLogConsole(){
		var logDivTitle = document.getElementById("logConsoleTitle");
		console.log(logDivTitle) ;
		addListeners(logDivTitle);
	}
	// DRAG FUNCTIONS ////////////////////////////////////////////////////////
	function addListeners(logDiv){
		logDiv.addEventListener('mousedown', extensionMouseDown, false);
		window.addEventListener('mouseup', extensionMouseUp, false);
	}
	window.extensionMouseDown = function(e){
		var div = document.getElementById('logConsoleWrap');
		startDragX = e.clientX - div.offsetLeft;
		startDragY = e.clientY - div.offsetTop;
		//console.log("startDragX", startDragX, "e.clientX", e.clientX, e);
		window.addEventListener('mousemove', extensionDivMove, true);
		e.preventDefault();
	}
	window.extensionMouseUp = function(){
		window.removeEventListener('mousemove', extensionDivMove, true);
	}
	window.extensionDivMove = function(e){
		var div = document.getElementById('logConsoleWrap');

		div.style.left = (e.clientX - startDragX) + 'px';
		div.style.top = (e.clientY - startDragY) + 'px';
		e.preventDefault();
	}
	// END DRAG FUNCTIONS ////////////////////////////////////////////////////////
	
	
	function removeLogConsole(){
		if(document.getElementById("logConsoleWrap")){
			var div = document.getElementById('logConsoleWrap');
			div.style.left = -5000 + 'px';
			div.style.top = -5000 + 'px';
		}
	}
	function overrideConsole(){
		var tempConsoleLog = window.console;
		console.log("overrideConsole", tempConsoleLog);
		var logList;
		window.console = {};
		window.console.log = function(txt){
			newList = document.createElement("li");
			newList.innerHTML = "<p>" + txt + "</p>";
			
			logList = document.getElementById("logConsoleList");//.innerHTML += txt + "<br>";
			logList.appendChild(newList);
			tempConsoleLog.log(txt);
		}
		window.console.warn = function(txt){
			//document.getElementById("logConsoleList").innerHTML += "<b>" + txt + "</b><br>";
			tempConsoleLog.log(txt);
		}
		//console.log("overrideConsole");
		
	}
	function popupExtensionEvent(elt){
        var funcName = elt.getAttribute("extensionFunction");
		var func = eval(funcName);		
		if(typeof func=="function"){
			//console.log("*********** function *************") ;
			func();
		}else{
			console.log("*********** NOT a function !!! *************") ;
		}
        
    }
	createEventDiv();
}

// communicate with the popup
//
chrome.extension.sendRequest({requestId:1, "console": document.getElementById('logConsoleWrap')?true:false});

//////////////////////////////////////////////////////////////////////////////////////////////
// Copyright(C) 2010 Abdullah Ali, voodooattack@hotmail.com                                 //
//////////////////////////////////////////////////////////////////////////////////////////////
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php       //
//////////////////////////////////////////////////////////////////////////////////////////////
 
// Injects a script into the DOM, the new script gets executed in the original page's
// context instead of the active content-script context.
//
//    Parameters:
//            source: [string/function]
//            (2..n): Function arguments if a function was passed as the first parameter.
 
 
function injectScript(source)
{
     
    // Utilities
    var isFunction = function (arg) { 
        return (Object.prototype.toString.call(arg) == "[object Function]"); 
    };
   
    var jsEscape = function (str) { 
        // Replaces quotes with numerical escape sequences to
        // avoid single-quote-double-quote-hell, also helps by escaping HTML special chars.
        if (!str || !str.length) return str;
        // use \W in the square brackets if you have trouble with any values.
        var r = /['"<>\/]/g, result = "", l = 0, c; 
        do{    c = r.exec(str);
            result += (c ? (str.substring(l, r.lastIndex-1) + "\\x" + 
                c[0].charCodeAt(0).toString(16)) : (str.substring(l)));
        } while (c && ((l = r.lastIndex) > 0))
        return (result.length ? result : str);
    };
 
    var bFunction = isFunction(source);
	var elem = document.createElement("script");    // create the new script element.
    var script, ret, id = "";
 
    if (bFunction)
    {
        // We're dealing with a function, prepare the arguments.
        var args = [];
 
        for (var i = 1; i < arguments.length; i++)
        {
            var raw = arguments[i];
            var arg;
 
            if (isFunction(raw))    // argument is a function.
                arg = "eval(\"" + jsEscape("(" + raw.toString() + ")") + "\")";
            else if (Object.prototype.toString.call(raw) == '[object Date]') // Date
                arg = "(new Date(" + raw.getTime().toString() + "))";
            else if (Object.prototype.toString.call(raw) == '[object RegExp]') // RegExp
                arg = "(new RegExp(" + raw.toString() + "))";
            else if (typeof raw === 'string' || typeof raw === 'object') // String or another object
                arg = "JSON.parse(\"" + jsEscape(JSON.stringify(raw)) + "\")";
            else
                arg = raw.toString(); // Anything else number/boolean
 
            args.push(arg);    // push the new argument on the list
        }
 
        // generate a random id string for the script block
        while (id.length < 16) id += String.fromCharCode(((!id.length || Math.random() > 0.5) ?
            0x61 + Math.floor(Math.random() * 0x19) : 0x30 + Math.floor(Math.random() * 0x9 )));
 
        // build the final script string, wrapping the original in a boot-strapper/proxy:
        script = "(function(){var value={callResult: null, throwValue: false};try{value.callResult=(("+
            source.toString()+")("+args.join()+"));}catch(e){value.throwValue=true;value.callResult=e;};"+
            "document.getElementById('"+id+"').innerText=JSON.stringify(value);})();";
 
        elem.id = id;
    }
    else // plain string, just copy it over.
    {
        script = source;
    }
 
    elem.type = "text/javascript";
    elem.innerHTML = script;
 
    // insert the element into the DOM (it starts to execute instantly)
    document.head.appendChild(elem);
 
    if (bFunction)
    {
        // get the return value from our function:
        ret = JSON.parse(elem.innerText);
 
        // remove the now-useless clutter.
        elem.parentNode.removeChild(elem);
 
        // make sure the garbage collector picks it instantly. (and hope it does)
        delete (elem);
 
        // see if our returned value was thrown or not
        if (ret.throwValue)
            throw (ret.callResult);
        else
            return (ret.callResult);
    }
    else // plain text insertion, return the new script element.
        return (elem);
}
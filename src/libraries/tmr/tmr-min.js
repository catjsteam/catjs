/**
* typedAs v1.0.0
* @author Alex Duloz ~ @alexduloz ~ http://bitspushedaround.com/
* MIT license
*/

(function() {

	var root = this;

	var self = blueprint = {

		isString: function(input) {
			return (Object.prototype.toString.call(input) === '[object String]');
		},

		isBool: function(input) {
			return (Object.prototype.toString.call(input) === '[object Boolean]');
		},

		isNumber: function(input) {
			return (Object.prototype.toString.call(input) === '[object Number]');
		},

		isInteger: function(input) {
			return (Object.prototype.toString.call(input) === '[object Number]' && input % 1 === 0);
		},

		isFloat: function(input) {
			return (Object.prototype.toString.call(input) === '[object Number]' && input % 1 !== 0);
		},

		isArray: function(input) {
			return (Object.prototype.toString.call(input) === '[object Array]');
		},

		isObject: function(input) {
			return (Object.prototype.toString.call(input) === '[object Object]');
		},

		isFunction: function(input) {
			return (Object.prototype.toString.call(input) === '[object Function]');
		},

		isUndefined: function(input) {
			return (Object.prototype.toString.call(input) === '[object Undefined]');
		},
	}
    
    // Server or client?
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = blueprint;
		}
		exports.typedAs = blueprint;
	} else {
		root.typedAs = blueprint;
	}

}).call(this);//     Underscore.js 1.5.2
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
(function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,h=e.reduce,v=e.reduceRight,g=e.filter,d=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,w=Object.keys,_=i.bind,j=function(n){return n instanceof j?n:this instanceof j?(this._wrapped=n,void 0):new j(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=j),exports._=j):n._=j,j.VERSION="1.5.2";var A=j.each=j.forEach=function(n,t,e){if(null!=n)if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a=j.keys(n),u=0,i=a.length;i>u;u++)if(t.call(e,n[a[u]],a[u],n)===r)return};j.map=j.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e.push(t.call(r,n,u,i))}),e)};var E="Reduce of empty array with no initial value";j.reduce=j.foldl=j.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduce===h)return e&&(t=j.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(E);return r},j.reduceRight=j.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduceRight===v)return e&&(t=j.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=j.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(E);return r},j.find=j.detect=function(n,t,r){var e;return O(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},j.filter=j.select=function(n,t,r){var e=[];return null==n?e:g&&n.filter===g?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&e.push(n)}),e)},j.reject=function(n,t,r){return j.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},j.every=j.all=function(n,t,e){t||(t=j.identity);var u=!0;return null==n?u:d&&n.every===d?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var O=j.some=j.any=function(n,t,e){t||(t=j.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};j.contains=j.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:O(n,function(n){return n===t})},j.invoke=function(n,t){var r=o.call(arguments,2),e=j.isFunction(t);return j.map(n,function(n){return(e?t:n[t]).apply(n,r)})},j.pluck=function(n,t){return j.map(n,function(n){return n[t]})},j.where=function(n,t,r){return j.isEmpty(t)?r?void 0:[]:j[r?"find":"filter"](n,function(n){for(var r in t)if(t[r]!==n[r])return!1;return!0})},j.findWhere=function(n,t){return j.where(n,t,!0)},j.max=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.max.apply(Math,n);if(!t&&j.isEmpty(n))return-1/0;var e={computed:-1/0,value:-1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a>e.computed&&(e={value:n,computed:a})}),e.value},j.min=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.min.apply(Math,n);if(!t&&j.isEmpty(n))return 1/0;var e={computed:1/0,value:1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a<e.computed&&(e={value:n,computed:a})}),e.value},j.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=j.random(r++),e[r-1]=e[t],e[t]=n}),e},j.sample=function(n,t,r){return arguments.length<2||r?n[j.random(n.length-1)]:j.shuffle(n).slice(0,Math.max(0,t))};var k=function(n){return j.isFunction(n)?n:function(t){return t[n]}};j.sortBy=function(n,t,r){var e=k(t);return j.pluck(j.map(n,function(n,t,u){return{value:n,index:t,criteria:e.call(r,n,t,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index-t.index}),"value")};var F=function(n){return function(t,r,e){var u={},i=null==r?j.identity:k(r);return A(t,function(r,a){var o=i.call(e,r,a,t);n(u,o,r)}),u}};j.groupBy=F(function(n,t,r){(j.has(n,t)?n[t]:n[t]=[]).push(r)}),j.indexBy=F(function(n,t,r){n[t]=r}),j.countBy=F(function(n,t){j.has(n,t)?n[t]++:n[t]=1}),j.sortedIndex=function(n,t,r,e){r=null==r?j.identity:k(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;r.call(e,n[o])<u?i=o+1:a=o}return i},j.toArray=function(n){return n?j.isArray(n)?o.call(n):n.length===+n.length?j.map(n,j.identity):j.values(n):[]},j.size=function(n){return null==n?0:n.length===+n.length?n.length:j.keys(n).length},j.first=j.head=j.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:o.call(n,0,t)},j.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},j.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},j.rest=j.tail=j.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},j.compact=function(n){return j.filter(n,j.identity)};var M=function(n,t,r){return t&&j.every(n,j.isArray)?c.apply(r,n):(A(n,function(n){j.isArray(n)||j.isArguments(n)?t?a.apply(r,n):M(n,t,r):r.push(n)}),r)};j.flatten=function(n,t){return M(n,t,[])},j.without=function(n){return j.difference(n,o.call(arguments,1))},j.uniq=j.unique=function(n,t,r,e){j.isFunction(t)&&(e=r,r=t,t=!1);var u=r?j.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:j.contains(a,r))||(a.push(r),i.push(n[e]))}),i},j.union=function(){return j.uniq(j.flatten(arguments,!0))},j.intersection=function(n){var t=o.call(arguments,1);return j.filter(j.uniq(n),function(n){return j.every(t,function(t){return j.indexOf(t,n)>=0})})},j.difference=function(n){var t=c.apply(e,o.call(arguments,1));return j.filter(n,function(n){return!j.contains(t,n)})},j.zip=function(){for(var n=j.max(j.pluck(arguments,"length").concat(0)),t=new Array(n),r=0;n>r;r++)t[r]=j.pluck(arguments,""+r);return t},j.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},j.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=j.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},j.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},j.range=function(n,t,r){arguments.length<=1&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=new Array(e);e>u;)i[u++]=n,n+=r;return i};var R=function(){};j.bind=function(n,t){var r,e;if(_&&n.bind===_)return _.apply(n,o.call(arguments,1));if(!j.isFunction(n))throw new TypeError;return r=o.call(arguments,2),e=function(){if(!(this instanceof e))return n.apply(t,r.concat(o.call(arguments)));R.prototype=n.prototype;var u=new R;R.prototype=null;var i=n.apply(u,r.concat(o.call(arguments)));return Object(i)===i?i:u}},j.partial=function(n){var t=o.call(arguments,1);return function(){return n.apply(this,t.concat(o.call(arguments)))}},j.bindAll=function(n){var t=o.call(arguments,1);if(0===t.length)throw new Error("bindAll must be passed function names");return A(t,function(t){n[t]=j.bind(n[t],n)}),n},j.memoize=function(n,t){var r={};return t||(t=j.identity),function(){var e=t.apply(this,arguments);return j.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},j.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},j.defer=function(n){return j.delay.apply(j,[n,1].concat(o.call(arguments,1)))},j.throttle=function(n,t,r){var e,u,i,a=null,o=0;r||(r={});var c=function(){o=r.leading===!1?0:new Date,a=null,i=n.apply(e,u)};return function(){var l=new Date;o||r.leading!==!1||(o=l);var f=t-(l-o);return e=this,u=arguments,0>=f?(clearTimeout(a),a=null,o=l,i=n.apply(e,u)):a||r.trailing===!1||(a=setTimeout(c,f)),i}},j.debounce=function(n,t,r){var e,u,i,a,o;return function(){i=this,u=arguments,a=new Date;var c=function(){var l=new Date-a;t>l?e=setTimeout(c,t-l):(e=null,r||(o=n.apply(i,u)))},l=r&&!e;return e||(e=setTimeout(c,t)),l&&(o=n.apply(i,u)),o}},j.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},j.wrap=function(n,t){return function(){var r=[n];return a.apply(r,arguments),t.apply(this,r)}},j.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},j.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},j.keys=w||function(n){if(n!==Object(n))throw new TypeError("Invalid object");var t=[];for(var r in n)j.has(n,r)&&t.push(r);return t},j.values=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=n[t[u]];return e},j.pairs=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=[t[u],n[t[u]]];return e},j.invert=function(n){for(var t={},r=j.keys(n),e=0,u=r.length;u>e;e++)t[n[r[e]]]=r[e];return t},j.functions=j.methods=function(n){var t=[];for(var r in n)j.isFunction(n[r])&&t.push(r);return t.sort()},j.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},j.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},j.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)j.contains(r,u)||(t[u]=n[u]);return t},j.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]===void 0&&(n[r]=t[r])}),n},j.clone=function(n){return j.isObject(n)?j.isArray(n)?n.slice():j.extend({},n):n},j.tap=function(n,t){return t(n),n};var S=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof j&&(n=n._wrapped),t instanceof j&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==String(t);case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;var a=n.constructor,o=t.constructor;if(a!==o&&!(j.isFunction(a)&&a instanceof a&&j.isFunction(o)&&o instanceof o))return!1;r.push(n),e.push(t);var c=0,f=!0;if("[object Array]"==u){if(c=n.length,f=c==t.length)for(;c--&&(f=S(n[c],t[c],r,e)););}else{for(var s in n)if(j.has(n,s)&&(c++,!(f=j.has(t,s)&&S(n[s],t[s],r,e))))break;if(f){for(s in t)if(j.has(t,s)&&!c--)break;f=!c}}return r.pop(),e.pop(),f};j.isEqual=function(n,t){return S(n,t,[],[])},j.isEmpty=function(n){if(null==n)return!0;if(j.isArray(n)||j.isString(n))return 0===n.length;for(var t in n)if(j.has(n,t))return!1;return!0},j.isElement=function(n){return!(!n||1!==n.nodeType)},j.isArray=x||function(n){return"[object Array]"==l.call(n)},j.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){j["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),j.isArguments(arguments)||(j.isArguments=function(n){return!(!n||!j.has(n,"callee"))}),"function"!=typeof/./&&(j.isFunction=function(n){return"function"==typeof n}),j.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},j.isNaN=function(n){return j.isNumber(n)&&n!=+n},j.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},j.isNull=function(n){return null===n},j.isUndefined=function(n){return n===void 0},j.has=function(n,t){return f.call(n,t)},j.noConflict=function(){return n._=t,this},j.identity=function(n){return n},j.times=function(n,t,r){for(var e=Array(Math.max(0,n)),u=0;n>u;u++)e[u]=t.call(r,u);return e},j.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))};var I={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;"}};I.unescape=j.invert(I.escape);var T={escape:new RegExp("["+j.keys(I.escape).join("")+"]","g"),unescape:new RegExp("("+j.keys(I.unescape).join("|")+")","g")};j.each(["escape","unescape"],function(n){j[n]=function(t){return null==t?"":(""+t).replace(T[n],function(t){return I[n][t]})}}),j.result=function(n,t){if(null==n)return void 0;var r=n[t];return j.isFunction(r)?r.call(n):r},j.mixin=function(n){A(j.functions(n),function(t){var r=j[t]=n[t];j.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),z.call(this,r.apply(j,n))}})};var N=0;j.uniqueId=function(n){var t=++N+"";return n?n+t:t},j.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var q=/(.)^/,B={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\t|\u2028|\u2029/g;j.template=function(n,t,r){var e;r=j.defaults({},r,j.templateSettings);var u=new RegExp([(r.escape||q).source,(r.interpolate||q).source,(r.evaluate||q).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(D,function(n){return"\\"+B[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=new Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,j);var c=function(n){return e.call(this,n,j)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},j.chain=function(n){return j(n).chain()};var z=function(n){return this._chain?j(n).chain():n};j.mixin(j),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];j.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],z.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];j.prototype[n]=function(){return z.call(this,t.apply(this._wrapped,arguments))}}),j.extend(j.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}).call(this);
//# sourceMappingURL=underscore-min.map
var underscore;/**
* typedAs v1.0.0
* @author Alex Duloz ~ @alexduloz ~ http://bitspushedaround.com/
* MIT license
*/

(function() {

	var root = this;

	var self = blueprint = {

		isString: function(input) {
			return (Object.prototype.toString.call(input) === '[object String]');
		},

		isBool: function(input) {
			return (Object.prototype.toString.call(input) === '[object Boolean]');
		},

		isNumber: function(input) {
			return (Object.prototype.toString.call(input) === '[object Number]');
		},

		isInteger: function(input) {
			return (Object.prototype.toString.call(input) === '[object Number]' && input % 1 === 0);
		},

		isFloat: function(input) {
			return (Object.prototype.toString.call(input) === '[object Number]' && input % 1 !== 0);
		},

		isArray: function(input) {
			return (Object.prototype.toString.call(input) === '[object Array]');
		},

		isObject: function(input) {
			return (Object.prototype.toString.call(input) === '[object Object]');
		},

		isFunction: function(input) {
			return (Object.prototype.toString.call(input) === '[object Function]');
		},

		isUndefined: function(input) {
			return (Object.prototype.toString.call(input) === '[object Undefined]');
		},
	}
    
    // Server or client?
	if (typeof exports !== 'undefined') {
		if (typeof module !== 'undefined' && module.exports) {
			exports = module.exports = blueprint;
		}
		exports.typedAs = blueprint;
	} else {
		root.typedAs = blueprint;
	}

}).call(this);
//     Underscore.js 1.5.2
//     http://underscorejs.org
//     (c) 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.
(function(){var n=this,t=n._,r={},e=Array.prototype,u=Object.prototype,i=Function.prototype,a=e.push,o=e.slice,c=e.concat,l=u.toString,f=u.hasOwnProperty,s=e.forEach,p=e.map,h=e.reduce,v=e.reduceRight,g=e.filter,d=e.every,m=e.some,y=e.indexOf,b=e.lastIndexOf,x=Array.isArray,w=Object.keys,_=i.bind,j=function(n){return n instanceof j?n:this instanceof j?(this._wrapped=n,void 0):new j(n)};"undefined"!=typeof exports?("undefined"!=typeof module&&module.exports&&(exports=module.exports=j),exports._=j):n._=j,j.VERSION="1.5.2";var A=j.each=j.forEach=function(n,t,e){if(null!=n)if(s&&n.forEach===s)n.forEach(t,e);else if(n.length===+n.length){for(var u=0,i=n.length;i>u;u++)if(t.call(e,n[u],u,n)===r)return}else for(var a=j.keys(n),u=0,i=a.length;i>u;u++)if(t.call(e,n[a[u]],a[u],n)===r)return};j.map=j.collect=function(n,t,r){var e=[];return null==n?e:p&&n.map===p?n.map(t,r):(A(n,function(n,u,i){e.push(t.call(r,n,u,i))}),e)};var E="Reduce of empty array with no initial value";j.reduce=j.foldl=j.inject=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),h&&n.reduce===h)return e&&(t=j.bind(t,e)),u?n.reduce(t,r):n.reduce(t);if(A(n,function(n,i,a){u?r=t.call(e,r,n,i,a):(r=n,u=!0)}),!u)throw new TypeError(E);return r},j.reduceRight=j.foldr=function(n,t,r,e){var u=arguments.length>2;if(null==n&&(n=[]),v&&n.reduceRight===v)return e&&(t=j.bind(t,e)),u?n.reduceRight(t,r):n.reduceRight(t);var i=n.length;if(i!==+i){var a=j.keys(n);i=a.length}if(A(n,function(o,c,l){c=a?a[--i]:--i,u?r=t.call(e,r,n[c],c,l):(r=n[c],u=!0)}),!u)throw new TypeError(E);return r},j.find=j.detect=function(n,t,r){var e;return O(n,function(n,u,i){return t.call(r,n,u,i)?(e=n,!0):void 0}),e},j.filter=j.select=function(n,t,r){var e=[];return null==n?e:g&&n.filter===g?n.filter(t,r):(A(n,function(n,u,i){t.call(r,n,u,i)&&e.push(n)}),e)},j.reject=function(n,t,r){return j.filter(n,function(n,e,u){return!t.call(r,n,e,u)},r)},j.every=j.all=function(n,t,e){t||(t=j.identity);var u=!0;return null==n?u:d&&n.every===d?n.every(t,e):(A(n,function(n,i,a){return(u=u&&t.call(e,n,i,a))?void 0:r}),!!u)};var O=j.some=j.any=function(n,t,e){t||(t=j.identity);var u=!1;return null==n?u:m&&n.some===m?n.some(t,e):(A(n,function(n,i,a){return u||(u=t.call(e,n,i,a))?r:void 0}),!!u)};j.contains=j.include=function(n,t){return null==n?!1:y&&n.indexOf===y?n.indexOf(t)!=-1:O(n,function(n){return n===t})},j.invoke=function(n,t){var r=o.call(arguments,2),e=j.isFunction(t);return j.map(n,function(n){return(e?t:n[t]).apply(n,r)})},j.pluck=function(n,t){return j.map(n,function(n){return n[t]})},j.where=function(n,t,r){return j.isEmpty(t)?r?void 0:[]:j[r?"find":"filter"](n,function(n){for(var r in t)if(t[r]!==n[r])return!1;return!0})},j.findWhere=function(n,t){return j.where(n,t,!0)},j.max=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.max.apply(Math,n);if(!t&&j.isEmpty(n))return-1/0;var e={computed:-1/0,value:-1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a>e.computed&&(e={value:n,computed:a})}),e.value},j.min=function(n,t,r){if(!t&&j.isArray(n)&&n[0]===+n[0]&&n.length<65535)return Math.min.apply(Math,n);if(!t&&j.isEmpty(n))return 1/0;var e={computed:1/0,value:1/0};return A(n,function(n,u,i){var a=t?t.call(r,n,u,i):n;a<e.computed&&(e={value:n,computed:a})}),e.value},j.shuffle=function(n){var t,r=0,e=[];return A(n,function(n){t=j.random(r++),e[r-1]=e[t],e[t]=n}),e},j.sample=function(n,t,r){return arguments.length<2||r?n[j.random(n.length-1)]:j.shuffle(n).slice(0,Math.max(0,t))};var k=function(n){return j.isFunction(n)?n:function(t){return t[n]}};j.sortBy=function(n,t,r){var e=k(t);return j.pluck(j.map(n,function(n,t,u){return{value:n,index:t,criteria:e.call(r,n,t,u)}}).sort(function(n,t){var r=n.criteria,e=t.criteria;if(r!==e){if(r>e||r===void 0)return 1;if(e>r||e===void 0)return-1}return n.index-t.index}),"value")};var F=function(n){return function(t,r,e){var u={},i=null==r?j.identity:k(r);return A(t,function(r,a){var o=i.call(e,r,a,t);n(u,o,r)}),u}};j.groupBy=F(function(n,t,r){(j.has(n,t)?n[t]:n[t]=[]).push(r)}),j.indexBy=F(function(n,t,r){n[t]=r}),j.countBy=F(function(n,t){j.has(n,t)?n[t]++:n[t]=1}),j.sortedIndex=function(n,t,r,e){r=null==r?j.identity:k(r);for(var u=r.call(e,t),i=0,a=n.length;a>i;){var o=i+a>>>1;r.call(e,n[o])<u?i=o+1:a=o}return i},j.toArray=function(n){return n?j.isArray(n)?o.call(n):n.length===+n.length?j.map(n,j.identity):j.values(n):[]},j.size=function(n){return null==n?0:n.length===+n.length?n.length:j.keys(n).length},j.first=j.head=j.take=function(n,t,r){return null==n?void 0:null==t||r?n[0]:o.call(n,0,t)},j.initial=function(n,t,r){return o.call(n,0,n.length-(null==t||r?1:t))},j.last=function(n,t,r){return null==n?void 0:null==t||r?n[n.length-1]:o.call(n,Math.max(n.length-t,0))},j.rest=j.tail=j.drop=function(n,t,r){return o.call(n,null==t||r?1:t)},j.compact=function(n){return j.filter(n,j.identity)};var M=function(n,t,r){return t&&j.every(n,j.isArray)?c.apply(r,n):(A(n,function(n){j.isArray(n)||j.isArguments(n)?t?a.apply(r,n):M(n,t,r):r.push(n)}),r)};j.flatten=function(n,t){return M(n,t,[])},j.without=function(n){return j.difference(n,o.call(arguments,1))},j.uniq=j.unique=function(n,t,r,e){j.isFunction(t)&&(e=r,r=t,t=!1);var u=r?j.map(n,r,e):n,i=[],a=[];return A(u,function(r,e){(t?e&&a[a.length-1]===r:j.contains(a,r))||(a.push(r),i.push(n[e]))}),i},j.union=function(){return j.uniq(j.flatten(arguments,!0))},j.intersection=function(n){var t=o.call(arguments,1);return j.filter(j.uniq(n),function(n){return j.every(t,function(t){return j.indexOf(t,n)>=0})})},j.difference=function(n){var t=c.apply(e,o.call(arguments,1));return j.filter(n,function(n){return!j.contains(t,n)})},j.zip=function(){for(var n=j.max(j.pluck(arguments,"length").concat(0)),t=new Array(n),r=0;n>r;r++)t[r]=j.pluck(arguments,""+r);return t},j.object=function(n,t){if(null==n)return{};for(var r={},e=0,u=n.length;u>e;e++)t?r[n[e]]=t[e]:r[n[e][0]]=n[e][1];return r},j.indexOf=function(n,t,r){if(null==n)return-1;var e=0,u=n.length;if(r){if("number"!=typeof r)return e=j.sortedIndex(n,t),n[e]===t?e:-1;e=0>r?Math.max(0,u+r):r}if(y&&n.indexOf===y)return n.indexOf(t,r);for(;u>e;e++)if(n[e]===t)return e;return-1},j.lastIndexOf=function(n,t,r){if(null==n)return-1;var e=null!=r;if(b&&n.lastIndexOf===b)return e?n.lastIndexOf(t,r):n.lastIndexOf(t);for(var u=e?r:n.length;u--;)if(n[u]===t)return u;return-1},j.range=function(n,t,r){arguments.length<=1&&(t=n||0,n=0),r=arguments[2]||1;for(var e=Math.max(Math.ceil((t-n)/r),0),u=0,i=new Array(e);e>u;)i[u++]=n,n+=r;return i};var R=function(){};j.bind=function(n,t){var r,e;if(_&&n.bind===_)return _.apply(n,o.call(arguments,1));if(!j.isFunction(n))throw new TypeError;return r=o.call(arguments,2),e=function(){if(!(this instanceof e))return n.apply(t,r.concat(o.call(arguments)));R.prototype=n.prototype;var u=new R;R.prototype=null;var i=n.apply(u,r.concat(o.call(arguments)));return Object(i)===i?i:u}},j.partial=function(n){var t=o.call(arguments,1);return function(){return n.apply(this,t.concat(o.call(arguments)))}},j.bindAll=function(n){var t=o.call(arguments,1);if(0===t.length)throw new Error("bindAll must be passed function names");return A(t,function(t){n[t]=j.bind(n[t],n)}),n},j.memoize=function(n,t){var r={};return t||(t=j.identity),function(){var e=t.apply(this,arguments);return j.has(r,e)?r[e]:r[e]=n.apply(this,arguments)}},j.delay=function(n,t){var r=o.call(arguments,2);return setTimeout(function(){return n.apply(null,r)},t)},j.defer=function(n){return j.delay.apply(j,[n,1].concat(o.call(arguments,1)))},j.throttle=function(n,t,r){var e,u,i,a=null,o=0;r||(r={});var c=function(){o=r.leading===!1?0:new Date,a=null,i=n.apply(e,u)};return function(){var l=new Date;o||r.leading!==!1||(o=l);var f=t-(l-o);return e=this,u=arguments,0>=f?(clearTimeout(a),a=null,o=l,i=n.apply(e,u)):a||r.trailing===!1||(a=setTimeout(c,f)),i}},j.debounce=function(n,t,r){var e,u,i,a,o;return function(){i=this,u=arguments,a=new Date;var c=function(){var l=new Date-a;t>l?e=setTimeout(c,t-l):(e=null,r||(o=n.apply(i,u)))},l=r&&!e;return e||(e=setTimeout(c,t)),l&&(o=n.apply(i,u)),o}},j.once=function(n){var t,r=!1;return function(){return r?t:(r=!0,t=n.apply(this,arguments),n=null,t)}},j.wrap=function(n,t){return function(){var r=[n];return a.apply(r,arguments),t.apply(this,r)}},j.compose=function(){var n=arguments;return function(){for(var t=arguments,r=n.length-1;r>=0;r--)t=[n[r].apply(this,t)];return t[0]}},j.after=function(n,t){return function(){return--n<1?t.apply(this,arguments):void 0}},j.keys=w||function(n){if(n!==Object(n))throw new TypeError("Invalid object");var t=[];for(var r in n)j.has(n,r)&&t.push(r);return t},j.values=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=n[t[u]];return e},j.pairs=function(n){for(var t=j.keys(n),r=t.length,e=new Array(r),u=0;r>u;u++)e[u]=[t[u],n[t[u]]];return e},j.invert=function(n){for(var t={},r=j.keys(n),e=0,u=r.length;u>e;e++)t[n[r[e]]]=r[e];return t},j.functions=j.methods=function(n){var t=[];for(var r in n)j.isFunction(n[r])&&t.push(r);return t.sort()},j.extend=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]=t[r]}),n},j.pick=function(n){var t={},r=c.apply(e,o.call(arguments,1));return A(r,function(r){r in n&&(t[r]=n[r])}),t},j.omit=function(n){var t={},r=c.apply(e,o.call(arguments,1));for(var u in n)j.contains(r,u)||(t[u]=n[u]);return t},j.defaults=function(n){return A(o.call(arguments,1),function(t){if(t)for(var r in t)n[r]===void 0&&(n[r]=t[r])}),n},j.clone=function(n){return j.isObject(n)?j.isArray(n)?n.slice():j.extend({},n):n},j.tap=function(n,t){return t(n),n};var S=function(n,t,r,e){if(n===t)return 0!==n||1/n==1/t;if(null==n||null==t)return n===t;n instanceof j&&(n=n._wrapped),t instanceof j&&(t=t._wrapped);var u=l.call(n);if(u!=l.call(t))return!1;switch(u){case"[object String]":return n==String(t);case"[object Number]":return n!=+n?t!=+t:0==n?1/n==1/t:n==+t;case"[object Date]":case"[object Boolean]":return+n==+t;case"[object RegExp]":return n.source==t.source&&n.global==t.global&&n.multiline==t.multiline&&n.ignoreCase==t.ignoreCase}if("object"!=typeof n||"object"!=typeof t)return!1;for(var i=r.length;i--;)if(r[i]==n)return e[i]==t;var a=n.constructor,o=t.constructor;if(a!==o&&!(j.isFunction(a)&&a instanceof a&&j.isFunction(o)&&o instanceof o))return!1;r.push(n),e.push(t);var c=0,f=!0;if("[object Array]"==u){if(c=n.length,f=c==t.length)for(;c--&&(f=S(n[c],t[c],r,e)););}else{for(var s in n)if(j.has(n,s)&&(c++,!(f=j.has(t,s)&&S(n[s],t[s],r,e))))break;if(f){for(s in t)if(j.has(t,s)&&!c--)break;f=!c}}return r.pop(),e.pop(),f};j.isEqual=function(n,t){return S(n,t,[],[])},j.isEmpty=function(n){if(null==n)return!0;if(j.isArray(n)||j.isString(n))return 0===n.length;for(var t in n)if(j.has(n,t))return!1;return!0},j.isElement=function(n){return!(!n||1!==n.nodeType)},j.isArray=x||function(n){return"[object Array]"==l.call(n)},j.isObject=function(n){return n===Object(n)},A(["Arguments","Function","String","Number","Date","RegExp"],function(n){j["is"+n]=function(t){return l.call(t)=="[object "+n+"]"}}),j.isArguments(arguments)||(j.isArguments=function(n){return!(!n||!j.has(n,"callee"))}),"function"!=typeof/./&&(j.isFunction=function(n){return"function"==typeof n}),j.isFinite=function(n){return isFinite(n)&&!isNaN(parseFloat(n))},j.isNaN=function(n){return j.isNumber(n)&&n!=+n},j.isBoolean=function(n){return n===!0||n===!1||"[object Boolean]"==l.call(n)},j.isNull=function(n){return null===n},j.isUndefined=function(n){return n===void 0},j.has=function(n,t){return f.call(n,t)},j.noConflict=function(){return n._=t,this},j.identity=function(n){return n},j.times=function(n,t,r){for(var e=Array(Math.max(0,n)),u=0;n>u;u++)e[u]=t.call(r,u);return e},j.random=function(n,t){return null==t&&(t=n,n=0),n+Math.floor(Math.random()*(t-n+1))};var I={escape:{"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#x27;"}};I.unescape=j.invert(I.escape);var T={escape:new RegExp("["+j.keys(I.escape).join("")+"]","g"),unescape:new RegExp("("+j.keys(I.unescape).join("|")+")","g")};j.each(["escape","unescape"],function(n){j[n]=function(t){return null==t?"":(""+t).replace(T[n],function(t){return I[n][t]})}}),j.result=function(n,t){if(null==n)return void 0;var r=n[t];return j.isFunction(r)?r.call(n):r},j.mixin=function(n){A(j.functions(n),function(t){var r=j[t]=n[t];j.prototype[t]=function(){var n=[this._wrapped];return a.apply(n,arguments),z.call(this,r.apply(j,n))}})};var N=0;j.uniqueId=function(n){var t=++N+"";return n?n+t:t},j.templateSettings={evaluate:/<%([\s\S]+?)%>/g,interpolate:/<%=([\s\S]+?)%>/g,escape:/<%-([\s\S]+?)%>/g};var q=/(.)^/,B={"'":"'","\\":"\\","\r":"r","\n":"n","	":"t","\u2028":"u2028","\u2029":"u2029"},D=/\\|'|\r|\n|\t|\u2028|\u2029/g;j.template=function(n,t,r){var e;r=j.defaults({},r,j.templateSettings);var u=new RegExp([(r.escape||q).source,(r.interpolate||q).source,(r.evaluate||q).source].join("|")+"|$","g"),i=0,a="__p+='";n.replace(u,function(t,r,e,u,o){return a+=n.slice(i,o).replace(D,function(n){return"\\"+B[n]}),r&&(a+="'+\n((__t=("+r+"))==null?'':_.escape(__t))+\n'"),e&&(a+="'+\n((__t=("+e+"))==null?'':__t)+\n'"),u&&(a+="';\n"+u+"\n__p+='"),i=o+t.length,t}),a+="';\n",r.variable||(a="with(obj||{}){\n"+a+"}\n"),a="var __t,__p='',__j=Array.prototype.join,"+"print=function(){__p+=__j.call(arguments,'');};\n"+a+"return __p;\n";try{e=new Function(r.variable||"obj","_",a)}catch(o){throw o.source=a,o}if(t)return e(t,j);var c=function(n){return e.call(this,n,j)};return c.source="function("+(r.variable||"obj")+"){\n"+a+"}",c},j.chain=function(n){return j(n).chain()};var z=function(n){return this._chain?j(n).chain():n};j.mixin(j),A(["pop","push","reverse","shift","sort","splice","unshift"],function(n){var t=e[n];j.prototype[n]=function(){var r=this._wrapped;return t.apply(r,arguments),"shift"!=n&&"splice"!=n||0!==r.length||delete r[0],z.call(this,r)}}),A(["concat","join","slice"],function(n){var t=e[n];j.prototype[n]=function(){return z.call(this,t.apply(this._wrapped,arguments))}}),j.extend(j.prototype,{chain:function(){return this._chain=!0,this},value:function(){return this._wrapped}})}).call(this);
//# sourceMappingURL=underscore-min.map
var _jsutilsModuleArray = function () {
        var _vars = {};
        return {
            internal: function (refs) {
                _vars = refs;
            },
            cleanupArray: function (arr) {
                var newArr = [];
                if (arr && _vars.typedas.isArray(arr)) {
                    arr.forEach(function (item) {
                        if (item !== null && item !== undefined) {
                            newArr.push(item);
                        }
                    });
                }
                return newArr;
            },
            removeArrayItemByValue: function (arr, value) {
                var newArr = [], counter = 0;
                if (arr && _vars.typedas.isArray(arr)) {
                    arr.forEach(function (item) {
                        if (item !== value && item !== null && item !== undefined) {
                            newArr.push(item);
                        }
                        counter++;
                    });
                }
                return newArr;
            }
        };
    }();
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        _jsutilsModuleArray.internal({ typedas: require('typedas') });
        module.exports = _jsutilsModuleArray;
    }
} else {
    var jsutilsArrayModule = function (typedasref) {
            _jsutilsModuleArray.internal({ typedas: typedAs });
            return _jsutilsModuleArray;
        }(typedAs);
};
var _jsutilsModuleObject = function () {
        var _vars = {};
        return {
            internal: function (refs) {
                _vars = refs;
            },
            contains: function (obj, value) {
                var key;
                if (obj) {
                    for (key in obj) {
                        if (_vars.typedas.isObject(value) || _vars.typedas.isArray(value)) {
                            if (JSON.stringify(obj[key]) === JSON.stringify(value)) {
                                return true;
                            }
                        } else {
                            if (obj[key] === value) {
                                return true;
                            }
                        }
                    }
                }
                return false;
            },
            copy: function (srcobj, destobj, override) {
                var name, obj, me = this, idx = 0, size = 0, item;
                override = override || false;
                if (srcobj && destobj) {
                    for (name in srcobj) {
                        if (srcobj.hasOwnProperty(name)) {
                            obj = destobj[name];
                            if (_vars.typedas.isObject(srcobj[name])) {
                                if (!destobj[name]) {
                                    destobj[name] = {};
                                }
                                arguments.callee.call(me, srcobj[name], destobj[name], override);
                            } else if (_vars.typedas.isArray(srcobj[name])) {
                                if (!obj) {
                                    destobj[name] = srcobj[name];
                                } else if (_vars.typedas.isArray(obj)) {
                                    _vars.arrayutils.cleanupArray(srcobj[name]);
                                    if (override) {
                                        destobj[name] = srcobj[name];
                                    } else {
                                        size = destobj[name].length;
                                        for (idx = 0; idx < size; idx++) {
                                            item = obj[idx];
                                            srcobj[name] = _vars.arrayutils.removeArrayItemByValue(srcobj[name], item);
                                        }
                                        destobj[name] = destobj[name].concat(srcobj[name]);
                                    }
                                }
                            } else {
                                if (override || obj === undefined) {
                                    if (!destobj[name] || destobj[name] && override) {
                                        destobj[name] = srcobj[name];
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
    }();
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        _jsutilsModuleObject.internal({
            typedas: require('typedas'),
            arrayutils: require('./Array.js')
        });
        module.exports = _jsutilsModuleObject;
    }
} else {
    var jsutilsObjectModule = function (typedasref, arrayref) {
            _jsutilsModuleObject.internal({
                typedas: typedAs,
                arrayutils: arrayref
            });
            return _jsutilsModuleObject;
        }(typedAs, jsutilsArrayModule);
};
var _jsutilsUnderscore, _jsutilsModuleTemplate = function () {
        var _cache = {}, _vars = {};
        return {
            internal: function (refs) {
                _vars = refs;
            },
            underscore: _vars._,
            readTemplateFile: function (name, path) {
                if (!path) {
                    _vars.log.error('[js.utils Template.readTemplateFile] \'path\' argument is no valid ');
                }
                var content, file = [
                        path,
                        name
                    ].join('/');
                file = _vars.path.normalize(file);
                try {
                    file = [
                        file,
                        'tpl'
                    ].join('.');
                    content = _cache[file];
                    if (!content) {
                        content = _vars.fs.readFileSync(file, 'utf8');
                    }
                    _cache[file] = content;
                } catch (e) {
                    _vars.log.warn('[js.utils Template.readTemplateFile] File failed to load ', file, e);
                }
                return content;
            },
            template: function (config) {
                if (!config) {
                    return undefined;
                }
                var name = config.name, path = config.path, data = config.data, content = config.content, funcTpl = content || this.readTemplateFile(name, path), template;
                if (funcTpl) {
                    template = _vars._.template(funcTpl);
                } else {
                    _vars.log.warn('[js.utils Template.template] Failed to process template ');
                    return undefined;
                }
                if (template) {
                    return template(data);
                }
            }
        };
    }();
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports) {
        _jsutilsUnderscore = require('underscore');
        _jsutilsUnderscore.templateSettings = { interpolate: /\{\{(.+?)\}\}/g };
        _jsutilsModuleTemplate.internal({
            fs: require('fs'),
            log: require('./Logger.js'),
            path: require('path'),
            _: _jsutilsUnderscore
        });
        module.exports = _jsutilsModuleTemplate;
    }
} else {
    var jsutilsTemplateModule = function (underscore) {
            _jsutilsModuleTemplate = function () {
                _.templateSettings = { interpolate: /\{\{(.+?)\}\}/g };
                return {
                    template: function (config) {
                        if (!config) {
                            return undefined;
                        }
                        var data = config.data, content = config.content, template;
                        if (content) {
                            template = _.template(content);
                        } else {
                            console.warn('[js.utils Template.template] Failed to process template ');
                            return undefined;
                        }
                        if (template) {
                            return template(data);
                        }
                    }
                };
            }();
            return _jsutilsModuleTemplate;
        }(underscore);
};
var jsutils = this;
jsutils.jsutilsObject = {};
jsutils.jsutilsArray = {};
jsutils.jsutilsTemplate = {};
var jsutilsweb = function (obj, arr, tpl) {
        jsutils.jsutilsObject = obj;
        jsutils.jsutilsArray = arr;
        jsutils.jsutilsTemplate = tpl;
    }(jsutilsObjectModule, jsutilsArrayModule, jsutilsTemplateModule);var _jmrEnum={TESTSUITE:"model.testsuite",TESTSUITES:"model.testsuites",TESTCASE:"model.testcase",ERROR:"model.err",SKIPPED:"model.skipped",FAILURE:"model.failure",SYSTEM:"model.system"};if(typeof exports!="undefined")typeof module!="undefined"&&module.exports&&(module.exports=_jmrEnum);else var jmrEnumModule=function(){return _jmrEnum}();var _jmrModuleUtils=function(){return{logger:function(){return console},validargs:function(e){return e?!0:(_jmrModuleUtils.logger().warn("[jmrUtilsModule.validargs] The passed argument(s) is/are not valid"),!1)}}}();if(typeof exports!="undefined")typeof module!="undefined"&&module.exports&&(module.exports=_jmrModuleUtils);else var jmrUtilsModule=function(){return _jmrModuleUtils}();var _jmrReporterModel=function(){var e,t=function(t){var n=this;this.config={},this.getName=function(){var e=n.get("name");if(!e)throw new Error("[TestUnitReporter BaseReporter.ReporterModel] 'name' property is mandatory for this class");return e},this.get=function(e){return this.config&&e?this.config[e]:undefined},this.set=function(t,r){this.config&&t&&(r&&e.isFunction(r)?this[t]=function(){return r.apply(n,arguments)}:this.config[t]=r)},this.setall=function(e){var t,n=this;if(e)for(t in e)n.set[t]=e[t]},function(){var e;n.set("root","./src/reporter");if(t)for(e in t)t.hasOwnProperty(e)&&n.set(e,t[e])}()};return{internal:function(t){e=t.typedas},model:t}}();if(typeof exports!="undefined")typeof module!="undefined"&&module.exports&&(_jmrReporterModel.internal({typedas:require("typedas")}),module.exports=_jmrReporterModel.model);else var jmrReporterModelModule=function(e){return _jmrReporterModel.internal({typedas:typedAs}),_jmrReporterModel.model}(typedAs);var _jmrJunitReporter,_jmrJunitReporterClass=function(e){var t=function(){return[this.get("root"),this.get("name"),"templates"].join("/")},n=function(t){if(!t)return!1;var n,r,i,s,o;try{r=e.path.join(this.get("root"),this.get("name"),this.get("xsd")),n=e.fs.readFileSync(r,{encoding:"utf8"}),i=e.libxmljs.parseXmlString(n),s=e.libxmljs.parseXmlString(t),o=s.validate(i)}catch(u){e.log.error("[TestUnitReporter] Reporter.validate error: ",u)}return o},r=function(t){var n=t.reportsdir,r=t.testsdir,i=e.path.join(this.get("root"),this.get("name")),s;e.fs.existsSync(n)&&e.fs.rmrfSync(e.path.resolve(n)),e.fs.existsSync(n)||e.fs.mkdirpSync(e.path.join(e.path.resolve(n),"html")),e.fs.existsSync(r)||e.fs.mkdirpSync(e.path.resolve(r)),s=e.jsutils.Template.template({path:i,name:this.get("antxml"),data:{reportsdir:e.path.resolve(n),testsdir:e.path.resolve(r)}}),e.log.log("[junit reporter] using ant reporter xml: ",s),e.antutils.parse({antcontent:s})},i=new e.basereporter({name:"junit",xsd:"junit4.xsd",antxml:"junitreport2ant",getTemplateURL:e.getTemplateUrl||t,validate:e.validate||n,report:e.report||r});return{model:function(){return i}}};if(typeof exports!="undefined"){if(typeof module!="undefined"&&module.exports){var _path=path,_basereporter=ReporterModeljs,libxmljs=libxmljs,_fs=fs.extra,_utils=requirext("jmrUtilsModule"),_log=_utils.logger(),_jsutils=js.utils,_antutils=requirext("jmrUtilsAntModule");_jmrJunitReporter=new _jmrJunitReporterClass({fs:_fs,log:_log,path:_path,jsutils:_jsutils,libxmljs:libxmljs,basereporter:_basereporter,antutils:_antutils}),module.exports=_jmrJunitReporter}}else var jmrReporterJunitModule=function(e,t,n){return _jmrJunitReporter=new _jmrJunitReporterClass({log:n.logger(),jsutils:jsutilsTemplate,basereporter:e,validate:function(){},report:function(){}}),_jmrJunitReporter}(jmrReporterModelModule,jsutils,jmrUtilsModule);var _jmrConfigModule,_jmrConfigModuleClass=function(e){var t;return{reporters:["junit"],getDefaultReporter:function(){return t||this.reporters[0]},setReporter:function(e){t=e},getReporter:function(t){var n,r,i;t=t||this.getDefaultReporter(),n=e.jsutilsobj.contains(this.reporters,t)?t:undefined;if(n){if(typeof exports!="undefined"){if(typeof module!="undefined"&&module.exports)try{r=require(["./reporter",t,"Reporter.js"].join("/"))}catch(s){}}else r=e.reporters[t];r&&(i=r.model())}return i?i:(console.log("[Test Unit Reporter] no valid reporter named: ",t),undefined)}}};if(typeof exports!="undefined")typeof module!="undefined"&&module.exports&&(_jmrConfigModule=new _jmrConfigModuleClass({jsutilsobj:require("js.utils").Object}),module.exports=_jmrConfigModule);else var jmrConfigModule=function(e,t){return _jmrConfigModule=new _jmrConfigModuleClass({jsutilsobj:jsutilsObject,reporters:{junit:t}}),_jmrConfigModule}(jsutils,jmrReporterJunitModule);var jmrTemplatesBundleModule=function(){var e={};return e["./src/reporter/junit/templates/_error.tpl"]="<error {{data.get('message')}} {{data.get('type')}} >{{data.get('body',0)}}</error>",e["./src/reporter/junit/templates/_failure.tpl"]="<failure {{data.get('message')}} {{data.get('type')}} >{{data.get('body',0)}}</failure>",e["./src/reporter/junit/templates/_skipped.tpl"]="<skipped>{{data.get('body',0)}}</skipped>",e["./src/reporter/junit/templates/_system.tpl"]="<system-{{data.systemtype}} >{{data.get('body',0)}}</system-{{data.systemtype}}>",e["./src/reporter/junit/templates/_testcase.tpl"]="<testcase {{data.get('name')}} {{data.get('assertions')}} {{data.get('classname')}} {{data.get('status')}} {{data.get('time')}}>{{data.get('body',0)}}</testcase>",e["./src/reporter/junit/templates/_testsuite.tpl"]="<testsuite {{data.get('id')}}  {{data.get('name')}}  {{data.get('disabled')}} {{data.get('errors')}}  {{data.get('failures')}}  {{data.get('hostname')}}  {{data.get('package')}} {{data.get('skipped')}} {{data.get('tests')}} {{data.get('time')}} {{data.get('timestamp')}} >{{data.get('body', 0)}}</testsuite>",e["./src/reporter/junit/templates/_testsuites.tpl"]="<testsuites {{data.get('name')}} {{data.get('disabled')}} {{data.get('errors')}} {{data.get('failures')}}  {{data.get('tests')}}  {{data.get('time')}}  >{{data.get('body',0)}} </testsuites>",e}(),_jmrModuleObject=function(){function r(e){n.mapper||(typeof exports!="undefined"?typeof module!="undefined"&&module.exports&&(n.mapper=require("./Mapper.js")):n.mapperwait||(n.mapperwait=1,function(t){n.mapper=t,n.mapperwait=0,e&&e.call(this,t)}(jmrMapperModule)))}function i(e){return r(),n.mapper&&n.mapper[e]?n.mapper[e].get(e):undefined}function s(e,t){var i,s=t.type;return r(),i=n.mapper[s],n.mapper&&i&&i[e]?i[e](t):undefined}function o(e){e&&(this.config=e||{})}function u(e){var t=[],r,s=e.clazz.type,o=e.impl,a=i(s),f,l,c,h,p,d;a&&(f=a.get("clazz"),l=a.get("tpl"));if(e.data&&n.typedas.isObject(e.data))return r=o.children(),r&&(r.forEach(function(e){t.push(u({impl:e,data:e.members?e.members:e,clazz:{type:e.type||e.config.type}}))}),e.impl.collect&&(c=e.impl.collect.call(e.impl),c&&(o.setall(c),n.jsutilsobj.copy(c,e.data)))),h=o.data.body,h&&n.typedas.isString(h)?e.data.body=h:e.data.body=t.join(""),e.data.get=function(t,n){var r;if(t){r=e.data[t],n=n!==undefined?n:1;if(r!==undefined&&r!==null)return r=r.trim?r.trim():r,r.trim&&r===""?undefined:n?[t,'="',r,'"'].join(""):r}return undefined},n.jmrconfig?(d=n.jmrconfig.getReporter(),p={content:n.tplbundle[[d.getTemplateURL(),"/_",l,".tpl"].join("")],data:{data:e.data}}):p={name:["_",l].join(""),path:global.jmr.reporter.getTemplateURL(),data:{data:e.data}},n.tplutils.template(p)}var e={},t,n={};return o.prototype.get=function(e){return this.config[e]},t={internal:function(e){n=e},loadMapper:function(e){r(function(t){e&&e.call(this,t)})},create:function(e){return n.utils.validargs(e)?s("create",e):undefined},generate:function(e){if(!n.utils.validargs(e))return undefined;var r=t.create(e);return{model:r,output:r.compile()}},get:function(t){return e?e[t]:undefined},add:function(t){if(!n.utils.validargs(t))return undefined;var r=t.type,i=t.clazz;r&&i&&n.typedas.isFunction(i)?e[r]=new o(t):n.log.warn("Failed to add map of type: ",r)},initTestClass:function(e){var r,s=this,o=e.data?e.data.body:undefined;this.body=[],this.data={},this.members={},this.classobj=i(e.type),this.getType=function(){return e.type},this.config=this.classobj?this.classobj.config:undefined,this.members.body=this.body;if(this.config&&this.config.spec&&e.data)for(r in this.config.spec)this.members[r]=e.data[r],this.data[r]=e.data[r];this.get=function(e){return this.members[e]},this.setall=function(e){var t,r;if(e&&n.typedas.isObject(e))for(t in e)e.hasOwnProperty(t)&&(r=e[t],s.set(t,r));else n.log.warn("[test.unit base.setall] No valid arguments, expected of type Object ")},this.set=function(e,t){this.members[e]=t,this.data[e]=t},this.children=function(){return this.body&&n.typedas.isArray(this.body)&&this.body.length>0?this.body:null},this.add=function(e){e&&this.body.push(e)},this.remove=function(){n.log.warn("Not implemented (in the TODO list)")},this.compile=function(){var e,t={data:{},clazz:{}};for(e in this.members)t.data[e]=this.get(e);return t.clazz=this.config,t.impl=this,u(t)},o&&(o.forEach?o.forEach(function(e){var n;e&&(n=t.create(e),s.add(n))}):s.data.body=o)}},t}();if(typeof exports!="undefined")typeof module!="undefined"&&module.exports&&(_jmrModuleObject.internal({typedas:require("typedas"),jsutilsobj:require("js.utils").Object,utils:requirext("jmrUtilsModule"),log:requirext("jmrUtilsModule").logger(),tplutils:require("js.utils").Template}),module.exports=_jmrModuleObject);else var jmrBaseModule=function(e,t,n,r,i){return _jmrModuleObject.internal({typedas:typedAs,jsutilsobj:jsutilsObject,utils:n,log:n.logger(),tplutils:jsutilsTemplate,jmrconfig:r,tplbundle:i}),_jmrModuleObject}(typedAs,jsutils,jmrUtilsModule,jmrConfigModule,jmrTemplatesBundleModule);var _jmrtcspec={spec:{name:undefined,assertions:undefined,classname:undefined,status:undefined,time:undefined},tpl:"testcase",clazz:function(e){}},_jmrModuleTestCase,_jmrModuleTestCaseClass=function(e){function t(t){e.base.initTestClass.call(this,t)}return{get:e.base.get,create:function(e){return new t(e)}}};if(typeof exports!="undefined"){if(typeof module!="undefined"&&module.exports){var _enum=Enumjs,_base=Basejs;_jmrModuleTestCase=new _jmrModuleTestCaseClass({base:_base}),_jmrtcspec.type=_enum.TESTCASE,_base.add(_jmrtcspec),module.exports=_jmrModuleTestCase}}else var jmrModelTCaseModule=function(e,t,n,r,i){return _jmrtcspec.type=r.TESTCASE,i.add(_jmrtcspec),_jmrModuleTestCase=new _jmrModuleTestCaseClass({base:i}),_jmrModuleTestCase}(typedAs,jsutils,jmrUtilsModule,jmrEnumModule,jmrBaseModule);var _jmrtssspec={spec:{disabled:undefined,errors:undefined,failures:undefined,tests:undefined,name:undefined,time:undefined},tpl:"testsuites",clazz:function(e){}},_jmrModuleTestSuites,_jmrModuleTestSuitesClass=function(e){function t(t){e.base.initTestClass.call(this,t)}return t.prototype.getCollection=function(){var t={};return e.jsutils.Object.copy({tests:0,failures:0,errors:0},t),t},t.prototype.reset=function(){this.collection=this.getCollection()},t.prototype.collect=function(){var t=this.children(),n=this;return this.reset(),t&&t.forEach(function(t){t&&t.getType()===e.enumm.TESTSUITE&&(n.collection.errors+=t.get("errors")||0,n.collection.failures+=t.get("failures")||0,n.collection.tests+=t.get("tests")||0)}),this.collection},{get:e.base.get,create:function(e){return new t(e)}}};if(typeof exports!="undefined"){if(typeof module!="undefined"&&module.exports){var _enum=Enumjs,_base=Basejs,_jsutils=js.utils,_jmrModuleTestSuites=new _jmrModuleTestSuitesClass({base:_base,jsutils:_jsutils,enumm:_enum});_jmrtssspec.type=_enum.TESTSUITES,_base.add(_jmrtssspec),module.exports=_jmrModuleTestSuites}}else var jmrModelTSuitesModule=function(e,t,n,r,i){return _jmrtssspec.type=r.TESTSUITES,i.add(_jmrtssspec),_jmrModuleTestSuites=new _jmrModuleTestSuitesClass({base:i,jsutils:{Object:jsutilsObject},enumm:r}),_jmrModuleTestSuites}(typedAs,jsutils,jmrUtilsModule,jmrEnumModule,jmrBaseModule);var _jmrtsspec={spec:{disabled:undefined,errors:undefined,failures:undefined,tests:undefined,time:undefined,hostname:undefined,id:undefined,name:undefined,"package":undefined,skipped:undefined,tests:undefined,time:undefined,timestamp:undefined},tpl:"testsuite",clazz:function(e){}},_jmrModuleTestSuite,_jmrModuleTestSuiteClass=function(e){function t(t){e.base.initTestClass.call(this,t)}return t.prototype.getCollection=function(){var t={};return e.jsutils.Object.copy({tests:0,failures:0,errors:0},t),t},t.prototype.reset=function(){this.collection=this.getCollection()},t.prototype.collect=function(){var t=this.children(),n=this;return this.reset(),t&&t.forEach(function(t){var r;t&&t.getType()===e.enumm.TESTCASE&&(n.collection.tests++,r=t.children(),r&&r.forEach(function(t){t&&(t.getType()===e.enumm.FAILURE?n.collection.failures++:t.getType()===e.enumm.ERROR&&n.collection.errors++)}))}),this.collection},{get:e.base.get,create:function(e){return new t(e)}}};if(typeof exports!="undefined"){if(typeof module!="undefined"&&module.exports){var _enum=Enumjs,_base=Basejs,_jsutils=js.utils,_jmrModuleTestSuite=new _jmrModuleTestSuiteClass({base:_base,jsutils:_jsutils,enumm:_enum});_jmrtsspec.type=_enum.TESTSUITE,_base.add(_jmrtsspec),module.exports=_jmrModuleTestSuite}}else var jmrModelTSuiteModule=function(e,t,n,r,i){return _jmrtsspec.type=r.TESTSUITE,i.add(_jmrtsspec),_jmrModuleTestSuite=new _jmrModuleTestSuiteClass({base:i,jsutils:{Object:jsutilsObject},enumm:r}),_jmrModuleTestSuite}(typedAs,jsutils,jmrUtilsModule,jmrEnumModule,jmrBaseModule);var _jmrerrorpec={spec:{message:undefined,type:undefined},tpl:"error",clazz:function(e){}},_jmrModuleError,_jmrModuleErrorClass=function(e){function t(t){e.base.initTestClass.call(this,t)}return{get:e.base.get,create:function(e){return new t(e)}}};if(typeof exports!="undefined"){if(typeof module!="undefined"&&module.exports){var _enum=Enumjs,_base=Basejs,_jsutils=js.utils,_jmrModuleError=new _jmrModuleErrorClass({base:_base,jsutils:_jsutils,enumm:_enum});_jmrerrorpec.type=_enum.ERROR,_base.add(_jmrerrorpec),module.exports=_jmrModuleError}}else var jmrModelErrModule=function(e,t,n,r,i){return _jmrerrorpec.type=r.ERROR,i.add(_jmrerrorpec),_jmrModuleError=new _jmrModuleErrorClass({base:i,jsutils:{Object:jsutilsObject},enumm:r}),_jmrModuleError}(typedAs,jsutils,jmrUtilsModule,jmrEnumModule,jmrBaseModule);var _jmrfailurepec={spec:{message:undefined,type:undefined},tpl:"failure",clazz:function(e){}},_jmrModuleFailure,_jmrModuleFailureClass=function(e){function t(t){e.base.initTestClass.call(this,t)}return{get:e.base.get,create:function(e){return new t(e)}}};if(typeof exports!="undefined"){if(typeof module!="undefined"&&module.exports){var _enum=Enumjs,_base=Basejs,_jsutils=js.utils,_jmrModuleFailure=new _jmrModuleFailureClass({base:_base,jsutils:_jsutils,enumm:_enum});_jmrfailurepec.type=_enum.FAILURE,_base.add(_jmrfailurepec),module.exports=_jmrModuleFailure}}else var jmrModelFailureModule=function(e,t,n,r,i){return _jmrfailurepec.type=r.FAILURE,i.add(_jmrfailurepec),_jmrModuleFailure=new _jmrModuleFailureClass({base:i,jsutils:{Object:jsutilsObject},enumm:r}),_jmrModuleFailure}(typedAs,jsutils,jmrUtilsModule,jmrEnumModule,jmrBaseModule);var _jmrskippedpec={spec:{},tpl:"skipped",clazz:function(e){}},_jmrModuleSkipped,_jmrModuleSkippedClass=function(e){function t(t){e.base.initTestClass.call(this,t)}return{get:e.base.get,create:function(e){return new t(e)}}};if(typeof exports!="undefined"){if(typeof module!="undefined"&&module.exports){var _enum=Enumjs,_base=Basejs,_jsutils=js.utils,_jmrModuleSkipped=new _jmrModuleSkippedClass({base:_base,jsutils:_jsutils,enumm:_enum});_jmrskippedpec.type=_enum.SKIPPED,_base.add(_jmrskippedpec),module.exports=_jmrModuleSkipped}}else var jmrModelSkippedModule=function(e,t,n,r,i){return _jmrskippedpec.type=r.SKIPPED,i.add(_jmrskippedpec),_jmrModuleSkipped=new _jmrModuleSkippedClass({base:i,jsutils:{Object:jsutilsObject},enumm:r}),_jmrModuleSkipped}(typedAs,jsutils,jmrUtilsModule,jmrEnumModule,jmrBaseModule);var _jmrsystempec={spec:{systemtype:"out"},tpl:"system",clazz:function(e){}},_jmrModuleSystem,_jmrModuleSystemClass=function(e){function t(t){e.base.initTestClass.call(this,t)}return{get:e.base.get,create:function(e){return new t(e)}}};if(typeof exports!="undefined"){if(typeof module!="undefined"&&module.exports){var _enum=Enumjs,_base=Basejs,_jsutils=js.utils,_jmrModuleSystem=new _jmrModuleSystemClass({base:_base,jsutils:_jsutils,enumm:_enum});_jmrsystempec.type=_enum.SYSTEM,_base.add(_jmrsystempec),module.exports=_jmrModuleSystem}}else var jmrModelSystemModule=function(e,t,n,r,i){return _jmrsystempec.type=r.SYSTEM,i.add(_jmrsystempec),_jmrModuleSystem=new _jmrModuleSystemClass({base:i,jsutils:{Object:jsutilsObject},enumm:r}),_jmrModuleSystem}(typedAs,jsutils,jmrUtilsModule,jmrEnumModule,jmrBaseModule);var _moduleMapper=function(){var e={},t={};return{internal:function(t){e=t},init:function(){t[e.enumm.TESTSUITE]=e.tsuite,t[e.enumm.TESTSUITES]=e.tsuites,t[e.enumm.TESTCASE]=e.tcase,t[e.enumm.ERROR]=e.err,t[e.enumm.SKIPPED]=e.skipped,t[e.enumm.FAILURE]=e.failure,t[e.enumm.SYSTEM]=e.sys},map:t}}();if(typeof exports!="undefined")typeof module!="undefined"&&module.exports&&(_moduleMapper.internal({enumm:require("./Enum.js"),tcase:requirext("jmrModelTCaseModule"),tsuites:requirext("jmrModelTSuitesModule"),tsuite:requirext("jmrModelTSuiteModule"),err:requirext("jmrModelErrModule"),failure:requirext("jmrModelFailureModule"),skipped:requirext("jmrModelSkippedModule"),sys:requirext("jmrModelSystemModule")}),_moduleMapper.init(),module.exports=_moduleMapper.map);else var jmrMapperModule=function(e,t,n,r,i,s,o,u){return _moduleMapper.internal({enumm:e,tcase:t,tsuites:n,tsuite:r,err:i,failure:s,skipped:o,sys:u}),_moduleMapper.init(),_moduleMapper.map}(jmrEnumModule,jmrModelTCaseModule,jmrModelTSuitesModule,jmrModelTSuiteModule,jmrModelErrModule,jmrModelFailureModule,jmrModelSkippedModule,jmrModelSystemModule);var underscore,_jmrModelUtilsModule,_jmrModelUtilsModuleClass=function(e){function t(t,n){if(!e.utils.validargs(n))return undefined;var r=n.type,i=n.data,s=e.basem[t],o;return s&&(n.$immediate?o=s.call(this,{clazz:{type:n.type},data:i}):o=s.call(this,{type:r,data:i})),o}return{create:function(e){return t("create",e)},generate:function(e){return t("generate",e)}}};if(typeof exports!="undefined")typeof module!="undefined"&&module.exports&&(_jmrModelUtilsModule=new _jmrModelUtilsModuleClass({utils:requirext("jmrUtilsModule"),basem:require("./Base")}),module.exports=_jmrModelUtilsModule);else var jmrModelUtilsModule=function(e,t){return _jmrModelUtilsModule=new _jmrModelUtilsModuleClass({utils:e,basem:t}),_jmrModelUtilsModule}(jmrUtilsModule,jmrBaseModule);var _jmrModule,_jmrModuleClass=function(e){function t(t,n){if(!e.utils.validargs(n))return undefined;var r=n.type;if(r)return e.mutils[t]?e.mutils[t](n):(e.log.warn("No such method: ",t),undefined)}return{model:function(){},setReporter:function(e){},create:function(e){return t("create",e)},generate:function(e){return t("generate",e)},validate:function(e){return undefined},write:function(e,t){},report:function(e){}}};if(typeof exports!="undefined"){if(typeof module!="undefined"&&module.exports){var _fs=fs,_utils,_log,_path=path;(function(){var e={jmrModelErrModule:"./src/model/Error.js",jmrModelFailureModule:"./src/model/Failure.js",jmrModelSkippedModule:"./src/model/Skipped.js",jmrModelTCaseModule:"./src/model/TestCase.js",jmrModelTSuiteModule:"./src/model/TestSuite.js",jmrModelTSuitesModule:"./src/model/TestSuites.js",jmrModelSystemModule:"./src/model/System.js",jmrModelUtilsModule:"./src/model/Utils.js",jmrUtilsModule:"./src/utils/Utils.js",jmrUtilsAntModule:"./src/utils/AntUtils.js"};global.jmr={},global.jmrbase=_path.resolve("./"),global.requirext=function(t){var n=e[t];return n||_log.warn("[jmr requirext] module name is not valid according to the key: ",t),require(n)}})(),_utils=requirext("jmrUtilsModule"),_log=_utils.logger(),global.jmr.reporter=require("./src/Config.js").getReporter(),_jmrModule=new _jmrModuleClass({fs:_fs,path:_path,utils:_utils,log:_log,mutils:requirext("jmrModelUtilsModule")}),_jmrModule.setReporter=function(e){global.jmr.reporter=require("./src/Config.js").getReporter(e)},_jmrModule.report=function(e){global.jmr.reporter.report?global.jmr.reporter.report(e):_log.wraning("[TestUnitReporter] 'report' method is not supported for reporter: '"+global.jmr.reporter.get("name")+"'")},_jmrModule.write=function(e,t){e||_log.error("[TestUnitReporter] 'file' argument for method print is required"),_fs.existsSync(e)?_log.warn("[TestUnitReporter] file: ",e," already exists"):_fs.writeFileSync(e,t)},_jmrModule.validate=function(e){var t=!1;return global.jmr.reporter.validate?t=global.jmr.reporter.validate(e):_log.wraning("[TestUnitReporter] 'validate' method is not supported for reporter: '"+global.jmr.reporter.get("name")+"'"),t},module.exports=_jmrModule}}else var jmrModule=function(e,t,n){return _jmrModule=new _jmrModuleClass({utils:t,log:t.logger(),mutils:n}),_jmrModule}(jmrConfigModule,jmrUtilsModule,jmrModelUtilsModule);var jmr,tmrweb=function(e,t){jmr=e,t.loadMapper(function(){})}(jmrModule,jmrBaseModule);
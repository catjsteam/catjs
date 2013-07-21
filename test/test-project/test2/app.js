
/**
@[scrap
	@@name scrap1
	@@code console.log('sdfsd1')
  ]@
  @[scrap 
	@@name scrap2
	@@code console.log('sdfsd2')
  ]@
*/
module.exports = function() {

	return function() {
		console.log("test module");
	};

}();

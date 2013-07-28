
/**
@[scrap
	@@name scrap1
	@@code console.log('sdfsd1')
  ]@
  @[scrap 
	@@name scrap2
	@@code console.log('sdfsd2')
  ]@
*/console.log('cat scrap: scrap2'); console.log('cat scrap: scrap1'); 
module.exports = function() {

	return function() {
		console.log("test module");
	};

}();

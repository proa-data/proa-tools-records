( function() {
angular
	.module( 'app', [ 'proaTools.records' ] )
	.controller( 'DemoController', DemoController );

function DemoController() {
	var vm = this;
	vm.list = [];
	vm.xlsFilename = 'Example file';
	vm.load = load;
	vm.empty = empty;

	function load() {
		var N_TOTAL = chance.natural( { max: 1000 } ),
			list = [];
		for ( var i = 0; i < N_TOTAL; i++ ) {
			list.push( {
				string: chance.string(),
				number: chance.integer(),
				date: chance.date(),
				boolean: chance.bool()
			} );
		}
		vm.list = list;
	}

	function empty() {
		vm.list = [];
	}
}
} )();
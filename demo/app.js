( function() {
angular
	.module( 'app', [ 'proaTools.records' ] )
	.controller( 'DemoController', DemoController );

function DemoController( $http ) {
	var vm = this;
	vm.list = [];
	vm.manage = {
		edit: edit,
		delete: deleteItem
	};
	vm.xlsFilename = 'Example file';
	vm.load = load;
	vm.empty = empty;

	function edit( newItem, oldItem ) {
		console.info( 'Item (with new string "' + newItem.string + '" and old "' + oldItem.string + '") is edited.' );
	}

	function deleteItem( item ) {
		console.info( 'Deleting item...' );
		return $http.get( './' ).then( function() {
			console.info( 'Item (with string "' + item.string + '") has been deleted.' );
		} );
	}

	function load() {
		var N_TOTAL = chance.natural( { max: 1000 } ),
			list = [],
			FLOATING_MAX = 10000;
		for ( var i = 0; i < N_TOTAL; i++ ) {
			list.push( {
				string: chance.string(),
				number: chance.floating( {
					min: -FLOATING_MAX,
					max: FLOATING_MAX
				} ),
				datetime: chance.date(),
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
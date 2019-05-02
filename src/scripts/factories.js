( function() {
angular
	.module( 'proaTools.records' )
	.factory( 'getPtItemIndex', getPtItemIndex )
	.factory( 'getAntiloopDirectiveCompileOption', getAntiloopDirectiveCompileOption )
	.factory( 'confirmDeletion', confirmDeletion );

function getPtItemIndex( uibPaginationConfig ) {
	return function( scope, index ) {
		if ( scope.enabledPagination )
			return ( scope.currentPage - 1 ) * uibPaginationConfig.itemsPerPage + index;
		return index;
	};
}

function getAntiloopDirectiveCompileOption( $compile ) {
	return function( domTransformation, scopeLinking ) {
		return function( tElement, tAttrs ) {
			domTransformation( tElement, tAttrs );
			return function( scope, iElement, iAttrs ) {
				if ( scopeLinking )
					scopeLinking( scope, iElement, iAttrs );

				iElement.removeAttr( iAttrs.$attr[ this.name ] );
				$compile( iElement )( scope );
			};
		};
	};
}

function confirmDeletion( $window, PT_RECORDS_TEXTS ) {
	return function() {
		return $window.confirm( PT_RECORDS_TEXTS.deletionConfirmation );
	};
}
} )();
( function() {
angular
	.module( 'proaTools.records' )
	.factory( 'getCompiledDirectiveOptions', getCompiledDirectiveOptions )
	.factory( 'confirmDeletion', confirmDeletion );

function getCompiledDirectiveOptions( $compile ) {
	return function( compileContent, previousPostLink ) {
		return {
			restrict: 'A',
			priority: 1000,
			terminal: true,
			compile: compile
		};

		function compile( tElement, tAttrs ) {
			compileContent( tElement, tAttrs );
			return postLink;

			function postLink( scope, iElement, iAttrs ) {
				if ( previousPostLink )
					previousPostLink( scope, iElement, iAttrs );

				iElement.removeAttr( iAttrs.$attr[ this.name ] );
				$compile( iElement )( scope );
			}
		};
	};
}

function confirmDeletion( $window, PT_RECORDS_TEXTS ) {
	return function() {
		return $window.confirm( PT_RECORDS_TEXTS.deletionConfirmation );
	};
}
} )();
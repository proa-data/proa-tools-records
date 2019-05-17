( function() {
angular
	.module( 'proaTools.records' )
	.factory( 'getAntiloopDirectiveCompileOption', getAntiloopDirectiveCompileOption )
	.factory( 'confirmDeletion', confirmDeletion );

function getAntiloopDirectiveCompileOption( $compile ) {
	return function( compile, previousPreLink ) {
		return function( tElement, tAttrs ) {
			compile( tElement, tAttrs );
			return {
				pre: preLink
			};

			function preLink( scope, iElement, iAttrs ) {
				if ( previousPreLink )
					previousPreLink( scope, iElement, iAttrs );

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
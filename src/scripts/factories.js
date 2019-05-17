( function() {
angular
	.module( 'proaTools.records' )
	.factory( 'getAntiloopDirectiveCompileOption', getAntiloopDirectiveCompileOption )
	.factory( 'confirmDeletion', confirmDeletion );

function getAntiloopDirectiveCompileOption( $compile ) {
	return function( domTransformation, scopeLinking ) {
		return function( tElement, tAttrs ) {
			domTransformation( tElement, tAttrs );
			return {
				pre: preLink
			};

			function preLink( scope, iElement, iAttrs ) {
				if ( scopeLinking )
					scopeLinking( scope, iElement, iAttrs );

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
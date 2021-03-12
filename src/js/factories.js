( function() {
angular
	.module( 'proaTools.records' )
	.factory( 'getCompiledDirectiveOptions', getCompiledDirectiveOptions );

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
} )();
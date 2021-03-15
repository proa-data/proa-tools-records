( function() {
angular
	.module( 'proaTools.records' )
	.factory( 'getCompiledDirectiveOptions', getCompiledDirectiveOptions );

function getCompiledDirectiveOptions( $compile ) {
	return function( compileContent, previousPostLink, definitionObj ) {
		return angular.merge( {
			restrict: 'A',
			compile: compile
		}, definitionObj );

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
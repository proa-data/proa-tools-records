( function() {
angular
	.module( 'proaTools.records' )
	.config( config );

function config( uibPaginationConfig ) {
	//uibPaginationConfig.itemsPerPage = 10;
	uibPaginationConfig.maxSize = 5;
	uibPaginationConfig.forceEllipses = true;
	uibPaginationConfig.previousText = '⯇';
	uibPaginationConfig.nextText = '⯈';
	uibPaginationConfig.boundaryLinkNumbers = true;
}
} )();
( function() {
angular
	.module( 'proaTools.records' )
	.config( config );

function config( uibPaginationConfig ) {
	//uibPaginationConfig.itemsPerPage = 10;
	uibPaginationConfig.maxSize = 10;
	uibPaginationConfig.forceEllipses = true;
	uibPaginationConfig.previousText = uibPaginationConfig.nextText = null;
	uibPaginationConfig.boundaryLinkNumbers = true;
}
} )();
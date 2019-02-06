/*!
 * Proa Tools Records v1.3.3 (https://github.com/proa-data/proa-tools-records)
 */

( function() {
angular.module( 'proaTools.records', [ 'ngAria', 'ui.bootstrap' ] );
} )();
( function() {
angular
	.module( 'proaTools.records' )
	.config( config );

function config( uibPaginationConfig ) {
	//uibPaginationConfig.itemsPerPage = 10;
	uibPaginationConfig.maxSize = 5;
	uibPaginationConfig.forceEllipses = true;
	uibPaginationConfig.previousText = uibPaginationConfig.nextText = null;
	uibPaginationConfig.boundaryLinkNumbers = true;
}
} )();
( function() {
angular
	.module( 'proaTools.records' )
	.constant( 'PT_RECORDS_TEXTS', {
		number: '#',
		noData: 'No data'
	} );
} )();
( function() {
angular
	.module( 'proaTools.records' )
	.constant( 'PT_PAGINATION_CLASS_NAME', 'pagination-pt-records' )
	.directive( 'ptList', ptList )
	.factory( 'getPaginationBtnDirectiveOptions', getPaginationBtnDirectiveOptions )
	.directive( 'paginationPrev', paginationPrev )
	.directive( 'paginationNext', paginationNext )
	.factory( 'compilerPostLink', compilerPostLink )
	.directive( 'ptItem', ptItem )
	.directive( 'ptOrder', ptOrder );

function ptList( $filter, uibPaginationConfig, PT_RECORDS_TEXTS, PT_PAGINATION_CLASS_NAME, $compile ) {
	return {
		restrict: 'A',
		scope: true,
		controller: ItemsController,
		compile: compile
	};

	function ItemsController( $scope, $attrs ) {
		var limitToFilter = $filter( 'limitTo' ),
			orderByFilter = $filter( 'orderBy' );

		/*$scope.$list = [];
		$scope.totalItems = [];*/
		$scope.currentPage = 1;
		$scope.enabledPagination = $attrs.ptNoPagination === undefined;
		$scope.togglePagination = togglePagination;

		$scope.getRowNumber = getRowNumber;
		//scope.exportingTable = undefined;
		$scope.exportToXls = exportToXls;

		$scope.orderConfig = {
			/*property: undefined,
			desc: false*/
		};
		$scope.sort = sort;
		$scope.isActive = isActive;
		$scope.getIconClass = getIconClass;

		$scope.$watchCollection( $attrs.ptList, function( newArray ) {
			$scope.totalItems = newArray;
			changeItems();
		} );
		$scope.$watch( 'currentPage', changeItems );
		$scope.$watch( 'enabledPagination', changeItems );
		$scope.$watchCollection( 'orderConfig', changeItems );

		function togglePagination() {
			$scope.enabledPagination = !$scope.enabledPagination;
		}

		function getRowNumber( index ) {
			var n = index + 1;
			if ( $scope.enabledPagination )
				return ( $scope.currentPage - 1 ) * uibPaginationConfig.itemsPerPage + n;
			return n;
		}

		function exportToXls() {
			XLSX.writeFile( XLSX.utils.table_to_book( $scope.exportingTable ), ( $attrs.ptFilename || 'Excel' ) + '.xlsx' );
		}

		function sort( property ) {
			var orderConfig = $scope.orderConfig;
			if ( orderConfig.property == property ) {
				if ( orderConfig.desc )
					property = undefined;
				orderConfig.desc = !orderConfig.desc;
			} else
				orderConfig.desc = false;
			orderConfig.property = property;
		}

		function isActive( property ) {
			return $scope.orderConfig.property == property;
		}

		function getIconClass( property ) {
			var orderConfig = $scope.orderConfig;
			return 'glyphicon-' + ( orderConfig.property == property ? 'arrow-' + ( orderConfig.desc ? 'down' : 'up' ) : 'sort' );
		}

		function changeItems() {
			var orderConfig = $scope.orderConfig,
				totalItems = orderByFilter( $scope.totalItems, orderConfig.property, orderConfig.desc );
			if ( $scope.enabledPagination ) {
				var itemsPerPage = uibPaginationConfig.itemsPerPage;
				$scope.$list = limitToFilter( totalItems, itemsPerPage, ( $scope.currentPage - 1 ) * itemsPerPage );
			} else
				$scope.$list = totalItems;
		}
	}

	function compile() {
		return function( scope, iElement ) {
			var totalCols = 0;
			iElement
				.find( 'thead > tr:first' )
					.prepend( compileHtml( '<th>' + PT_RECORDS_TEXTS.number + '</th>' ) )
					.find( 'th' )
						.each( function() {
							totalCols += angular.element( this ).prop( 'colspan' );
						} )
					.end()
				.end()
				.find( 'tbody' )
					.append( compileHtml( '<tr><td colspan="' + totalCols + '" ng-if="!totalItems.length">' + PT_RECORDS_TEXTS.noData + '</td></tr>' ) );

			scope.exportingTable = iElement.get( 0 );

			var parentEl = iElement.parent();
			if ( parentEl.hasClass( 'table-responsive' ) )
				iElement = parentEl;
			iElement.before( compileHtml( '<div class="clearfix" ng-show="totalItems.length">' +
				'<ul uib-pagination total-items="totalItems.length" ng-model="currentPage" class="' + PT_PAGINATION_CLASS_NAME + ' pull-left" ng-show="enabledPagination"></ul>' +
				'<div class="btn-group pull-right" role="group">' +
				'<button type="button" class="btn btn-default" ng-click="togglePagination()">' +
				'<span class="fa-stack fa-stack-pt-records" ng-show="enabledPagination"><span class="far fa-file fa-stack-1x"></span><span class="fas fa-slash fa-stack-1x"></span></span>' +
				'<span class="far fa-file" ng-show="!enabledPagination"></span>' +
				'</button>' +
				'<button type="button" class="btn btn-default" ng-click="exportToXls()"><span class="fas fa-file-excel"></span></button>' +
				'</div>' +
				'</div>' ) );

			function compileHtml( html ) {
				return $compile( html )( scope );
			}
		};
	}
}

function getPaginationBtnDirectiveOptions( PT_PAGINATION_CLASS_NAME ) {
	return function( isNext ) {
		return {
			restrict: 'C',
			link: link
		};

		function link( scope, iElement ) {
			if ( iElement.parent( '.pagination.' + PT_PAGINATION_CLASS_NAME ).length )
				iElement.children( 'a' ).html( '<span class="fas fa-chevron-' + ( isNext ? 'right' : 'left' ) + '"></span>' );
		}
	};
}

function paginationPrev( getPaginationBtnDirectiveOptions ) {
	return getPaginationBtnDirectiveOptions();
}

function paginationNext( getPaginationBtnDirectiveOptions ) {
	return getPaginationBtnDirectiveOptions( true );
}

function compilerPostLink( $compile ) {
	return function( attrName, tElement, tAttrs ) {
		tElement.removeAttr( getAttrName( tAttrs, attrName ) );
		var compileElement = $compile( tElement );
		return postLink;

		function postLink( scope ) {
			compileElement( scope );
		}
	};
}

function ptItem( compilerPostLink ) {
	return {
		restrict: 'A',
		require: '^^ptList',
		terminal: true,
		priority: 1000,
		compile: compile
	};

	function compile( tElement, tAttrs ) {
		tAttrs.$set( 'ngRepeat', ( tElement.attr( getAttrName( tAttrs, 'ptItem' ) ) || '$item' ) + ' in $list' );
		tElement.prepend( '<td class="text-right">{{getRowNumber($index) | number}}</td>' );

		return compilerPostLink( 'ptItem', tElement, tAttrs );
	}
}

function ptOrder( compilerPostLink ) {
	return {
		restrict: 'A',
		require: '^^ptList',
		terminal: true,
		priority: 1000,
		compile: compile
	};

	function compile( tElement, tAttrs ) {
		var ptOrder = tAttrs.ptOrder;
		tElement.append( '<button type="button" class="btn btn-default btn-xs pull-right btn-pt-records" ng-class="{active: isActive(\'' + ptOrder + '\')}" ng-click="sort(\'' + ptOrder + '\')">' +
			'<span class="glyphicon" ng-class="getIconClass(\'' + ptOrder + '\')"></span>' +
			'</button>' );

		return compilerPostLink( 'ptOrder', tElement, tAttrs );
	}
}

function getAttrName( attrs, name ) {
	return attrs.$attr[ name ];
}
} )();
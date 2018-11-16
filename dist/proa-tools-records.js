/*!
 * Proa Tools Records v1.0.8 (https://github.com/proa-data/proa-tools-records)
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
	uibPaginationConfig.previousText = '⯇';
	uibPaginationConfig.nextText = '⯈';
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
	.directive( 'ptList', ptList )
	.factory( 'compilerPostLink', compilerPostLink )
	.directive( 'ptItem', ptItem )
	.directive( 'ptOrder', ptOrder );

function ptList( $filter, uibPaginationConfig, PT_RECORDS_TEXTS, $compile ) {
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
		$scope.$totalItems = [];*/
		$scope.$currentPage = 1;
		$scope.orderConfig = {
			/*property: undefined,
			desc: false*/
		};
		$scope.sort = sort;
		$scope.isActive = isActive;
		$scope.getIconClass = getIconClass;

		$scope.$watchCollection( $attrs.ptList, function( newArray ) {
			$scope.$totalItems = newArray;
			changeItems();
		} );
		$scope.$watch( '$currentPage', changeItems );
		$scope.$watchCollection( 'orderConfig', changeItems );

		function sort( property ) {
			var orderConfig = $scope.orderConfig;
			if ( orderConfig.property == property ) {
				if ( orderConfig.desc ) {
					property = undefined;
				}
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
				itemsPerPage = uibPaginationConfig.itemsPerPage,
				currentPage = $scope.$currentPage;
			$scope.$list = limitToFilter( orderByFilter( $scope.$totalItems, orderConfig.property, orderConfig.desc ), itemsPerPage, ( currentPage - 1 ) * itemsPerPage );
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
					.append( compileHtml( '<tr><td colspan="' + totalCols + '" ng-show="!$totalItems.length">' + PT_RECORDS_TEXTS.noData + '</td></tr>' ) );

			var parentEl = iElement.parent();
			if ( parentEl.hasClass( 'table-responsive' ) ) {
				iElement = parentEl;
			}
			iElement.before( compileHtml( '<ul uib-pagination total-items="$totalItems.length" ng-model="$currentPage" ng-show="$totalItems.length" class="pagination-pt-records"></ul>' ) );

			function compileHtml( html ) {
				return $compile( html )( scope );
			}
		};
	}
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

function ptItem( uibPaginationConfig, compilerPostLink ) {
	return {
		restrict: 'A',
		require: '^^ptList',
		terminal: true,
		priority: 1000,
		compile: compile
	};

	function compile( tElement, tAttrs ) {
		tAttrs.$set( 'ngRepeat', ( tElement.attr( getAttrName( tAttrs, 'ptItem' ) ) || '$item' ) + ' in $list' );
		tElement.prepend( '<td class="text-right">{{($currentPage - 1) * ' + uibPaginationConfig.itemsPerPage + ' + $index + 1 | number}}</td>' );

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
		tElement.append( ' ' +
			'<button type="button" class="btn btn-default btn-xs pull-right btn-pt-records" ng-class="{active: isActive(\'' + ptOrder + '\')}" ng-click="sort(\'' + ptOrder + '\')">' +
			'<span class="glyphicon" ng-class="getIconClass(\'' + ptOrder + '\')"></span>' +
			'</button>' );

		return compilerPostLink( 'ptOrder', tElement, tAttrs );
	}
}

function getAttrName( attrs, name ) {
	return attrs.$attr[ name ];
}
} )();
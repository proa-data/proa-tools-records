/*!
 * Proa Tools Records v1.4.0 (https://github.com/proa-data/proa-tools-records)
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
		noData: 'No data',
		deletionConfirmation: 'Do you really want to delete?'
	} );
} )();
( function() {
angular
	.module( 'proaTools.records' )
	.directive( 'ptList', ptList )
	.factory( 'getPaginationDirectiveOptions', getPaginationDirectiveOptions )
	.directive( 'paginationPrev', paginationPrev )
	.directive( 'paginationNext', paginationNext )
	.directive( 'ptOrder', ptOrder )
	.directive( 'ptItem', ptItem )
	.factory( 'getPtItemManageDirectiveOptions', getPtItemManageDirectiveOptions )
	.directive( 'ptItemManageOutput', ptItemManageOutput )
	.directive( 'ptItemManageInput', ptItemManageInput );

var PT_PAGINATION_CLASS_NAME = 'pagination-pt-records';

function ptList( $filter, getPtItemIndex, uibPaginationConfig, PT_RECORDS_TEXTS, $compile ) {
	return {
		restrict: 'A',
		scope: true,
		controller: ListController,
		compile: compile
	};

	function ListController( $scope, $attrs ) {
		var limitToFilter = $filter( 'limitTo' ),
			orderByFilter = $filter( 'orderBy' );

		$scope.$list = [];
		$scope.totalItems = [];
		$scope.currentPage = 1;
		$scope.enabledPagination = $attrs.ptNoPagination === undefined;
		$scope.togglePagination = togglePagination;

		$scope.getRowNumber = getRowNumber;
		//scope.exportingTable = undefined;
		$scope.exportToXls = exportToXls;

		$scope.orderConfig = {
			//property: undefined,
			desc: false
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
			return getPtItemIndex( $scope, index ) + 1;
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
			return 'fa-sort' + ( orderConfig.property == property ? '-' + ( orderConfig.desc ? 'down' : 'up' ) : '' );
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
					.append( compileHtml( '<tr ng-if="!totalItems.length"><td colspan="' + totalCols + '">' + PT_RECORDS_TEXTS.noData + '</td></tr>' ) );

			scope.exportingTable = iElement.get( 0 );

			var parentEl = iElement.parent();
			if ( parentEl.hasClass( 'table-responsive' ) )
				iElement = parentEl;
			iElement.before( compileHtml( '<div class="clearfix" ng-show="totalItems.length">' +
				'<ul uib-pagination total-items="totalItems.length" ng-model="currentPage" class="' + PT_PAGINATION_CLASS_NAME + ' pull-left" ng-show="enabledPagination"></ul>' +
				'<div class="btn-group pull-right" role="group">' +
				'<button type="button" class="btn btn-default" ng-click="togglePagination()">' +
				'<span class="fa-stack fa-stack-pt-records" ng-if="enabledPagination"><span class="far fa-file fa-stack-1x"></span><span class="fas fa-slash fa-stack-1x"></span></span>' +
				'<span class="far fa-file" ng-if="!enabledPagination"></span>' +
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

function getPaginationDirectiveOptions( $compile ) {
	return function( isNext ) {
		return {
			restrict: 'C',
			link: link // No compile function because of UI Bootstrap register
		};

		function link( scope, iElement ) {
			if ( iElement.parent( '.pagination.' + PT_PAGINATION_CLASS_NAME ).length )
				iElement.children( 'a' ).html( $compile( '<span class="fas fa-chevron-' + ( isNext ? 'right' : 'left' ) + '"></span>' )( scope ) );
		}
	};
}

function paginationPrev( getPaginationDirectiveOptions ) {
	return getPaginationDirectiveOptions();
}

function paginationNext( getPaginationDirectiveOptions ) {
	return getPaginationDirectiveOptions( true );
}

function ptOrder( getAntiloopDirectiveCompileOption ) {
	return {
		restrict: 'A',
		terminal: true,
		priority: 1000,
		compile: getAntiloopDirectiveCompileOption( function( tElement, tAttrs ) {
			var ptOrder = tAttrs.ptOrder;
			tElement.append( '<button type="button" class="btn btn-default btn-xs pull-right btn-pt-records" ng-class="{active: isActive(\'' + ptOrder + '\')}" ng-click="sort(\'' + ptOrder + '\')">' +
				'<span class="fas" ng-class="getIconClass(\'' + ptOrder + '\')"></span>' +
				'</button>' );
		} )
	};
}

function ptItem( getAntiloopDirectiveCompileOption, confirmDeletion, getPtItemIndex ) {
	var manageAttrName = 'ptItemManage',
		manageScopeName = '$manage';

	return {
		restrict: 'A',
		terminal: true,
		priority: 1000,
		compile: getAntiloopDirectiveCompileOption( function( tElement, tAttrs ) {
			var itemScopeName = tAttrs.ptItem || '$item';

			tAttrs.$set( 'ngRepeat', itemScopeName + ' in $list' );
			tElement.prepend( '<td class="text-right">{{getRowNumber($index) | number}}</td>' );

			var pimScopeName = tAttrs[ manageAttrName ];
			if ( pimScopeName )
				tElement.append( '<td>' +
					'<div class="btn-group" role="group" ng-show="!' + itemScopeName + '.$editing">' +
					'<button type="button" class="btn btn-default" ng-click="' + manageScopeName + '.$startEdition($index)" ng-if="' + pimScopeName + '.edit"><span class="fas fa-edit"></span></button>' +
					'<button type="button" class="btn btn-default" ng-click="' + manageScopeName + '.$delete($index)" ng-if="' + pimScopeName + '.delete"><span class="fas fa-trash"></span></button>' +
					'</div>' +
					'<div class="btn-group" role="group" ng-if="' + pimScopeName + '.edit" ng-show="' + itemScopeName + '.$editing">' +
					'<button type="button" class="btn btn-default" ng-click="' + manageScopeName + '.$edit($index)"><span class="fas fa-check"></span></button>' +
					'<button type="button" class="btn btn-default" ng-click="' + manageScopeName + '.$cancelEdition($index)"><span class="fas fa-times"></span></button>' +
					'</div>' +
					'</td>' );
		}, function( scope, iElement, iAttrs ) {
			var itemManageOptions = scope.$eval( iAttrs[ manageAttrName ] );

			if ( !itemManageOptions )
				return;

			scope[ manageScopeName ] = {
				$startEdition: $startEdition,
				$delete: $delete,
				$edit: $edit,
				$cancelEdition: $cancelEdition
			};
			scope.$isEditing = $isEditing;

			function $startEdition( index ) {
				var item = getItem( index );
				item.$old = angular.copy( item );
				item.$editing = true;
			}

			function $delete( index ) {
				if ( confirmDeletion() )
					executeAfterPromise( itemManageOptions.delete( getItem( index ) ), function() {
						scope.$apply( function() {
							scope.totalItems.splice( getPtItemIndex( scope, index ), 1 );
						} );
					} );
			}

			function $edit( index ) {
				var newItem = angular.copy( getItem( index ) ),
					oldItem = newItem.$old;
				delete newItem.$old;
				delete newItem.$editing;
				executeAfterPromise( itemManageOptions.edit( newItem, oldItem ), function() {
					endEdition( index );
				} );
			}

			function $cancelEdition( index ) {
				var item = getItem( index );
				angular.forEach( item, function( value, key ) {
					if ( key == '$old' || key == '$editing' )
						return;
					var oldValue = item.$old[ key ];
					if ( oldValue === undefined )
						delete item[ key ];
					else
						item[ key ] = oldValue;
				} );
				endEdition( index );
			}

			function $isEditing( index ) {
				return getItem( index ).$editing;
			}

			function getItem( index ) {
				return scope.totalItems[ getPtItemIndex( scope, index ) ];
			}

			function executeAfterPromise( promise, execute ) {
				if ( promise )
					promise.then( function() {
						execute();
					} );
				else
					execute();
			}

			function endEdition( index ) {
				var item = getItem( index );
				delete item.$old;
				delete item.$editing;
			}
		} )
	};
}

function getPtItemManageDirectiveOptions( getAntiloopDirectiveCompileOption ) {
	return function( isInput ) {
		return {
			restrict: 'A',
			compile: getAntiloopDirectiveCompileOption( function( tElement, tAttrs ) {
				tAttrs.$set( 'ngShow', ( isInput ? '' : '!' ) + '$isEditing($index)' );
			} )
		};
	};
}

function ptItemManageOutput( getPtItemManageDirectiveOptions ) {
	return getPtItemManageDirectiveOptions();
}

function ptItemManageInput( getPtItemManageDirectiveOptions ) {
	return getPtItemManageDirectiveOptions( true );
}
} )();
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
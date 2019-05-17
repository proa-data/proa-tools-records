/*!
 * Proa Tools Records v1.5.4 (https://github.com/proa-data/proa-tools-records)
 */

( function() {
angular.module( 'proaTools.records', [ 'ui.bootstrap' ] );
} )();
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
	.directive( 'ptOrderInit', ptOrderInit )
	.directive( 'ptItem', ptItem )
	.factory( 'getPtItemManageDirectiveOptions', getPtItemManageDirectiveOptions )
	.directive( 'ptItemManageOutput', ptItemManageOutput )
	.directive( 'ptItemManageInput', ptItemManageInput );

var LIST_SCOPE_NAME = '$list',
	TOTAL_LIST_SCOPE_NAME = '$totalList',
	GET_ROW_NUMBER_SCOPE_NAME = '$getRowNumber',
	SORT_SCOPE_NAME = '$sort',
	IS_ACTIVE_SCOPE_NAME = '$isActive',
	GET_ICON_CLASS_SCOPE_NAME = '$getIconClass',
	INDEX_SCOPE_NAME = '$index',
	PT_PAGINATION_CLASS_NAME = 'pagination-pt-records',
	EDITING_ITEM_SCOPE_NAME = '$editing',
	OLD_ITEM_SCOPE_NAME = '$old';

function ptList( $filter, uibPaginationConfig, PT_RECORDS_TEXTS, $compile ) {
	var CURRENT_PAGE_SCOPE_NAME = '$currentPage',
		ENABLED_PAGINATION_SCOPE_NAME = '$enabledPagination',
		TOGGLE_PAGINATION_SCOPE_NAME = '$togglePagination',
		EXPORTING_TABLE_SCOPE_NAME = '$exportingTable',
		EXPORT_TO_XLS_SCOPE_NAME = '$exportToXls';

	return {
		restrict: 'A',
		scope: true,
		controller: PtListController,
		compile: compile
	};

	function PtListController( $scope, $attrs ) {
		var limitToFilter = $filter( 'limitTo' ),
			orderByFilter = $filter( 'orderBy' );

		$scope[ LIST_SCOPE_NAME ] = [];
		$scope[ TOTAL_LIST_SCOPE_NAME ] = [];
		$scope[ CURRENT_PAGE_SCOPE_NAME ] = 1;
		$scope[ ENABLED_PAGINATION_SCOPE_NAME ] = $attrs.ptNoPagination === undefined;
		$scope[ TOGGLE_PAGINATION_SCOPE_NAME ] = togglePagination;

		$scope[ GET_ROW_NUMBER_SCOPE_NAME ] = getRowNumber;
		//scope[ EXPORTING_TABLE_SCOPE_NAME ] = undefined;
		$scope[ EXPORT_TO_XLS_SCOPE_NAME ] = exportToXls;

		var orderConfig = {
			//property: undefined,
			desc: false
		};
		$scope[ SORT_SCOPE_NAME ] = sort;
		$scope[ IS_ACTIVE_SCOPE_NAME ] = isActive;
		$scope[ GET_ICON_CLASS_SCOPE_NAME ] = getIconClass;

		activate();

		function activate() {
			$scope.$watchCollection( $attrs.ptList, function( newCollection ) {
				angular.forEach( newCollection, function( item, i ) {
					item[ INDEX_SCOPE_NAME ] = i;
				} );
				$scope[ TOTAL_LIST_SCOPE_NAME ] = newCollection;
				changeItems();
			} );
			$scope.$watch( CURRENT_PAGE_SCOPE_NAME, changeItems );
			$scope.$watch( ENABLED_PAGINATION_SCOPE_NAME, changeItems );
			$scope.$watchCollection( function() {
				return orderConfig;
			}, changeItems );
		}

		function togglePagination() {
			$scope[ ENABLED_PAGINATION_SCOPE_NAME ] = !$scope[ ENABLED_PAGINATION_SCOPE_NAME ];
		}

		function getRowNumber( index ) {
			if ( $scope[ ENABLED_PAGINATION_SCOPE_NAME ] )
				index = ( $scope[ CURRENT_PAGE_SCOPE_NAME ] - 1 ) * uibPaginationConfig.itemsPerPage + index;
			return index + 1;
		}

		function exportToXls() {
			XLSX.writeFile( XLSX.utils.table_to_book( $scope[ EXPORTING_TABLE_SCOPE_NAME ], { raw: true } ), ( $attrs.ptFilename || 'Excel' ) + '.xlsx' );
		}

		function sort( property ) {
			if ( orderConfig.property == property ) {
				if ( orderConfig.desc )
					property = undefined;
				orderConfig.desc = !orderConfig.desc;
			} else
				orderConfig.desc = false;
			orderConfig.property = property;
		}

		function isActive( property ) {
			return orderConfig.property == property;
		}

		function getIconClass( property ) {
			return 'fa-sort' + ( orderConfig.property == property ? '-' + ( orderConfig.desc ? 'down' : 'up' ) : '' );
		}

		function changeItems() {
			var totalList = orderByFilter( $scope[ TOTAL_LIST_SCOPE_NAME ], orderConfig.property, orderConfig.desc );
			if ( $scope[ ENABLED_PAGINATION_SCOPE_NAME ] ) {
				var itemsPerPage = uibPaginationConfig.itemsPerPage;
				totalList = limitToFilter( totalList, itemsPerPage, ( $scope[ CURRENT_PAGE_SCOPE_NAME ] - 1 ) * itemsPerPage );
			}
			$scope[ LIST_SCOPE_NAME ] = totalList;
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
					.append( compileHtml( '<tr ng-if="!' + TOTAL_LIST_SCOPE_NAME + '.length"><td colspan="' + totalCols + '">' + PT_RECORDS_TEXTS.noData + '</td></tr>' ) );

			scope[ EXPORTING_TABLE_SCOPE_NAME ] = iElement.get( 0 );

			var parentEl = iElement.parent();
			if ( parentEl.hasClass( 'table-responsive' ) )
				iElement = parentEl;
			iElement.before( compileHtml( '<div class="clearfix" ng-show="' + TOTAL_LIST_SCOPE_NAME + '.length">' +
				'<ul uib-pagination total-items="' + TOTAL_LIST_SCOPE_NAME + '.length" ng-model="' + CURRENT_PAGE_SCOPE_NAME + '" class="' + PT_PAGINATION_CLASS_NAME + ' pull-left" ng-show="' + ENABLED_PAGINATION_SCOPE_NAME + '"></ul>' +
				'<div class="btn-group pull-right" role="toolbar">' +
				'<button type="button" class="btn btn-default" ng-click="' + TOGGLE_PAGINATION_SCOPE_NAME + '()">' +
				'<span class="fa-stack fa-stack-pt-records" ng-if="' + ENABLED_PAGINATION_SCOPE_NAME + '"><span class="far fa-file fa-stack-1x"></span><span class="fas fa-slash fa-stack-1x"></span></span>' +
				'<span class="far fa-file" ng-if="!' + ENABLED_PAGINATION_SCOPE_NAME + '"></span>' +
				'</button>' +
				'<button type="button" class="btn btn-default" ng-click="' + EXPORT_TO_XLS_SCOPE_NAME + '()"><span class="fas fa-file-excel"></span></button>' +
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
			tElement.append( '<button type="button" class="btn btn-default btn-xs pull-right btn-pt-records" ng-class="{active: ' + IS_ACTIVE_SCOPE_NAME + '(\'' + ptOrder + '\')}" ng-click="' + SORT_SCOPE_NAME + '(\'' + ptOrder + '\')">' +
				'<span class="fas" ng-class="' + GET_ICON_CLASS_SCOPE_NAME + '(\'' + ptOrder + '\')"></span>' +
				'</button>' );
		}, function( scope, iElement, iAttrs ) {
			if ( iAttrs.ptOrderInit )
				scope.$initialOrderedProperty = iAttrs.ptOrder;
		} )
	};
}

function ptOrderInit() {
	return {
		restrict: 'A',
		link: link
	};

	function link( scope, iElement, iAttrs ) {
		switch ( iAttrs[ this.name ] ) {
		case 'desc':
			sort();
		case 'asc':
			sort();
		}

		function sort() {
			scope[ SORT_SCOPE_NAME ]( scope.$initialOrderedProperty );
		}
	}
}

function ptItem( getAntiloopDirectiveCompileOption, confirmDeletion ) {
	var manageAttrName = 'ptItemManage',
		privyManageScopeName = '$manage';

	return {
		restrict: 'A',
		terminal: true,
		priority: 1000,
		compile: getAntiloopDirectiveCompileOption( function( tElement, tAttrs ) {
			var itemScopeName = tAttrs.ptItem || '$item';

			tAttrs.$set( 'ngRepeat', itemScopeName + ' in ' + LIST_SCOPE_NAME );
			tElement.prepend( '<td class="text-right">{{' + GET_ROW_NUMBER_SCOPE_NAME + '($index) | number}}</td>' );

			var customManageScopeName = tAttrs[ manageAttrName ];
			if ( customManageScopeName )
				tElement.append( '<td>' +
					'<div class="btn-group" role="toolbar" ng-hide="' + itemScopeName + '.' + EDITING_ITEM_SCOPE_NAME + '">' +
					'<button type="button" class="btn btn-default" ng-click="' + privyManageScopeName + '.$startEdition($index)" ng-if="' + customManageScopeName + '.edit"><span class="fas fa-edit"></span></button>' +
					'<button type="button" class="btn btn-default" ng-click="' + privyManageScopeName + '.$delete($index)" ng-if="' + customManageScopeName + '.delete"><span class="fas fa-trash"></span></button>' +
					'</div>' +
					'<div class="btn-group" role="toolbar" ng-if="' + customManageScopeName + '.edit" ng-show="' + itemScopeName + '.' + EDITING_ITEM_SCOPE_NAME + '">' +
					'<button type="button" class="btn btn-default" ng-click="' + privyManageScopeName + '.$edit($index)"><span class="fas fa-check"></span></button>' +
					'<button type="button" class="btn btn-default" ng-click="' + privyManageScopeName + '.$cancelEdition($index)"><span class="fas fa-times"></span></button>' +
					'</div>' +
					'</td>' );
		}, function( scope, iElement, iAttrs ) {
			var itemManageOptions = scope.$eval( iAttrs[ manageAttrName ] );

			if ( !itemManageOptions )
				return;

			scope[ privyManageScopeName ] = {
				$startEdition: $startEdition,
				$delete: $delete,
				$edit: $edit,
				$cancelEdition: $cancelEdition
			};
			scope.$isEditing = $isEditing;

			function $startEdition( index ) {
				var item = getItem( index );
				item[ OLD_ITEM_SCOPE_NAME ] = angular.copy( item );
				item[ EDITING_ITEM_SCOPE_NAME ] = true;
			}

			function $delete( index ) {
				if ( confirmDeletion() ) {
					var item = getItem( index );
					executeAfterPromise( itemManageOptions.delete( item ), function() {
						scope[ TOTAL_LIST_SCOPE_NAME ].splice( item[ INDEX_SCOPE_NAME ], 1 );
					} );
				}
			}

			function $edit( index ) {
				var newItem = getItem( index ),
					oldItem = newItem[ OLD_ITEM_SCOPE_NAME ];
				delete newItem[ OLD_ITEM_SCOPE_NAME ];
				delete newItem[ EDITING_ITEM_SCOPE_NAME ];
				executeAfterPromise( itemManageOptions.edit( newItem, oldItem ), function() {
					endEdition( index );
				} );
			}

			function $cancelEdition( index ) {
				var item = getItem( index );
				angular.forEach( item, function( value, key ) {
					if ( key == OLD_ITEM_SCOPE_NAME || key == EDITING_ITEM_SCOPE_NAME )
						return;
					var oldValue = item[ OLD_ITEM_SCOPE_NAME ][ key ];
					if ( oldValue === undefined )
						delete item[ key ];
					else
						item[ key ] = oldValue;
				} );
				endEdition( index );
			}

			function $isEditing( index ) {
				return getItem( index )[ EDITING_ITEM_SCOPE_NAME ];
			}

			function getItem( index ) {
				return scope[ LIST_SCOPE_NAME ][ index ];
			}

			function executeAfterPromise( promise, execute ) {
				if ( promise && promise.then )
					promise.then( function() {
						execute();
					} );
				else
					execute();
			}

			function endEdition( index ) {
				var item = getItem( index );
				delete item[ OLD_ITEM_SCOPE_NAME ];
				delete item[ EDITING_ITEM_SCOPE_NAME ];
			}
		} )
	};
}

function getPtItemManageDirectiveOptions( getAntiloopDirectiveCompileOption ) {
	return function( isInput ) {
		return {
			restrict: 'A',
			compile: getAntiloopDirectiveCompileOption( function( tElement, tAttrs ) {
				tAttrs.$set( isInput ? 'ngShow' : 'ngHide', '$isEditing($index)' );
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
	.factory( 'getAntiloopDirectiveCompileOption', getAntiloopDirectiveCompileOption )
	.factory( 'confirmDeletion', confirmDeletion );

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
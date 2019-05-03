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

var indexScopeName = '$index',
	PT_PAGINATION_CLASS_NAME = 'pagination-pt-records';

function ptList( $filter, uibPaginationConfig, PT_RECORDS_TEXTS, $compile ) {
	return {
		restrict: 'A',
		scope: true,
		controller: PtListController,
		compile: compile
	};

	function PtListController( $scope, $attrs ) {
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

		activate();

		function activate() {
			$scope.$watchCollection( $attrs.ptList, function( newArray ) {
				angular.forEach( newArray, function( item, i ) {
					item[ indexScopeName ] = i;
				} );
				$scope.totalItems = newArray;
				changeItems();
			} );
			$scope.$watch( 'currentPage', changeItems );
			$scope.$watch( 'enabledPagination', changeItems );
			$scope.$watchCollection( 'orderConfig', changeItems );
		}

		function togglePagination() {
			$scope.enabledPagination = !$scope.enabledPagination;
		}

		function getRowNumber( index ) {
			if ( $scope.enabledPagination )
				index = ( $scope.currentPage - 1 ) * uibPaginationConfig.itemsPerPage + index;
			return index + 1;
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
			scope.sort( scope.$initialOrderedProperty );
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

			tAttrs.$set( 'ngRepeat', itemScopeName + ' in $list' );
			tElement.prepend( '<td class="text-right">{{getRowNumber($index) | number}}</td>' );

			var customManageScopeName = tAttrs[ manageAttrName ];
			if ( customManageScopeName )
				tElement.append( '<td>' +
					'<div class="btn-group" role="group" ng-show="!' + itemScopeName + '.$editing">' +
					'<button type="button" class="btn btn-default" ng-click="' + privyManageScopeName + '.$startEdition($index)" ng-if="' + customManageScopeName + '.edit"><span class="fas fa-edit"></span></button>' +
					'<button type="button" class="btn btn-default" ng-click="' + privyManageScopeName + '.$delete($index)" ng-if="' + customManageScopeName + '.delete"><span class="fas fa-trash"></span></button>' +
					'</div>' +
					'<div class="btn-group" role="group" ng-if="' + customManageScopeName + '.edit" ng-show="' + itemScopeName + '.$editing">' +
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
				item.$old = angular.copy( item );
				item.$editing = true;
			}

			function $delete( index ) {
				if ( confirmDeletion() ) {
					var item = getItem( index );
					executeAfterPromise( itemManageOptions.delete( item ), function() {
						scope.$apply( function() {
							scope.totalItems.splice( item[ indexScopeName ], 1 );
						} );
					} );
				}
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
				return scope.$list[ index ];
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
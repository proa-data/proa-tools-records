( function() {
angular
	.module( 'proaTools.records' )
	.constant( 'PT_PAGINATION_CLASS_NAME', 'pagination-pt-records' )
	.factory( 'getItemIndex', getItemIndex )
	.directive( 'ptList', ptList )
	.factory( 'getPaginationBtnDirectiveOptions', getPaginationBtnDirectiveOptions )
	.directive( 'paginationPrev', paginationPrev )
	.directive( 'paginationNext', paginationNext )
	.factory( 'getDirectiveAutocompileFunction', getDirectiveAutocompileFunction )
	.constant( 'PT_CONFIG', {
		deletionConfirmation: function() {
			return confirm( 'Do you really want to delete?' );
		}
	} )
	.directive( 'ptItem', ptItem )
	.factory( 'getItemManageDirectiveOptions', getItemManageDirectiveOptions )
	.directive( 'ptItemManageOutput', ptItemManageOutput )
	.directive( 'ptItemManageInput', ptItemManageInput )
	.directive( 'ptOrder', ptOrder );

function getItemIndex( uibPaginationConfig ) {
	return function( scope, index ) {
		if ( scope.enabledPagination )
			return ( scope.currentPage - 1 ) * uibPaginationConfig.itemsPerPage + index;
		return index;
	};
}

function ptList( $filter, getItemIndex, uibPaginationConfig, PT_RECORDS_TEXTS, PT_PAGINATION_CLASS_NAME, $compile ) {
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
			return getItemIndex( $scope, index ) + 1;
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

function getPaginationBtnDirectiveOptions( PT_PAGINATION_CLASS_NAME, $compile ) {
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

function paginationPrev( getPaginationBtnDirectiveOptions ) {
	return getPaginationBtnDirectiveOptions();
}

function paginationNext( getPaginationBtnDirectiveOptions ) {
	return getPaginationBtnDirectiveOptions( true );
}

function getDirectiveAutocompileFunction( $compile ) {
	return function( transformation, scopeLinking ) {
		return function( tElement, tAttrs ) {
			transformation( tElement, tAttrs );
			return function( scope, iElement, tAttrs ) {
				if ( scopeLinking )
					scopeLinking( scope, iElement, tAttrs );

				iElement.removeAttr( getAttrName( tAttrs, this.name ) );
				$compile( iElement )( scope );
			};
		};
	};
}

function ptItem( getDirectiveAutocompileFunction, PT_CONFIG, getItemIndex ) {
	var manageScopeName = '$manage';

	return {
		restrict: 'A',
		require: '^^ptList',
		terminal: true,
		priority: 1000,
		compile: getDirectiveAutocompileFunction( function( tElement, tAttrs ) {
			var itemScopeName = tAttrs.ptItem || '$item';

			tAttrs.$set( 'ngRepeat', itemScopeName + ' in $list' );
			tElement.prepend( '<td class="text-right">{{getRowNumber($index) | number}}</td>' );

			var pimScopeName = tAttrs.ptItemManage;
			if ( pimScopeName )
				tElement.append( '<td>' +
					'<div class="btn-group" role="group" ng-if="!' + itemScopeName + '.$editing">' +
					'<button type="button" class="btn btn-default" ng-click="' + manageScopeName + '.$startEdition($index)" ng-if="' + pimScopeName + '.edit"><span class="fas fa-edit"></span></button>' +
					'<button type="button" class="btn btn-default" ng-click="' + manageScopeName + '.$delete($index)" ng-if="' + pimScopeName + '.delete"><span class="fas fa-trash"></span></button>' +
					'</div>' +
					'<div class="btn-group" role="group" ng-if="' + itemScopeName + '.$editing">' +
					'<button type="button" class="btn btn-default" ng-click="' + manageScopeName + '.$edit($index)"><span class="fas fa-check"></span></button>' +
					'<button type="button" class="btn btn-default" ng-click="' + manageScopeName + '.$cancelEdition($index)"><span class="fas fa-times"></span></button>' +
					'</div>' +
					'</td>' );
		}, function( scope, iElement, iAttrs ) {
			var itemManageOptions = scope.$eval( iAttrs.ptItemManage );

			if ( !itemManageOptions )
				return;

			scope[ manageScopeName ] = {
				$startEdition: $startEdition,
				$delete: $delete,
				$edit: $edit,
				$cancelEdition: $cancelEdition
			};

			function $startEdition( index ) {
				var item = getItem( index );
				item.$old = angular.copy( item );
				item.$editing = true;
			}

			function $delete( index ) {
				if ( PT_CONFIG.deletionConfirmation() )
					executeAfterPromise( itemManageOptions.delete( getItem( index ) ), function() {
						scope.$apply( function() {
							scope.totalItems.splice( getItemIndex( scope, index ), 1 );
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

			function getItem( index ) {
				return scope.totalItems[ getItemIndex( scope, index ) ];
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

function getItemManageDirectiveOptions( getDirectiveAutocompileFunction ) {
	return function( isInput ) {
		return {
			restrict: 'A',
			require: '^^ptList',
			compile: getDirectiveAutocompileFunction( function( tElement, tAttrs ) {
				tAttrs.$set( 'ngIf', ( isInput ? '' : '!' ) + tElement.parents( '[pt-item-manage]' ).attr( 'ng-repeat' ).split( ' in ' )[ 0 ] + '.$editing' );
			} )
		};
	};
}

function ptItemManageOutput( getItemManageDirectiveOptions ) {
	return getItemManageDirectiveOptions();
}

function ptItemManageInput( getItemManageDirectiveOptions ) {
	return getItemManageDirectiveOptions( true );
}

function ptOrder( getDirectiveAutocompileFunction ) {
	return {
		restrict: 'A',
		require: '^^ptList',
		terminal: true,
		priority: 1000,
		compile: getDirectiveAutocompileFunction( function( tElement, tAttrs ) {
			var ptOrder = tAttrs.ptOrder;
			tElement.append( '<button type="button" class="btn btn-default btn-xs pull-right btn-pt-records" ng-class="{active: isActive(\'' + ptOrder + '\')}" ng-click="sort(\'' + ptOrder + '\')">' +
				'<span class="fas" ng-class="getIconClass(\'' + ptOrder + '\')"></span>' +
				'</button>' );
		} )
	};
}

function getAttrName( attrs, name ) {
	return attrs.$attr[ name ];
}
} )();
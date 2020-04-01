/*!
 * Proa Tools Records v1.7.0 (https://github.com/proa-data/proa-tools-records)
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
	.directive( 'ptItemManageInput', ptItemManageInput )
	.directive( 'tableSticky', tableSticky );

var SN = { // Scope names
		LIST: '$list',
		TOTAL_LIST: '$totalList',
		GET_ROW_NUMBER: '$getRowNumber',
		SORT: '$sort',
		IS_ACTIVE: '$isActive',
		GET_ICON_CLASS: '$getIconClass',
		INITIAL_ORDERED_PROPERTY: '$$initialOrderedProperty',
		IS_EDITING: '$isEditing'
	},
	INDEX_ITEM = '$$index',
	PT_PAGINATION_CLASS_NAME = 'pagination-pt-records';

function ptList( $filter, uibPaginationConfig, PT_RECORDS_TEXTS, $compile ) {
	var OSN = { // Own scope names
		CURRENT_PAGE: '$currentPage',
		ENABLED_PAGINATION: '$enabledPagination',
		TOGGLE_PAGINATION: '$togglePagination',
		EXPORTING_TABLE: '$$exportingTable',
		EXPORT_TO_XLS: '$exportToXls'
	};

	return {
		restrict: 'A',
		scope: true,
		controller: PtListController,
		compile: compile
	};

	function PtListController( $scope, $attrs ) {
		var limitToFilter = $filter( 'limitTo' ),
			orderByFilter = $filter( 'orderBy' );

		$scope[ SN.LIST ] = [];
		$scope[ SN.TOTAL_LIST ] = [];
		$scope[ OSN.CURRENT_PAGE ] = 1;
		$scope[ OSN.ENABLED_PAGINATION ] = $attrs.ptNoPagination === undefined;
		$scope[ OSN.TOGGLE_PAGINATION ] = togglePagination;

		$scope[ SN.GET_ROW_NUMBER ] = getRowNumber;
		//scope[ OSN.EXPORTING_TABLE ] = undefined;
		$scope[ OSN.EXPORT_TO_XLS ] = exportToXls;

		var orderConfig = {
			//property: undefined,
			desc: false
		};
		$scope[ SN.SORT ] = sort;
		$scope[ SN.IS_ACTIVE ] = isActive;
		$scope[ SN.GET_ICON_CLASS ] = getIconClass;

		activate();

		function activate() {
			$scope.$watchCollection( $attrs.ptList, function( newCollection ) {
				angular.forEach( newCollection, function( item, i ) {
					item[ INDEX_ITEM ] = i;
				} );
				$scope[ SN.TOTAL_LIST ] = newCollection;
				changeItems();
			} );
			$scope.$watch( OSN.CURRENT_PAGE, changeItems );
			$scope.$watch( OSN.ENABLED_PAGINATION, changeItems );
			$scope.$watchCollection( function() {
				return orderConfig;
			}, changeItems );
		}

		function togglePagination() {
			$scope[ OSN.ENABLED_PAGINATION ] = !$scope[ OSN.ENABLED_PAGINATION ];
		}

		function getRowNumber( index ) {
			if ( $scope[ OSN.ENABLED_PAGINATION ] )
				index = ( $scope[ OSN.CURRENT_PAGE ] - 1 ) * uibPaginationConfig.itemsPerPage + index;
			return index + 1;
		}

		function exportToXls() {
			XLSX.writeFile( XLSX.utils.table_to_book( $scope[ OSN.EXPORTING_TABLE ], { raw: true } ), ( $attrs.ptFilename || 'Excel' ) + '.xlsx' );
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
			var totalList = orderByFilter( $scope[ SN.TOTAL_LIST ], orderConfig.property, orderConfig.desc );
			if ( $scope[ OSN.ENABLED_PAGINATION ] ) {
				var itemsPerPage = uibPaginationConfig.itemsPerPage;
				totalList = limitToFilter( totalList, itemsPerPage, ( $scope[ OSN.CURRENT_PAGE ] - 1 ) * itemsPerPage );
			}
			$scope[ SN.LIST ] = totalList;
		}
	}

	function compile() {
		return postLink;

		function postLink( scope, iElement ) {
			var totalCols = 0;
			iElement
				.find( 'thead > tr:first' )
					.prepend( compileHtml( '<th rowspan="' + iElement.find( 'thead > tr' ).length + '">' + PT_RECORDS_TEXTS.number + '</th>' ) )
					.find( 'th' )
						.each( function() {
							totalCols += angular.element( this ).prop( 'colspan' );
						} )
					.end()
				.end()
				.find( 'tbody' )
					.append( compileHtml( '<tr ng-if="!' + SN.TOTAL_LIST + '.length"><td colspan="' + totalCols + '">' + PT_RECORDS_TEXTS.noData + '</td></tr>' ) );

			scope[ OSN.EXPORTING_TABLE ] = iElement.get( 0 );

			var parentEl = iElement.parent();
			if ( parentEl.hasClass( 'table-responsive' ) )
				iElement = parentEl;
			iElement.before( compileHtml( '<div class="clearfix" ng-show="' + SN.TOTAL_LIST + '.length">' +
				'<ul uib-pagination total-items="' + SN.TOTAL_LIST + '.length" ng-model="' + OSN.CURRENT_PAGE + '" class="' + PT_PAGINATION_CLASS_NAME + ' pull-left" ng-show="' + OSN.ENABLED_PAGINATION + '"></ul>' +
				'<div class="btn-group pull-right" role="toolbar">' +
				'<button type="button" class="btn btn-default" ng-click="' + OSN.TOGGLE_PAGINATION + '()">' +
				'<span class="fa-stack fa-stack-pt-records" ng-if="' + OSN.ENABLED_PAGINATION + '"><span class="far fa-file fa-stack-1x"></span><span class="fas fa-slash fa-stack-1x"></span></span>' +
				'<span class="far fa-file" ng-if="!' + OSN.ENABLED_PAGINATION + '"></span>' +
				'</button>' +
				'<button type="button" class="btn btn-default" ng-click="' + OSN.EXPORT_TO_XLS + '()"><span class="fas fa-file-excel"></span></button>' +
				'</div>' +
				'</div>' ) );

			function compileHtml( html ) {
				return $compile( html )( scope );
			}
		}
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

function ptOrder( getCompiledDirectiveOptions ) {
	return getCompiledDirectiveOptions( compile, postLink );

	function compile( tElement, tAttrs ) {
		var ptOrder = tAttrs.ptOrder;
		tElement.append( '<button type="button" class="btn btn-default btn-xs pull-right btn-pt-records" ng-class="{active: ' + SN.IS_ACTIVE + '(\'' + ptOrder + '\')}" ng-click="' + SN.SORT + '(\'' + ptOrder + '\')">' +
			'<span class="fas" ng-class="' + SN.GET_ICON_CLASS + '(\'' + ptOrder + '\')"></span>' +
			'</button>' );
	}

	function postLink( scope, iElement, iAttrs ) {
		if ( iAttrs.ptOrderInit )
			scope[ SN.INITIAL_ORDERED_PROPERTY ] = iAttrs.ptOrder;
	}
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
			scope[ SN.SORT ]( scope[ SN.INITIAL_ORDERED_PROPERTY ] );
		}
	}
}

function ptItem( getCompiledDirectiveOptions, confirmDeletion ) {
	var MANAGE_ATTR_NAME = 'ptItemManage',
		IPN = { // Item property name
			OLD: '$$old',
			IS_EDITING: '$$isEditing'
		},
		OSN = {
			START_EDITION: '$startEdition',
			DELETE: '$delete',
			EDIT: '$edit',
			CANCEL_EDITION: '$cancelEdition'
		};

	return getCompiledDirectiveOptions( compile, postLink ); // Always necessary options: priority (1,000) and terminal (to true)

	function compile( tElement, tAttrs ) {
		tAttrs.$set( 'ngRepeat', ( tAttrs.ptItem || '$item' ) + ' in ' + SN.LIST );
		tElement.prepend( '<td class="text-right">{{' + SN.GET_ROW_NUMBER + '($index) | number}}</td>' );

		var customManageSn = tAttrs[ MANAGE_ATTR_NAME ];
		if ( customManageSn )
			tElement.append( '<td>' +
				'<div class="btn-group" role="toolbar" ng-hide="' + SN.IS_EDITING + '($index)">' +
				'<button type="button" class="btn btn-default" ng-click="' + OSN.START_EDITION + '($index)" ng-if="' + customManageSn + '.edit"><span class="fas fa-edit"></span></button>' +
				'<button type="button" class="btn btn-default" ng-click="' + OSN.DELETE + '($index)" ng-if="' + customManageSn + '.delete"><span class="fas fa-trash"></span></button>' +
				'</div>' +
				'<div class="btn-group" role="toolbar" ng-if="' + customManageSn + '.edit" ng-show="' + SN.IS_EDITING + '($index)">' +
				'<button type="button" class="btn btn-default" ng-click="' + OSN.EDIT + '($index)"><span class="fas fa-check"></span></button>' +
				'<button type="button" class="btn btn-default" ng-click="' + OSN.CANCEL_EDITION + '($index)"><span class="fas fa-times"></span></button>' +
				'</div>' +
				'</td>' );
	}

	function postLink( scope, iElement, iAttrs ) {
		var itemManageOptions = scope.$eval( iAttrs[ MANAGE_ATTR_NAME ] );

		if ( !itemManageOptions )
			return;

		scope[ OSN.START_EDITION ] = startEdition;
		scope[ OSN.DELETE ] = deleteItem;
		scope[ OSN.EDIT ] = edit;
		scope[ OSN.CANCEL_EDITION ] = cancelEdition;
		scope[ SN.IS_EDITING ] = isEditing;

		function startEdition( index ) {
			var item = getItem( index );
			item[ IPN.OLD ] = angular.copy( item );
			item[ IPN.IS_EDITING ] = true;
		}

		function deleteItem( index ) {
			if ( confirmDeletion() ) {
				var item = getItem( index );
				executeAfterPromise( itemManageOptions.delete( item ), function() {
					scope[ SN.TOTAL_LIST ].splice( item[ INDEX_ITEM ], 1 );
				} );
			}
		}

		function edit( index ) {
			var item = getItem( index );
			executeAfterPromise( itemManageOptions.edit( item, item[ IPN.OLD ] ), function() {
				endEdition( index );
			} );
		}

		function cancelEdition( index ) {
			var item = getItem( index );
			angular.forEach( item, function( value, key ) {
				if ( key == IPN.OLD || key == IPN.IS_EDITING )
					return;
				var oldValue = item[ IPN.OLD ][ key ];
				if ( oldValue === undefined )
					delete item[ key ];
				else
					item[ key ] = oldValue;
			} );
			endEdition( index );
		}

		function isEditing( index ) {
			return getItem( index )[ IPN.IS_EDITING ];
		}

		function getItem( index ) {
			return scope[ SN.LIST ][ index ];
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
			delete item[ IPN.OLD ];
			delete item[ IPN.IS_EDITING ];
		}
	}
}

function getPtItemManageDirectiveOptions( getCompiledDirectiveOptions ) {
	return function( isInput ) {
		return getCompiledDirectiveOptions( compile );

		function compile( tElement, tAttrs ) {
			tAttrs.$set( isInput ? 'ngShow' : 'ngHide', SN.IS_EDITING + '($index)' );
		}
	};
}

function ptItemManageOutput( getPtItemManageDirectiveOptions ) {
	return getPtItemManageDirectiveOptions();
}

function ptItemManageInput( getPtItemManageDirectiveOptions ) {
	return getPtItemManageDirectiveOptions( true );
}

function tableSticky() {
	return {
		restrict: 'C',
		link: link
	};

	function link( scope, iElement ) {
		var parentElem = iElement.find( '.table' );

		setPosition( 'thead', 'last-child', 'top', getTopPosition );
		setPosition( 'tfoot', 'first-child', 'bottom', function( elem ) {
			return getTopPosition( elem ) + elem.outerHeight();
		} );

		function setPosition( tagName, pseudoClass, prop, getterFn ) {
			var childElem = parentElem.find( tagName + ' > tr:' + pseudoClass ),
				childValue = getterFn( childElem ),
				parentValue = getterFn( parentElem );
			childElem.children( 'th, td' ).css( prop, Math.abs( childValue - parentValue ) );
		}

		function getTopPosition( elem ) {
			return elem.position().top;
		}
	}
}
} )();
( function() {
angular
	.module( 'proaTools.records' )
	.factory( 'getCompiledDirectiveOptions', getCompiledDirectiveOptions )
	.factory( 'confirmDeletion', confirmDeletion );

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

function confirmDeletion( $window, PT_RECORDS_TEXTS ) {
	return function() {
		return $window.confirm( PT_RECORDS_TEXTS.deletionConfirmation );
	};
}
} )();
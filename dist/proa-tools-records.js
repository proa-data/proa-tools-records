/*!
 * Proa Tools Records v1.8.8 (https://github.com/proa-data/proa-tools-records)
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
var PT_LIST = 'ptList';

angular
	.module( 'proaTools.records' )
	.directive( 'ptList', ptList )
	.directive( 'ptListLabels', ptListLabels )
	.directive( 'ptListValues', ptListValues )
	.factory( 'getPaginationDirectiveOptions', getPaginationDirectiveOptions )
	.directive( 'paginationPrev', paginationPrev )
	.directive( 'paginationNext', paginationNext )
	.directive( 'ptOrder', ptOrder )
	.directive( 'ptItem', ptItem )
	.directive( 'ptItemManage', ptItemManage )
	.directive( 'tableSticky', tableSticky );

var SN = { // Scope names
		LIST: '$list',
		TOTAL_LIST: '$totalList',
		GET_ROW_NUMBER: '$getRowNumber',
		SORT: '$sort',
		IS_ACTIVE: '$isActive',
		GET_ICON_CLASS: '$getIconClass',
		INITIAL_ORDERED_PROPERTY: '$$initialOrderedProperty',
		IS_EDITING: '$isEditing',
		ITEM_SN: '$$itemSn'
	},
	INDEX_ITEM = '$$index',
	PT_PAGINATION_CLASS_NAME = 'pagination-pt-records';

function ptList( $filter, uibPaginationConfig ) {
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
			$scope.$watchCollection( $attrs[ PT_LIST ], function( newCollection ) {
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

	function compile( element ) {
		var ATTR = 'pt-item';
		element
			.prepend( '<caption class="pt-records-toolbar clearfix" ng-show="' + SN.TOTAL_LIST + '.length">' +
				'<ul uib-pagination total-items="' + SN.TOTAL_LIST + '.length" ng-model="' + OSN.CURRENT_PAGE + '" class="' + PT_PAGINATION_CLASS_NAME + ' pull-left" ng-show="' + OSN.ENABLED_PAGINATION + '"></ul>' +
				'<div class="btn-group pull-right" role="toolbar">' +
				'<button type="button" class="btn btn-default" ng-click="' + OSN.TOGGLE_PAGINATION + '()">' +
				'<span class="fa-stack fa-stack-pt-records" ng-if="' + OSN.ENABLED_PAGINATION + '"><span class="far fa-file fa-stack-1x"></span><span class="fas fa-slash fa-stack-1x"></span></span>' +
				'<span class="far fa-file" ng-if="!' + OSN.ENABLED_PAGINATION + '"></span>' +
				'</button>' +
				'<button type="button" class="btn btn-default" ng-click="' + OSN.EXPORT_TO_XLS + '()"><span class="fas fa-file-excel"></span></button>' +
				'</div>' +
				'</caption>' )
			.find( 'tbody' )
				.attr( 'pt-list-values', '' )
				.find( '[' + ATTR + ']' )
					.each( function() {
						var elem = $( this );
						elem.attr( 'ng-repeat', getItemSn( elem.attr( ATTR ) ) + ' in ' + SN.LIST );
					} )
				.end()
			.end()
			.find( 'thead,tfoot' )
				.find( 'tr:first' )
					.attr( 'pt-list-labels', '' );

		return postLink;

		function postLink( scope, element ) {
			scope[ OSN.EXPORTING_TABLE ] = element.get( 0 );
		}
	}
}

function ptListLabels( PT_RECORDS_TEXTS ) {
	return {
		restrict: 'A',
		compile: compile
	};

	function compile( element ) {
		var elem = element.parent();
		element.prepend( $( elem.is( 'thead' ) ? '<th>' + PT_RECORDS_TEXTS.number + '</th>' : '<th class="invisible"></th>' ).prop( 'rowspan', elem.find( 'tr' ).length ) );
	}
}

function ptListValues( PT_RECORDS_TEXTS ) {
	return {
		restrict: 'A',
		compile: compile
	};

	function compile( element ) {
		element.append( '<tr ng-if="!' + SN.TOTAL_LIST + '.length"><td colspan="9999">' + // Huge number of columns
			PT_RECORDS_TEXTS.noData + '</td></tr>' );
	}
}

function getPaginationDirectiveOptions( $compile ) {
	return function( isNext ) {
		return {
			restrict: 'C',
			link: link // No compile function because of UI Bootstrap register
		};

		function link( scope, element ) {
			if ( element.parent( '.pagination.' + PT_PAGINATION_CLASS_NAME ).length )
				element.children( 'a' ).html( $compile( '<span class="fas fa-chevron-' + ( isNext ? 'right' : 'left' ) + '"></span>' )( scope ) );
		}
	};
}

function paginationPrev( getPaginationDirectiveOptions ) {
	return getPaginationDirectiveOptions();
}

function paginationNext( getPaginationDirectiveOptions ) {
	return getPaginationDirectiveOptions( true );
}

function ptOrder() {
	return {
		restrict: 'A',
		require: '^^' + PT_LIST,
		compile: compile
	};

	function compile( element, attrs ) {
		var propStr = '\'' + getPropName( attrs ) + '\'';
		element.append( '<button type="button" class="btn btn-default btn-xs pull-right btn-pt-records" ng-class="{active: ' + SN.IS_ACTIVE + '(' + propStr + ')}" ng-click="' + SN.SORT + '(' + propStr + ')">' +
			'<span class="fas" ng-class="' + SN.GET_ICON_CLASS + '(' + propStr + ')"></span>' +
			'</button>' );

		return postLink;

		function postLink( scope, element, attrs ) {
			var orderInit = attrs.ptOrderInit;
			if ( orderInit ) {
				scope[ SN.INITIAL_ORDERED_PROPERTY ] = getPropName( attrs );

				switch ( orderInit ) {
				case 'desc':
					sort();
				case 'asc':
					sort();
				}
			}

			function sort() {
				scope[ SN.SORT ]( scope[ SN.INITIAL_ORDERED_PROPERTY ] );
			}
		}

		function getPropName( attrs ) {
			return attrs.ptOrder;
		}
	}
}

function ptItem( $window, PT_RECORDS_TEXTS ) {
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

	return {
		restrict: 'A',
		require: '^^' + PT_LIST,
		compile: compile,
		priority: 1001 // Executed before added "ngRepeat"
	};

	function compile( element, attrs ) {
		element.prepend( '<td class="text-right">{{' + SN.GET_ROW_NUMBER + '($index) | number}}</td>' );

		var customManageSn = attrs[ MANAGE_ATTR_NAME ];
		if ( customManageSn ) {
			var ITEM_SN = getItemSn( attrs[ this.name ] );
			element.append( '<td>' +
				'<div class="btn-group" role="toolbar" ng-hide="' + SN.IS_EDITING + '(' + ITEM_SN + ')">' +
				'<button type="button" class="btn btn-default" ng-click="' + OSN.START_EDITION + '(' + ITEM_SN + ')" ng-if="' + customManageSn + '.edit"><span class="fas fa-edit fa-fw"></span></button>' +
				'<button type="button" class="btn btn-default" ng-click="' + OSN.DELETE + '(' + ITEM_SN + ')" ng-if="' + customManageSn + '.delete"><span class="fas fa-trash fa-fw"></span></button>' +
				'</div>' +
				'<div class="btn-group" role="toolbar" ng-if="' + customManageSn + '.edit" ng-show="' + SN.IS_EDITING + '(' + ITEM_SN + ')">' +
				'<button type="button" class="btn btn-default" ng-click="' + OSN.EDIT + '(' + ITEM_SN + ')"><span class="fas fa-check fa-fw"></span></button>' +
				'<button type="button" class="btn btn-default" ng-click="' + OSN.CANCEL_EDITION + '(' + ITEM_SN + ')"><span class="fas fa-times fa-fw"></span></button>' +
				'</div>' +
				'</td>' );
		}

		return postLink;

		function postLink( scope, element, attrs ) {
			scope[ SN.ITEM_SN ] = getItemSn( attrs[ this.name ] );

			var itemManageOptions = scope.$eval( attrs[ MANAGE_ATTR_NAME ] );

			if ( !itemManageOptions )
				return;

			scope[ OSN.START_EDITION ] = startEdition;
			scope[ OSN.DELETE ] = deleteItem;
			scope[ OSN.EDIT ] = edit;
			scope[ OSN.CANCEL_EDITION ] = cancelEdition;
			scope[ SN.IS_EDITING ] = isEditing;

			function startEdition( item ) {
				item[ IPN.OLD ] = angular.copy( item );
				item[ IPN.IS_EDITING ] = true;
			}

			function deleteItem( item ) {
				if ( $window.confirm( PT_RECORDS_TEXTS.deletionConfirmation ) )
					executeAfterPromise( itemManageOptions.delete( item ), function() {
						scope[ SN.TOTAL_LIST ].splice( item[ INDEX_ITEM ], 1 );
					} );
			}

			function edit( item ) {
				executeAfterPromise( itemManageOptions.edit( item, item[ IPN.OLD ] ), function() {
					endEdition( item );
				} );
			}

			function cancelEdition( item ) {
				angular.forEach( item, function( value, key ) {
					switch ( key ) {
					case INDEX_ITEM:
					case IPN.OLD:
					case IPN.IS_EDITING:
						break;
					default:
						var oldValue = item[ IPN.OLD ][ key ];
						if ( oldValue === undefined )
							delete item[ key ];
						else
							item[ key ] = oldValue;
					}
				} );
				endEdition( item );
			}

			function isEditing( item ) {
				return item[ IPN.IS_EDITING ];
			}

			function executeAfterPromise( promise, execute ) {
				if ( promise && promise.then )
					promise.then( function() {
						execute();
					} );
				else
					execute();
			}

			function endEdition( item ) {
				delete item[ IPN.OLD ];
				delete item[ IPN.IS_EDITING ];
			}
		}
	}
}

function ptItemManage() {
	return {
		restrict: 'A',
		compile: compile
	};

	function compile( element ) {
		var ATTR_PREXIX = 'pt-item-manage-',
			ATTR = ATTR_PREXIX + 'output';
		element.find( '[' + ATTR + '],[' + ATTR_PREXIX + 'input]' ).each( function() {
			var elem = $( this );
			elem.attr( angular.isDefined( elem.attr( ATTR ) ) ? 'ng-hide' : 'ng-show', SN.IS_EDITING + '({{' + SN.ITEM_SN + '}})' );
		} );
	}
}

function tableSticky() {
	return {
		restrict: 'C',
		link: link
	};

	function link( scope, element ) {
		var parentElem = element.children( '.table' ),
			captionHeight = parentElem.find( 'caption' ).outerHeight() || 0;

		setPosition( 'caption + thead, colgroup + thead, thead:first-child', ':first-child', 'top', getTopPosition );
		setPosition( 'tfoot', ':last-child', 'bottom', function( elem, isParent ) {
			return getTopPosition( elem, isParent ) + elem.outerHeight();
		} );

		function setPosition( filterSelector, notSelector, prop, getterFn ) {
			var parentValue = getterFn( parentElem, true );
			parentElem
				.children()
					.filter( filterSelector )
						.children( 'tr:not(' + notSelector + ')' )
							.each( function() {
								var elem = $( this );
								elem.children( 'th, td' ).css( prop, Math.abs( getterFn( elem ) - parentValue ) );
							} );
		}

		function getTopPosition( elem, isParent ) {
			return elem.position().top + ( isParent ? captionHeight : 0 );
		}
	}
}

function getItemSn( str ) {
	return str || '$item';
}
} )();
angular.module('WebApp')

.service(
    "modals",
    function( $rootScope, $q ) {
        var modal = {
            deferred: null,
            params: null
        };
        return({
            open: open,
            params: params,
            proceedTo: proceedTo,
            reject: reject,
            resolve: resolve
        });
        function open( type, params, pipeResponse ) {
            var previousDeferred = modal.deferred;
            modal.deferred = $q.defer();
            modal.params = params;
            if ( previousDeferred && pipeResponse ) {
                modal.deferred.promise
                    .then( previousDeferred.resolve, previousDeferred.reject )
                ;
            } else if ( previousDeferred ) {
                previousDeferred.reject();
            }
            $rootScope.$emit( "modals.open", type );
            return( modal.deferred.promise );
        }
        function params() {
            return( modal.params || {} );
        }
        function proceedTo( type, params ) {
            return( open( type, params, true ) );
        }
        function reject( reason ) {
            if ( ! modal.deferred ) {
                return;
            }
            modal.deferred.reject( reason );
            modal.deferred = modal.params = null;
            $rootScope.$emit( "modals.close" );
        }
        function resolve( response ) {
            if ( ! modal.deferred ) {
                return;
            }
            modal.deferred.resolve( response );
            modal.deferred = modal.params = null;
            $rootScope.$emit( "modals.close" );
        }
    }
);

app.directive(
    "bnModals",
    function( $rootScope, modals ) {
        return( link );
        function link( scope, element, attributes ) {
            scope.subview = null;
            element.on(
                "click",
                function handleClickEvent( event ) {
                    if ( element[ 0 ] !== event.target ) {
                        return;
                    }
                    scope.$apply( modals.reject );
                }
            );
            $rootScope.$on(
                "modals.open",
                function handleModalOpenEvent( event, modalType ) {
                    scope.subview = modalType;
                }
            );
            $rootScope.$on(
                "modals.close",
                function handleModalCloseEvent( event ) {
                    scope.subview = null;
                }
            );
        }
    }
);
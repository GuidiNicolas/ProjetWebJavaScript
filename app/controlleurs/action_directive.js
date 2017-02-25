angular.module('action').directive('action',
    [function() {
        return {
            restrict: 'A',
            templateUrl: 'actionRecherche.html',
            link: function(scope, element, attrs) {
                scope.buy = function() { scope.action.afficher(); }
            }
        }
    }]);

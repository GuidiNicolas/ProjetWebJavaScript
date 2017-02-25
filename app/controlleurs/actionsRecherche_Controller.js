angular.module('action').controller('actionsRechercheController',
    ['$scope', '$http', 'Action', function($scope, $http, Action) {

        $http.get('actions.html')
            .then(function(response) {
                $scope.actions = [];
                response.data.actions.forEach(function(data) {
                    var newAction = new Action(data);
                    $scope.actions.push(newAction);
                });
            }, function(error) {
                console.log(error);
            });

    }]);
angular.module('action').controller('actionsRechercheController',
    ['$scope', '$http', 'Product', function($scope, $http, Product) {

        $http.get('http://localhost:9292/products')
            .then(function(response) {
                $scope.products = [];
                response.data.products.forEach(function(data) {
                    var newProduct = new Product(data);
                    $scope.products.push(newProduct);
                });
            }, function(error) {
                console.log(error);
            });

    }]);
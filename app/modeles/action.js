angular.module('action').factory('Action',
    [function() {
        var Action = function(data) {
            this.symbole = data.symbole;
            this.price = data.price;
            this.name = data.name;
        }

        Product.prototype.afficher = function() {
            console.log('testounet');
        }

        return Product;
    }]);
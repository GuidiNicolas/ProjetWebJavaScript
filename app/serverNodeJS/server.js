var express = require('express');
var app = express();

var path = require('path');

app.use(express.static('../vue'));
app.use(express.static('../lib'));

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/server');
var Schema = mongoose.Schema;

var jsdom = require("jsdom").jsdom;
jsdom.env("", function(err, window) {
    if (err) {
        console.error(err);
        return;
    }
    global.$ = require("jquery")(window);
})

var StockSchema = new Schema({
	name: String,
	symbole: String,
	price: Number	
});
var Stock = mongoose.model('Stock', StockSchema);
var Vente = mongoose.model('Vente', StockSchema);


var plusValueSchema = new Schema({
	plusValue: Number,
	timeStamp : Number
});
var PlusValue = mongoose.model('PlusValue', plusValueSchema);


function objToString (obj) {
    var str = '';
    for (var p in obj) {
        if (obj.hasOwnProperty(p)) {
            str += p + '::' + obj[p] + '\n';
        }
    }
    return str;
}

//Permet de renvoyer les infos intéressantes du json récupéré avec l'url
function httpGet(theUrl, res)
{
	var reponse;
	var retour;

	$.getJSON(theUrl, function( json ) {
		retour = objToString(json.query.results.quote);
		reponse = retour.split("\n");

		console.log("Recherche du symbole : "+ reponse[0].split(":")[2].toUpperCase());

		res.send(reponse);
	});
}

//On tape sur l'api yahoo et on renvoie la réponse
app.get('/api/:symbol', function(req,res) {

	var symbol = req.params.symbol;
	
	var url = 'https://query.yahooapis.com/v1/public/yql?q=';

	var data = 'select%20symbol,%20Name,%20Volume,%20Bid,%20Change,%20YearLow,%20YearHigh%20,%20Open%20from' +

	   '%20yahoo.finance.quotes%20where%20symbol%20in%20(%22'+symbol+'%22)';

	var url2 = url + data + "&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";
	
	var http = require('http');

	callback = function(response) {
	  var str = ''
	  response.on('data', function (chunk) {
		str += chunk;
	  });

	  response.on('end', function () {
		console.log(str);
	  });
	}

	httpGet(url2, res);
});


app.route('/stocks')
	.get(function(req, res, next) {
		Stock.find({}, function(err, stocks) {
			if (err) {
				return next(err);
			} else {
				res.json(stocks);
			}
		});
	})

	.post(function(req, res, next) {
		var stock = new Stock(req.body);
		stock.save(function(err) {
			if (err) {
				return next(err);
			}
			else {
				res.json(stock);
			}
		});
	})

app.route('/stocks/:stock_id')
	.get(function(req,res) {
		Stock.findById(req.params.stock_id, function(err, stock) {
			if (err)
				res.send(err);
			res.json(stock);
		});
	})

	.delete(function(req, res) {
		Stock.remove({
			_id: req.params.stock_id
		}, function(err, stock) {
			if (err)
				res.send(err);

			res.json({ message: 'Successfully deleted' });
		});
	})

app.route('/ventes')
	.get(function(req, res, next) {
		Vente.find({}, function(err, ventes) {
			if (err) {
				return next(err);
			} else {
				//console.log(ventes);
				res.json(ventes);
			}
		});
	})

	.post(function(req, res, next) {
		var vente = new Vente(req.body);
		vente.save(function(err) {
			if (err) {
				return next(err);
			}
			else {
				res.json(vente);
			}
		});
	})

app.route('/plusValue')
	.get(function(req, res, next) {
		PlusValue.find({}, function(err, plusValue) {
			if (err) {
				return next(err);
			} else {
				//console.log(plusValue);
				res.json(plusValue);
			}
		});
	})

	.post(function(req, res, next) {
		var plusValue = new PlusValue(req.body);
		plusValue.save(function(err) {
			if (err) {
				return next(err);
			}
			else {
				res.json(plusValue);
			}
		});
	})

app.route("/")
	.get(function(req,res) {
		res.sendFile(path.resolve("../vue/vue.html"));
	})

app.listen(3000);
console.log('Server is running ...');
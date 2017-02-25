var express = require('express');
var app = express();

var xmlHttp = require('xmlhttprequest');

app.use(express.static('./public'));

var bodyParser = require('body-parser');
app.use(bodyParser.json());

var mongoose = require('mongoose');
var db = mongoose.connect('mongodb://localhost/server');
var Schema = mongoose.Schema;

var StockSchema = new Schema({
	name: String,
	symbole: String,
	price: Number	
});
var Stock = mongoose.model('Stock', StockSchema);

app.get('/', function(req,res) {
	res.send('Hello World');
});

function httpGetAsync(theUrl, callback)
{
    xmlHttp.onreadystatechange = function() { 
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
            callback(xmlHttp.responseText);
    }
    xmlHttp.open("GET", theUrl, true); // true for asynchronous 
    xmlHttp.send(null);
}

app.get('/api/:symbol', function(req,res) {
	var symbol = req.params.symbol;
	
	var url = 'https://query.yahooapis.com/v1/public/yql?q=';

	var data = 'select%20symbol,%20Name,%20Volume,%20Bid,%20Change,%20YearLow,%20YearHigh%20,%20Open%20from' +

	   '%20yahoo.finance.quotes%20where%20symbol%20in%20(%22'+symbol+'%22)';

	var url2 = url + data + "&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=";

	console.log(url2);
	
	var http = require('http');

	
	
	var options = {
	  host: 'https://query.yahooapis.com',
	  path: 'v1/public/yql?q='+data+'&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys&callback=',
	  //This is the only line that is new. `headers` is an object with the headers to request
	  headers: {'custom': 'Custom Header Demo works'}
	};

	callback = function(response) {
	  var str = ''
	  response.on('data', function (chunk) {
		str += chunk;
	  });

	  response.on('end', function () {
		console.log(str);
	  });
	}

	var req = http.request(options, callback);

	res.send(req);
	//res.send(httpGetAsync(url2));
});


app.route('/stocks')
.get(function(req, res, next) {
	Stock.find({}, function(err, stocks) {
		if (err) {
			return next(err);
		} else {
			console.log(stocks);
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
});

app.listen(3000);
console.log('Server is running ...');
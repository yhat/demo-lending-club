var express = require('express'),
  path = require('path'),
  fs = require('fs'),
  http = require('http'),
  exphbs = require('express3-handlebars'),
  lessMiddleware = require('less-middleware'),
  yhat = require('yhat');


yh = yhat.init(process.env.YHAT_USERNAME, process.env.YHAT_APIKEY, "https://sandbox.yhathq.com/");


var examples = [
  // high prob
  {
      "last_fico_range_high" : 550,
      "last_fico_range_low" : 495,
      "revol_util" : 20,
      "inq_last_6mths" : 1,
      "home_ownership" : "MORTGAGE",
      "annual_inc" : 75000,
      "loan_amnt" : 6000
  },
  // med prob
  {
      "last_fico_range_high" : 650,
      "last_fico_range_low" : 545,
      "revol_util" : 60,
      "inq_last_6mths" : 6,
      "home_ownership" : "MORTGAGE",
      "annual_inc" : 45000,
      "loan_amnt" : 20000
  },
  // low prob
  {
      "last_fico_range_high" : 700,
      "last_fico_range_low" : 645,
      "revol_util" : 10,
      "inq_last_6mths" : 1,
      "home_ownership" : "MORTGAGE",
      "annual_inc" : 75000,
      "loan_amnt" : 15000
  }
]

/*
 * Initiate Express
 */
var app = express();


/* 
 * App Configurations
 */
app.configure(function() {
  app.set('port', process.env.PORT || 5000);

  app.set('views', __dirname + '/views');

  app.set('view engine', 'html');
  app.engine('html', exphbs({
    defaultLayout: 'main',
    extname: '.html'
    //helpers: helpers
  }));
  app.enable('view cache');

  app.use(lessMiddleware({
    src: __dirname + '/public',
    compress: true,
    sourceMap: true
  }));
  app.use(express.static(path.join(__dirname, 'public')));

  app.use(express.bodyParser());
  app.use(express.favicon());
  app.use(express.logger('dev')); 
  app.use(express.methodOverride());
  app.use(app.router);
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

/*
* Route for Index
*/
app.get('/', function(req, res) {
  var idx = Math.floor(Math.random()*3);
  res.render('index', { params: examples[idx] });
});

app.post('/', function(req, res) {
  data = req.body;
  yh.predict("LendingClub", data, function(err, result) {
    res.send(result);
  });
});


/*
 * Routes for Robots/404
 */
app.get('/robots.txt', function(req, res) {
  fs.readFile(__dirname + "/robots.txt", function(err, data) {
    res.header('Content-Type', 'text/plain');
    res.send(data);
  });
});

app.get('*', function(req, res) {
  res.render('404');
});


http.createServer(app).listen(app.get('port'), function() {
  console.log("Express server listening on port " + app.get('port'));
});

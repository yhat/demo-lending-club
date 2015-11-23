fs = require("fs")
http = require("http")
path = require("path")
# express and middleware
express = require("express")
favicon = require("serve-favicon")
logger = require("morgan")
cookieParser = require("cookie-parser")
bodyParser = require("body-parser")
multer  = require('multer')
compression = require("compression")
session = require("express-session")
less = require("less-middleware")
yhat = require('yhat')

examples = [
  #high prob
  {
      "last_fico_range_high" : 550,
      "last_fico_range_low" : 495,
      "revol_util" : 20,
      "inq_last_6mths" : 1,
      "home_ownership" : "MORTGAGE",
      "annual_inc" : 75000,
      "loan_amnt" : 6000
  },
  #med prob
  {
      "last_fico_range_high" : 650,
      "last_fico_range_low" : 545,
      "revol_util" : 60,
      "inq_last_6mths" : 6,
      "home_ownership" : "MORTGAGE",
      "annual_inc" : 45000,
      "loan_amnt" : 20000
  },
  #low prob
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

yh = yhat.init("demo-master", "4a662eb13647cfb9ed4ca36c5e95c7b3", "https://sandbox.yhathq.com/")
upload = multer({ dest: 'uploads/' })
app = express()

upload = multer({ dest: 'uploads/' })
# setup templating
app.set 'views', path.join(__dirname, '/views')
app.set 'view engine', 'html'    # use .html extension for templates
app.set 'layout', 'layout'       # use layout.html as the default layout
# define partials available to all pages
app.set 'partials', {}

# app.enable 'view cache'
app.engine 'html', require('hogan-express')

# setup middleware
app.use(favicon(__dirname + '/public/favicon.ico'))
app.use logger("dev")
app.use compression()

app.use bodyParser.json({limit: '50mb'})
app.use bodyParser.urlencoded({ extended: true })

app.use cookieParser()
app.use session({
  secret: 'foomanbrew'
  resave: true,
  saveUninitialized: true
})

app.use less(path.join(__dirname, "public"), {}, {}, { sourceMap: true, compress: true })
app.use express.static(path.join(__dirname, "public"))


# Routes
app.get "/", (req, res) ->
  idx = Math.floor(Math.random()*3)
  data = examples[idx]
  data.logo = "img/demo-logo.png"
  res.render "index", data

app.post "/", (req, res) ->
  yh.predict "LendingClub", req.body, (err, result) ->
    res.send(result)

app.get "/logo", (req, res) ->
  res.render "logo"

app.post "/logo", upload.single('logo'), (req, res) ->
  if req.file.path
    w = fs.createWriteStream(path.join(__dirname, "public/img", "demo-logo.png"))
    fs.createReadStream(req.file.path).pipe(w)
    res.redirect '/'
  else
    fs.unlinkSync(path.join(__dirname, "public/img", "demo-logo.png"))
    res.redirect '/'

# catch 404 and forward to error handler
app.use (req, res, next) ->
  err = new Error("Not Found")
  err.status = 404
  res.render "404", { title: "404 | Whoops" }

# development error handler
if app.get("env") is "development"
  app.use (err, req, res, next) ->
    console.log "[CRITICAL ERROR]: #{err}"
    res.status err.status || 500
    res.render "error", { message: err.message, error: err }

# production error handler
app.use (err, req, res, next) ->
  console.log "[CRITICAL ERROR]: #{err}"
  res.status err.status || 500
  res.render "error", { message: err.message, error: {} }

# start the server
port = port || parseInt(process.env.PORT, 10) or 3000
app.set "port", port
server = http.createServer(app)
# start listening and print out what port we're on for sanity's sake
server.listen port
console.error "Listening on port #{port}"

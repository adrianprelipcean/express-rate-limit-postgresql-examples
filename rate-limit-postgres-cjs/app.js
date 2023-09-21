var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

const { rateLimit } = require('express-rate-limit')

const PostgresStore = require('@acpr/rate-limit-postgresql').PostgresStore
const PostgresStoreIndividualIP = require('@acpr/rate-limit-postgresql').PostgresStoreIndividualIP

let databaseConnection = {
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  database: process.env.PGDATABASE,
  port: parseInt(process.env.PGPORT)
}

const aggregatedRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message:
    'Too many accounts created from this IP, please try again after 15 minutes',
  standardHeaders: 'draft-7', // Set `RateLimit` and `RateLimit-Policy`` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: new PostgresStore(
    databaseConnection,
    'aggregated_store'
  ), // Use an external store for more precise rate limiting
})


const individualRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 3, // Limit each IP to 100 requests per `window` (here, per 15 minutes)
  message:
    'Too many accounts created from this IP, please try again after 15 minutes',
  standardHeaders: 'draft-7', // Set `RateLimit` and `RateLimit-Policy`` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  store: new PostgresStoreIndividualIP(
    databaseConnection,
    'individual_store'), // Use an external store for more precise rate limiting
})

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', aggregatedRateLimiter, usersRouter);
app.use('/other-users', individualRateLimiter, usersRouter);


// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

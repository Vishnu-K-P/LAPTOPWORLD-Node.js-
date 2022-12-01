require("dotenv").config()
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const session = require('express-session')
const hbs = require('express-handlebars')
const logger = require('morgan');
const usersRouter = require('./routes/users');      
const adminRouter = require('./routes/admin');
const app = express();
const db = require('./config/connection')
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');



app.engine('hbs',hbs.engine({
  extname:'hbs',defaultLayout:false,layoutsDir:__dirname+'/views/layouts/',partialsDir:__dirname+'/views/partials/',helpers: {
    inc: function (value, options) {
      return parseInt(value) + 1;
    }
  }
}))



app.use((req, res, next) => {
  if (!req.admin) {
    res.header("cache-control", "private,no-cache,no-store,must revalidate");
    res.header("Express", "-3");
  }
  next();
});

const maxAge = 24 * 60 * 60 * 1000;
app.use(
  session({
    secret:"key",
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: maxAge }
  })
);


app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', usersRouter);
app.use('/', adminRouter);

db.connect((err) => {
  if (err) {

    console.log('connection erorr' + err)
  }
  else {

    console.log("database connected")
  }
});

app.use(function (req, res, next) {
  next(createError(404));
});


app.use(function (err, req, res, next) {

  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};


  res.status(err.status || 500);
  res.render('404page');
});


var Hbs = hbs.create({});
Hbs.handlebars.registerHelper('if_eq', function(a, b, opts) {
  if(a == b)
      return opts.fn(this);
  else
      return opts.inverse(this);
});




module.exports = app;

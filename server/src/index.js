var express = require('express');
var morgan = require('morgan');
var cors = require('cors');
var app = express();

app.use(morgan(':method :url :status :res[content-length] - :response-time ms'));
app.use(express.json());
app.use(cors({
  origin: ['http://localhost:3001', 'http://localhost:3000'],
  optionsSuccessStatus: 200, // some legacy browsers (IE11, various SmartTVs) choke on 204
  methods: ['GET', 'PUT', 'POST', 'DELETE', 'PATCH', 'OPTIONS'],
  preflightContinue: true
}));
app.use(require('./router'));

app.listen(8080,function(){
    console.log("We have started our server on port 8080");
});
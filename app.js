/**
 * Created by ro on 26.10.16.
 */

'use strict';

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var session = require('express-session');
var getRelativeDate = require('./script/getRelativeDate');
var router = require("./routes/router");
var hbs = require('express-hbs');

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: 'publicSecret', resave: false, saveUninitialized: true}));

app.engine('hbs', hbs.express4({
    partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');

hbs.registerHelper("relativeDueDate", function (dueDate, undefinedDateValueString) {
    return getRelativeDate(dueDate, undefinedDateValueString);
});

hbs.registerHelper("isFinishedDate", function (finishedDate) {
    return !finishedDate ? "" : "checked";
});

hbs.registerHelper("showImportance", function (importance) {
    return "*".repeat(importance);
});

hbs.registerHelper("isSelected", function (option, importance) {
    if (Number(option) === Number(importance)) {
        return "selected"
    } else {
        return ""
    }
});

hbs.registerHelper("finishedDateChecked", function (finishedDate) {
    if (finishedDate) {
        return "checked"
    } else {
        return ""
    }
});

app.use(express.static("./public"));

app.use("/", router);

var hostname = '127.0.0.1';
var port = 27732;
app.listen(port, hostname, function () {
    console.log("Server running at http://" + hostname + ":" + port + "/");
});

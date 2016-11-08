/**
 * Created by ro on 26.10.16.
 */

'use strict';

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var camelCase = require('camelcase');

var Datastore = require('nedb');
var db = new Datastore({filename: './data/note.db', autoload: true});

var app = express();
app.use(bodyParser.urlencoded({extended: false}));

var getRelativeDate = require('./script/getRelativeDate');

var hbs = require('express-hbs');

var sortType;
var sortOrder;

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

var publicPath = path.resolve(__dirname, "public");

app.use(express.static(publicPath));


app.get("/", function (request, response) {
    db.find({}, function (err, docs) {
        app.locals.notes = docs;
        response.render("overview");
    });

});

app.get("/detail", function (request, response) {

    response.render("detail");

});

app.get("/detail/:id", function (request, response) {
    db.findOne({_id: request.params.id}, function (err, docs) {
        app.locals.currentNote = docs;
        response.render("detail", app.locals.currentNote);
    });
});

app.post("/detail", function (request, response) {

    if (!request.body["_id"]) {
        delete request.body["_id"];
    }

    if (request.body["finishedDateChecked"] === "on") {
        if (!request.body["finishedDate"]) {
            request.body["finishedDate"] = Date();
        }
    } else {
        delete request.body["finishedDate"];
    }

    delete request.body["finishedDateChecked"];

    db.update({_id: request.body["_id"]}, request.body, {upsert: true});
    console.log(request.body);
    response.redirect("/");
});

app.get("/ajax/sort", function (request, response, next) {
    sortType = camelCase(request.query.sortButton.substring(12));
    console.log(sortType);
    db.find({}).sort({[sortType]: -1}).exec(function (err, docs) {
        app.locals.notes = docs;
        response.render("ajaxnotes");
    });
});

app.get("/ajax/finished", function (request, response, next) {
    db.find({finishedDate: {$exists: true}}, function (err, docs) {
        app.locals.notes = docs;
        response.render("ajaxnotes");
    });
});

app.use(function (request, response) {
    response.status(404).render("404");
});

var hostname = '127.0.0.1';
var port = 27732;
app.listen(port, hostname, function () {
    console.log("Server running at http://" + hostname + ":" + port + "/");
});

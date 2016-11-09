/**
 * Created by ro on 26.10.16.
 */

'use strict';

var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');
var camelCase = require('camelcase');
var session = require('express-session');

var Datastore = require('nedb');
var db = new Datastore({filename: './data/note.db', autoload: true});

var app = express();
app.use(bodyParser.urlencoded({extended: false}));
app.use(session({secret: 'publicSecret', resave: false, saveUninitialized: true}));

var getRelativeDate = require('./script/getRelativeDate');

var hbs = require('express-hbs');

/*var sortType = "importance";
 var sortOrder = -1;
 var filterOn = false;
 app.locals.styleSheetOption = "notes.css";*/

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

/*
 hbs.registerHelper("getStyleSheetOption", function () {
 return response.locals.actualSession.styleSheetOption;
 });

 hbs.registerHelper("setSelectedStyleSheet", function (styleSheetOption) {
 if (Number(styleSheetOption) === 1) {
 if (response.locals.actualSession.styleSheetOption === "notes.css") {
 return 'selected="selected"';
 }
 }
 if (Number(styleSheetOption) === 2) {
 if (response.locals.actualSession.styleSheetOption === "fancynotes.css") {
 return 'selected="selected"';
 }
 }
 });
 */

var publicPath = path.resolve(__dirname, "public");

app.use(express.static(publicPath));

app.use(function (request, response, next) {
    response.locals.actualSession = request.session;

    /* if (!response.locals.actualSession.notes) {
     response.locals.actualSession.notes = {};
     }*/
    if (!response.locals.actualSession.sortType) {
        response.locals.actualSession.sortType = "importance";
    }
    if (!response.locals.actualSession.sortOrder) {
        response.locals.actualSession.sortOrder = -1;
    }
    if (!response.locals.actualSession.filterOn) {
        response.locals.actualSession.filterOn = false;
    }
    if (!response.locals.actualSession.styleSheetOption) {
        response.locals.actualSession.styleSheetOption = "notes.css";
    }

    hbs.registerHelper("getStyleSheetOption", function () {
        return response.locals.actualSession.styleSheetOption;
    });

    hbs.registerHelper("setSelectedStyleSheet", function (styleSheetOption) {
        if (Number(styleSheetOption) === 1) {
            if (response.locals.actualSession.styleSheetOption === "notes.css") {
                return 'selected="selected"';
            }
        }
        if (Number(styleSheetOption) === 2) {
            if (response.locals.actualSession.styleSheetOption === "fancynotes.css") {
                return 'selected="selected"';
            }
        }
    });

    /*hbs.registerHelper("getNotes", function () {
     return response.locals.actualSession.notes.length();
     })*/

    next();
});


app.get("/", function (request, response) {

    db.find({}).sort({[response.locals.actualSession.sortType]: response.locals.actualSession.sortOrder}).exec(function (err, docs) {
        response.locals.actualSession.notes = docs;

        console.log(response.locals.actualSession.sortType);
        console.log(response.locals.actualSession.notes);
        response.render("overview", {notes: response.locals.actualSession.notes});
    });
});

app.get("/detail", function (request, response) {

    response.render("detail");

});

app.get("/detail/:id", function (request, response) {
    db.findOne({_id: request.params.id}, function (err, docs) {
        response.locals.actualSession.currentNote = docs;
        response.render("detail", {note:response.locals.actualSession.currentNote});
    });
});

app.post("/detail", function (request, response) {

    if (!request.body["_id"]) {
        delete request.body["_id"];
        request.body["createDate"] = Date();
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

    response.redirect("/");
});

app.get("/ajax/sort", function (request, response, next) {

    //console.log(request.query.sortButton);

    if (request.query.sortButton.indexOf("filter") > 0) {
        response.locals.actualSession.filterOn = response.locals.actualSession.filterOn ? false : true;
    } else {

        var actualSortType = camelCase(request.query.sortButton.substring(12));

        if (response.locals.actualSession.sortType === actualSortType) {
            response.locals.actualSession.sortOrder = -1 * response.locals.actualSession.sortOrder;
        } else {
            response.locals.actualSession.sortOrder = -1;
        }

        response.locals.actualSession.sortType = actualSortType;
    }

    var actualFilter = {};

    if (response.locals.actualSession.filterOn) {
        actualFilter = {finishedDate: {$exists: true}}
    }

    //console.log(sortType);
    db.find(actualFilter).sort({[response.locals.actualSession.sortType]: response.locals.actualSession.sortOrder}).exec(function (err, docs) {
        response.locals.actualSession.notes = docs;
        response.render("ajaxnotes", {notes: response.locals.actualSession.notes});
    });
});

app.get("/ajax/finished", function (request, response, next) {
    var finishedNoteId = request.query.finishedNote.substring(14);

    db.findOne({_id: finishedNoteId}, function (err, docs) {
        if (docs.finishedDate) {
            db.update({_id: finishedNoteId}, {$unset: {finishedDate: true}}, {}, function () {
                db.find({}).sort({[response.locals.actualSession.sortType]: response.locals.actualSession.sortOrder}).exec(function (err, docs) {
                    response.locals.actualSession.notes = docs;
                    response.render("ajaxnotes", {notes: response.locals.actualSession.notes});
                });
            });
        } else {
            db.update({_id: finishedNoteId}, {$set: {finishedDate: Date()}}, {}, function () {
                db.find({}).sort({[response.locals.actualSession.sortType]: response.locals.actualSession.sortOrder}).exec(function (err, docs) {
                    response.locals.actualSession.notes = docs;
                    response.render("ajaxnotes", {notes: response.locals.actualSession.notes});
                });
            });
        }
        //response.render("ajaxnotes");
    });
});

app.get("/stylechange", function (request, response, next) {

    //console.log(request.query);
    if (request.query.newStyleSheetOption == "black-white-style") {
        response.locals.actualSession.styleSheetOption = "notes.css";
        //sess.styleSheetOption2 = "notes.css";
        //console.log("Session ID" + sess.id);
    }
    if (request.query.newStyleSheetOption == "color-style") {
        response.locals.actualSession.styleSheetOption = "fancynotes.css";
        //sess.styleSheetOption2 = "fancynotes.css";
        //console.log("Session ID" + sess.id);
    }

    response.redirect("/");
});

app.use(function (request, response) {
    response.status(404).render("404");
});

var hostname = '127.0.0.1';
var port = 27732;
app.listen(port, hostname, function () {
    console.log("Server running at http://" + hostname + ":" + port + "/");
});

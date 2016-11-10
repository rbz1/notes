/**
 * Created by ro on 26.10.16.
 */

'use strict';

var express = require('express');
var camelCase = require('camelcase');
var session = require('express-session');
var noteRouter = express.Router();

var Datastore = require('nedb');
var db = new Datastore({filename: './data/note.db', autoload: true});

var app = express();

app.use(session({secret: 'publicSecret', resave: false, saveUninitialized: true}));

noteRouter.use(function (request, response, next) {
    response.locals.currentSession = request.session;

    if (!response.locals.currentSession.sortType) {
        response.locals.currentSession.sortType = "importance";
    }
    if (!response.locals.currentSession.sortOrder) {
        response.locals.currentSession.sortOrder = -1;
    }
    if (!response.locals.currentSession.filterOn) {
        response.locals.currentSession.filterOn = false;
    }
    if (!response.locals.currentSession.styleSheetOption) {
        response.locals.currentSession.styleSheetOption = "notes.css";
    }

    next();
});

noteRouter.get("/", function (request, response) {
    db.find({}).sort({[response.locals.currentSession.sortType]: response.locals.currentSession.sortOrder}).exec(function (err, docs) {
        response.render("overview", {
            notes: docs,
            styleSheetOption: response.locals.currentSession.styleSheetOption,
            dropDownList: renderDropDownList(response.locals.currentSession.styleSheetOption)
        });
    });
});

noteRouter.get("/detail", function (request, response) {
    response.render("detail", {styleSheetOption: response.locals.currentSession.styleSheetOption});
});

noteRouter.get("/detail/:id", function (request, response) {
    db.findOne({_id: request.params.id}, function (err, docs) {
        response.render("detail", {
            note: docs,
            styleSheetOption: response.locals.currentSession.styleSheetOption
        });
    });
});

noteRouter.post("/detail", function (request, response) {

    if (!request.body["_id"]) {
        delete request.body["_id"];
        request.body["createDate"] = new Date().toISOString();
        console.log("Create Date");
    }

    if (request.body["finishedDateChecked"] === "on") {
        if (!request.body["finishedDate"]) {
            request.body["finishedDate"] = new Date().toISOString();
        }
    } else {
        delete request.body["finishedDate"];
    }

    delete request.body["finishedDateChecked"];

    db.update({_id: request.body["_id"]}, request.body, {upsert: true});

    response.redirect("/");
});

noteRouter.get("/ajax/sort", function (request, response) {
    if (request.query.sortButton.indexOf("filter") > 0) {
        response.locals.currentSession.filterOn = response.locals.currentSession.filterOn ? false : true;
    } else {
        var currentSortType = camelCase(request.query.sortButton.substring(12));

        if (response.locals.currentSession.sortType === currentSortType) {
            response.locals.currentSession.sortOrder = -1 * response.locals.currentSession.sortOrder;
        } else {
            response.locals.currentSession.sortOrder = -1;
        }

        response.locals.currentSession.sortType = currentSortType;
    }

    var currentFilter = {};

    if (response.locals.currentSession.filterOn) {
        currentFilter = {finishedDate: {$exists: true}}
    }

    db.find(currentFilter).sort({[response.locals.currentSession.sortType]: response.locals.currentSession.sortOrder}).exec(function (err, docs) {
        response.render("ajaxnotes", {notes: docs});
    });
});

noteRouter.get("/ajax/finished", function (request, response) {
    var finishedNoteId = request.query.finishedNote.substring(14);

    db.findOne({_id: finishedNoteId}, function (err, docs) {
        var finishedDateValue;
        if (docs.finishedDate) {
            finishedDateValue = {$unset: {finishedDate: true}}
        } else {
            finishedDateValue = {$set: {finishedDate: new Date().toISOString()}}
        }
        db.update({_id: finishedNoteId}, finishedDateValue, {}, function () {
            db.find({}).sort({[response.locals.currentSession.sortType]: response.locals.currentSession.sortOrder}).exec(function (err, docs) {
                response.render("ajaxnotes", {notes: docs});
            });
        });
    });
});

noteRouter.get("/stylechange", function (request, response) {

    if (request.query.newStyleSheetOption == "black-white-style") {
        response.locals.currentSession.styleSheetOption = "notes.css";
    }
    if (request.query.newStyleSheetOption == "color-style") {
        response.locals.currentSession.styleSheetOption = "fancynotes.css";
    }

    response.redirect("/");
});

noteRouter.use(function (request, response) {
    response.status(404).render("404");
});

function renderDropDownList(currentStyleSheetOption) {
    var dropDownList = "";

    if (currentStyleSheetOption === "notes.css") {
        dropDownList = '<option value="black-white-style" selected="selected">Black white style</option>';
        dropDownList += '<option value="color-style" >Color style</option>';
    }

    if (currentStyleSheetOption === "fancynotes.css") {
        dropDownList = '<option value="black-white-style">Black white style</option>';
        dropDownList += '<option value="color-style" selected="selected">Color style</option>';
    }

    return dropDownList;
}

module.exports = noteRouter;
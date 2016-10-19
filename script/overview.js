/**
 * Created by ro on 26.09.16.
 */
//$(".note-items-area").empty();


var notes = sessionStorage.getItem("notes");

if (!notes) {
    sessionStorage.setItem("notes", JSON.stringify([]));
    notes = sessionStorage.getItem("notes");
}
notes = JSON.parse(notes);

Handlebars.registerHelper("relativeDueDate", function (dueDate, undefinedDateValueString) {
    return getRelativeDate(dueDate, undefinedDateValueString);
});

Handlebars.registerHelper("isFinishedDate", function (finishedDate) {
    return !finishedDate ? "" : "checked";
});

Handlebars.registerHelper("showImportance", function (importance) {
    return "*".repeat(importance);
});

//Catch Handlebars template
var templateHtml = $('#note-template').html();

//Compile Handlebars template
var compiledTemplate = Handlebars.compile(templateHtml);

//Test data
/*
 notes.push({
 "id": "1",
 "due-date": "2016-09-28",
 "create-date": "2016-07-12",
 "title": "Staubsaugen",
 "finished-date": "2016-09-12",
 "state": "Offen",
 "description": "Auch in den Ecken saugen."
 });

 notes.push({
 "id": "2",
 "due-date": "2016-08-03",
 "create-date": "2016-05-12",
 "title": "Buch fertiglesen",
 "finished-date": "2016-08-03",
 "state": "Offen",
 "description": "Das Buch muss bald in die Bibliothek zurück."
 });
 */

notes.forEach(renderNotes);

function renderNotes(item) {
    //Use compiled Handlebars template
    var renderedHtml = compiledTemplate(item);

    $('.note-items-area').append(renderedHtml);
}

$('#style-selector').on("change", function () {
    alert("Neuer Stil");
});

$('#btn-filter-by-create-date').on("click", function () {
    alert("Hallo!");
});

$('#btn-create-new-note').on("click", function () {
    sessionStorage.setItem("notes", JSON.stringify(notes));
    sessionStorage.setItem("currentNoteID", 0);
    window.location.replace("detail.html");
});

$("#note-items").on("click", function () {
    sessionStorage.setItem("notes", JSON.stringify(notes));

    if (event.target instanceof HTMLButtonElement) {
        sessionStorage.setItem("currentNoteID", Number(event.target.id));
        window.location.replace("detail.html");
    }
});

$("#btn-sort-by-importance").on("click", function () {
    var notesShallowCopy = notes.slice(0);

    notesShallowCopy.sort(function (a, b) {
        return a.importance > b.importance;
    });
    $("#note-items").empty();
    notesShallowCopy.forEach(renderNotes);
});

$("#btn-sort-by-create-date").on("click", function () {
    var notesShallowCopy = notes.slice(0);

    notesShallowCopy.sort(function (a, b) {
        var createDateA = !a.createDate ? new Date("3000-01-01") : new Date(a.createDate);
        var createDateB = !b.createDate ? new Date("3000-01-01") : new Date(b.createDate);
        return createDateA < createDateB;
    });
    $("#note-items").empty();
    notesShallowCopy.forEach(renderNotes);
});

$("#btn-sort-by-finish-date").on("click", function () {
    var notesShallowCopy = notes.slice(0);

    notesShallowCopy.sort(function (a, b) {
        var finishedDateA = !a.finishedDate ? new Date("3000-01-01") : new Date(a.finishedDate);
        var finishedDateB = !b.finishedDate ? new Date("3000-01-01") : new Date(b.finishedDate);
        return finishedDateA < finishedDateB;
    });
    $("#note-items").empty();
    notesShallowCopy.forEach(renderNotes);
});

$("#btn-show-finished").on("click", function () {
    var notesShallowCopy = [];

    notes.forEach(function (item) {
        if( item.finishedDate !== undefined) {
            notesShallowCopy.push(item);
        };
    });
    $("#note-items").empty();
    notesShallowCopy.forEach(renderNotes);
});

/**
 * Created by ro on 26.09.16.
 */
//$(".note-items-area").empty();

var notes = [];

//Catch Handlebars template
var templateHtml = $('#note-template').html();

//Compile Handlebars template
var compiledTemplate = Handlebars.compile(templateHtml);

//Test data
notes.push({
    "id": "1",
    "note-end-date": "2016-09-28",
    "note-create-date": "2016-07-12",
    "note-title": "Staubsaugen",
    "note-finished": "unckecked",
    "note-state": "Offen",
    "note-details": "Auch in den Ecken saugen." });

notes.push({
    "id": "2",
    "note-end-date": "2016-08-03",
    "note-create-date": "2016-05-12",
    "note-title": "Buch fertiglesen",
    "note-finished": "unckecked",
    "note-state": "Offen",
    "note-details": "Das Buch muss bald in die Bibliothek zurück." });

notes.forEach(renderNotes);



function renderNotes(item) {
    //Use compiled Handlebars template
    var renderedHtml = compiledTemplate(item);

    $('.note-items-area').append(renderedHtml);
}

/*
$(function () {
    var templateHtml = $("#note-template").html();

    var compiledTemplate = Handlebars.compile(templateHtml);

    var context = {
        "id": "1",
        "note-end-date": "Morgen",
        "note-title": "Staubsaugen",
        "note-finished": "unckecked",
        "note-state": "Offen",
        "note-details": "Staubsaugen ist sehr anstrengend." };

    var renderedHtml = compiledTemplate(context);

    $('.note-items-area').append(renderedHtml);
});
*/


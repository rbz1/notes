/**
 * Created by ro on 17.10.16.
 */

function Note(newId) {
    this.id = newId;
    this.title = "";
    this.description = "";
    this.importance = 1;
    this.createDate = (new Date()).toString();
    this.dueDate = undefined;
    this.finishedDate = undefined;
}

function newNoteId() {
    var maxId = 0;
    notes.forEach(function (item) {
        if (Number(item.id) > maxId) {
            maxId = Number(item.id);
        }
    });
    return maxId + 1;
}

function getCurrentNote() {
    return notes.find(function (item) {
        return Number(item.id) === currentNoteID;
    });
}

var notes = sessionStorage.getItem("notes");
if (!notes) {
    sessionStorage.setItem("notes", JSON.stringify([]));
    notes = sessionStorage.getItem("notes");
}

notes = JSON.parse(notes);

var currentNoteID = Number(sessionStorage.getItem("currentNoteID"));

var currentNote;

if (!currentNoteID) {
    currentNote = new Note(newNoteId());
    $("#note-importance").val(currentNote.importance);
} else {
    currentNote = getCurrentNote();
    $("#note-title").val(currentNote.title);
    $("#note-description").val(currentNote.description);
    $("#note-dueDate").val(Date(currentNote.dueDate));
    $("#note-importance").val(currentNote.importance);
    $("#note-finished-date").prop("checked", !!currentNote.finishedDate);
}

$("#note-finished-date").change(function () {

    if ($(this).is(":checked")) {
        currentNote.finishedDate = (new Date()).toString();
    } else {
        currentNote.finishedDate = undefined;
    }
});

$("#note-save").on("click", function () {
    currentNote.title = $("#note-title").val();
    currentNote.description = $("#note-description").val();
    currentNote.importance = $("#note-importance").val();
    currentNote.dueDate = $("#note-due-date").val();

    if (!currentNoteID) {
        notes.push(currentNote);
    }

    sessionStorage.setItem("notes", JSON.stringify(notes));

    window.location.replace("overview.html");
});


/**
 * Created by ro on 26.09.16.
 */
'use strict';

$('#style-selector').on("change", function (event) {
    window.location.replace("/stylechange?newStyleSheetOption=" + event.target.value);
    /*$.ajax({
        url: "/ajax/stylechange",
        type: "get",
        data: {newStyleSheetOption: event.target.value}
    }).done(function (data) {
        $("#note-items").empty();
        $("#note-items").append(data);
    });*/
});

// $('#btn-filter-by-create-date').on("click", function () {
//     alert("Hallo!");
// });

$('#btn-create-new-note').on("click", function () {
    window.location.replace("/detail");
});

$("#note-items").on("click", function (event) {
    if (event.target instanceof HTMLButtonElement) {
        window.location.replace("detail/" + event.target.id);
    }
    if (event.target instanceof HTMLInputElement) {
        $.ajax({
            url: "/ajax/finished",
            type: "get",
            data: {finishedNote: event.target.id}
        }).done(function (data) {
            $("#note-items").empty();
            $("#note-items").append(data);
        });
    }
});


$(".sort-notes-area").on("click", function (event) {
    $.ajax({
        url: "/ajax/sort",
        type: "get",
        data: {sortButton: event.target.id}
    }).done(function (data) {
        $("#note-items").empty();
        $("#note-items").append(data);
    });
});

/*$("#btn-show-finished").on("click", function () {

    /!*    $.ajax({
     url: "/ajax/filter"
     }).done(function (data) {
     $("#note-items").empty();
     $("#note-items").append(data);
     });*!/
});*/

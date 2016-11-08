/**
 * Created by ro on 17.10.16.
 */

'use strict';

$("#note-cancel").on("click", function () {
    window.location.replace("/");
});

$(function () {
    $("#note-due-date").datepicker({dateFormat: 'yy-mm-dd'});
});

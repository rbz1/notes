/**
 * Created by ro on 19.10.16.
 */
'use strict';

function getRelativeDate(dateValue, undefinedDateValueString) {
    var timeDifference;
    var absoluteTimeDifference;
    var minute = 60;
    var hour = minute * 60;
    var day = hour * 24;
    var week = day * 7;
    var month = day * 30;
    var year = day * 365;
    var relativeTmeString;

    if (!undefinedDateValueString) {
        relativeTmeString = "";
    }

    if (!dateValue) {
        relativeTmeString = undefinedDateValueString;
    } else {
        timeDifference = Math.round((new Date() - new Date(dateValue)) / 1000);
        absoluteTimeDifference = Math.abs(timeDifference);

        if (absoluteTimeDifference < minute) {
            relativeTmeString = absoluteTimeDifference + " second(s)";
        } else if (absoluteTimeDifference < hour) {
            relativeTmeString = Math.round(absoluteTimeDifference / minute) + " minute(s)";
        } else if (absoluteTimeDifference < day) {
            relativeTmeString = Math.round(absoluteTimeDifference / hour) + " hour(s)";
        } else if (absoluteTimeDifference < week) {
            relativeTmeString = Math.round(absoluteTimeDifference / day) + " day(s)";
        } else if (absoluteTimeDifference < month) {
            relativeTmeString = Math.round(absoluteTimeDifference / week) + " week(s)";
        } else if (absoluteTimeDifference < year) {
            relativeTmeString = Math.round(absoluteTimeDifference / month) + " month(s)";
        } else {
            relativeTmeString = Math.round(absoluteTimeDifference / year) + " year(s)";
        }

        if (timeDifference > 0) {
            relativeTmeString += " ago";
        } else {
            relativeTmeString = "in " + relativeTmeString;
        }
    }

    return relativeTmeString.trim();
}

module.exports = getRelativeDate;
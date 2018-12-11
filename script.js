// jQuery alternative for selections

function sel(query) {
  return document.querySelector(query);
}

function getParameterByName(name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, '\\$&');
  var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

var mocktime = getParameterByName('mock_time');

if (mocktime == null) {
  mocktime = '';
} else {
  mocktime = '?mock_time=' + mocktime;
}

var dataURL = "https://api.ethsbell.xyz/data" + mocktime;
var displayURL = "https://api.ethsbell.xyz/display" + mocktime;

//FIND NEW SOLUTION THAT USES HTTPS!!!
var sheetURL = "https://spreadsheets.google.com/feeds/list/1T-HUAINDX69-UYUHhOO1jVjZ_Aq0Zqi1z08my0KHzqU/1/public/values?alt=json";
// Function to get data from ETHSBell

function run(msg) {
  var rundata = JSON.parse(msg);
  var responseObj = {};
  var rows = [];
  var columns = {};
  for (var i = 0; i < rundata.feed.entry.length; i++) {
    var entry = rundata.feed.entry[i];
    var keys = Object.keys(entry);
    var newRow = {};
    var queried = false;
    for (var j = 0; j < keys.length; j++) {
      var gsxCheck = keys[j].indexOf('gsx$');
      if (gsxCheck > -1) {
        var key = keys[j];
        var name = key.substring(4);
        var content = entry[key];
        var value = content.$t;
        queried = true;
        if (true && !isNaN(value)) {
          value = Number(value);
        }
        newRow[name] = value;
        if (queried === true) {
          if (!columns.hasOwnProperty(name)) {
            columns[name] = [];
            columns[name].push(value);
          } else {
            columns[name].push(value);
          }
        }
      }
    }
    if (queried === true) {
      rows.push(newRow);
    }
  }
  if (true) {
    responseObj['columns'] = columns;
  }
  if (true) {
    responseObj['rows'] = rows;
  }
  table(responseObj);
}

function ajax(theUrl, callback) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.onreadystatechange = function() {
    if (xmlHttp.readyState == 4 && xmlHttp.status == 200)
      callback(xmlHttp.responseText);
  };
  xmlHttp.open("GET", theUrl, true); // true for asynchronous
  xmlHttp.send(null);
}

function ethsbellDiv(text) {
  //Sets the innerHTML of the bell div to the bell when updated
  var bellDiv = sel('#ethsbell');
  bellDiv.innerHTML = text;
}

// ETHS BELL function

function ethsbell() {

  //Update table
  ajax(sheetURL, run);
  //update bell
  console.log('Bell schedule update');
  ajax(displayURL, ethsbellDiv);
  ajax(dataURL, updateBoard);

}

// strip html tags from string (for later)

function stripHtml(html) {
  // Create a new div element
  var temporalDivElement = document.createElement("div");
  // Set the HTML content with the providen
  temporalDivElement.innerHTML = html;
  // Retrieve the text property of the element (cross-browser support)
  return temporalDivElement.textContent || temporalDivElement.innerText || "";
}

/*
 * Refresh ETHSbell every 30 seconds
 * Enable once API is setup
 */

var bellInterval = window.setInterval(ethsbell, 15000);
ajax(sheetURL, table);
ethsbell();

//Location board in form of JS Object

var Locations = {
  "div": function() {
    return sel('#board');
  }
};

var periodList = ["Early Bird", "1st Period", "2nd Period", "3rd Period", "4th Period", "5th Period", "6th Period", "7th Period", "8th Period", "9th Period"];


// Add perids to array to init

for (var k = 0; k < periodList.length; k++) {
  Locations[periodList[k]] = {};
}


//Function to update the table

function convertTo12Hour(time) {
  if (time.length == 4) {
    time = '0' + time;
  }
  var hours = parseInt(time.substr(0, 2));
  var minutes = parseInt(time.substr(3, 4));
  minutes += '';
  if (hours > 12) {
    hours -= 12;
  }
  if (minutes.length == 1) {
    minutes = '0' + minutes;
  }
  return hours + ':' + minutes;
}
//global variables for board
var currentPeriod;
var response;

function updateBoard(data) {
  response = JSON.parse(data);
  if (response.dayOfWeek == 'Saturday' || response.dayOfWeek == 'Sunday') {
    Locations.div().innerHTML = 'Have a nice day!';
  } else {

    var div = Locations.div(); // Where table will be put
    div.innerHTML = ''; // Clear div
    // Add empty table to page
    var table = document.createElement("TABLE");
    div.appendChild(table);

    var periodCount = Object.keys(Locations).length - 1; // How many periods there are in the day

    var periodTimes = response.schedule.period_array;


    table = sel('#board table'); // Define the table for future use
    for (var a = 1; a <= periodCount; a++) {
      var row = document.createElement("tr"); // Add a new row to the table
      row.setAttribute("id", "period" + (a - 1));
      var period = Locations[Object.keys(Locations)[a]]; // Get the JSON for the current period
      // Add a cell to the table with the period number
      var cell = document.createElement("td");
      cell.innerHTML = Object.keys(Locations)[a];
      row.appendChild(cell);
      if (periodTimes !== undefined) {
        // Add period times to the browser
        currentPeriod = Object.keys(Locations)[a];
        var startTime;
        periodTimes.forEach(function(el) {
          if (el.period_name == currentPeriod) {
            startTime = el.start_time;
          }
        });
        var endTime;
        periodTimes.forEach(function(el) {
          if (el.period_name == currentPeriod) {
            endTime = el.end_time;
          }
        });



        var timeCell = document.createElement("td"); // Cell with period times
        timeCell.innerHTML = convertTo12Hour(startTime) + ' - ' + convertTo12Hour(endTime);
        row.appendChild(timeCell);
      }
      // Add each teacher-location cell to the row
      for (var b = 0; b < Object.keys(period).length; b++) {
        var cell = document.createElement("td"); // New cell
        cell.innerHTML = Object.entries(period)[b][0] /*Teacher name*/ + ': ' + Object.entries(period)[b][1] /*Location name*/ ;
        row.appendChild(cell); //Add cell to row

      }

      table.appendChild(row); //Add row to table
    }

    // Highlight current period
    if (response !== undefined) {
      response = response.theSlot; // Get period from json object
      var index = periodList.indexOf(response); //Find period #
      if (index !== -1) { // If period exists
        sel('#period' + (index + '')).className += "current";
      }
    }
  }
}

var classPerPeriod = [];
var teacherList = [];
var teacherLocation = [];

function table(json) {
  //json = JSON.parse(json);
  var teacherArray = json.columns.teachername;
  var data = json.rows;
  for (var j = 0; j < teacherArray.length; j++) {
    for (var k = 0; k < periodList.length; k++) {
      if (Object.values(data[j])[k + 1] !== 'null') {
        Locations[periodList[k]][data[j].teachername] = Object.values(data[j])[k + 1];
      }
    }
  }


}

// Create table (INIT)

//updateBoard();

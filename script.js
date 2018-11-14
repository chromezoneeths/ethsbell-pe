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
// Function to get data from ETHSBell

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
ethsbell();

//Location board in form of JS Object

var Locations = {
  "div": function() {
    return sel('#board');
  },
  "Early Bird": {
    "TeacherA": "Location 1",
    "TeacherB": "Location 2",
    "TeacherC": "Location 3"
  },
  "1st Period": {
    "TeacherA": "Location 4",
    "TeacherB": "Location 5",
    "TeacherC": "Location 6"
  },
  "2nd Period": {
    "TeacherA": "Location 7",
    "TeacherB": "Location 8",
    "TeacherC": "Location 9"
  },
  "3rd Period": {
    "TeacherA": "Location 10",
    "TeacherB": "Location 11",
    "TeacherC": "Location 12"
  },
  "4th Period": {
    "TeacherA": "Location 13",
    "TeacherB": "Location 14",
    "TeacherC": "Location 15"
  },
  "5th Period": {
    "TeacherA": "Location 16",
    "TeacherB": "Location 17",
    "TeacherC": "Location 18"
  },
  "6th Period": {
    "TeacherA": "Location 19",
    "TeacherB": "Location 20",
    "TeacherC": "Location 21"
  },
  "7th Period": {
    "TeacherA": "Location 22",
    "TeacherB": "Location 23",
    "TeacherC": "Location 24"
  },
  "8th Period": {
    "TeacherA": "Location 25",
    "TeacherB": "Location 26",
    "TeacherC": "Location 27"
  },
  "9th Period": {
    "TeacherA": "Location 28",
    "TeacherB": "Location 29",
    "TeacherC": "Location 30"
  }
};

var periodList = [];


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

function updateBoard(data) {
  var response = JSON.parse(data);
  
  periodList = [];
  
  for (var x; x < response.periodArray.length; x ++) {
   
    periodList.push(resposne.periodArray[x].periodName);
    
  }
  
  console.log(periodList);

  if (response.dayOfWeek == 'Saturday' || response.dayOfWeek == 'Sunday') {
    Locations.div().innerHTML = 'Have a nice day!';
  } else {

    var div = Locations.div(); // Where table will be put
    div.innerHTML = ''; // Clear div
    // Add empty table to page
    var table = document.createElement("TABLE");
    div.appendChild(table);

    var periodCount = Object.keys(Locations).length - 1; // How many periods there are in the day

    var currentPeriod;
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

// Create table (INIT)

//updateBoard();

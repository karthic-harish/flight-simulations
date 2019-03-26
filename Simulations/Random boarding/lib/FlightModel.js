var WINDOWBORDERSIZE = 10;
var animationDelay = 50; //controls simulation and transition speed
var isRunning = false; // for simStep() and toggleSimStep()
var surface; // Used in D3 selection of svg drawing surface
var simTimer; // initialize timer
var seatFull = 0; // increment everytime a seat is occupied
var seatFullCheck = [0,0]; // takes in seatFull value to decide
var n = 500; // number of simulation runs

// IMAGES
const urlChair = "img/Chair-icon.png";
const urlPassenger = "img/passenger-icon.png";
const windowpic = "img/window-new.png"

// STATES
const UNSEATED=0; // moving to desired aisle
const WAITING=1; // in desired aisle
const SEATED=2; //  seated

// TIME TAKEN TO GET TO SEAT
// if middle seater, aisle seat occupied
var midmovetime = 3;
// window seater, aisle seat occupied
var windowmovetime1 = 4;
// window seater, middle seat occupied
var windowmovetime2 = 5;
// window seater, aisle + middle occupied
var windowmovetime3 = 6;

// TIME TO STOW BAGGAGE
var bagtime = 8;

//cell size
var maxCols = 40;
var cellWidth; //see redrawWindow()
var cellHeight; //see redrawWindow()

var passengers = [];

// BODY OF PLANE WITH SEATS

var planeArea = [
 {"label":"Right Wing","startRow":7,"numRows":4,"startCol":5,"numCols":31,"color":'#008DCB'},
 {"label":"Left Wing","startRow":12,"numRows":4,"startCol":5,"numCols":31,"color":"#008DCB"},
 {"label":"Aisle","startRow":11,"numRows":1,"startCol":4,"numCols":32,"color":"#00293c"}
];

var seatLabel = [
  {"name":"W","location":{"row":8,"col":3}},

  {"name":"M","location":{"row":9,"col":3}},

  {"name":"A","location":{"row":10,"col":3}},

  {"name":"A","location":{"row":12,"col":3}},

  {"name":"M","location":{"row":13,"col":3}},

  {"name":"W","location":{"row":14,"col":3}}
];



var a = 0;
var b = 0;
left_window = [];
right_window = [];

for (var i = 6; i < 36; i++) {
  left_window[a] = {"location": {"row":7,"col":i}};
  a += 1
};

for (var i = 6; i < 36; i++) {
  right_window[b] = {"location": {"row":15,"col":i}};
  b += 1
};

var allwindow = left_window.concat(right_window);




var statistics = [
{"name":"Current Run Time: ","location":{"row":17,"col":16},
"cumulativeValue":0,"count":0},

{"name":"Grand Total Time: ","location":{"row":18,"col":16},
"cumulativeValue":0,"count":0},

{"name":"Average Run Time: ","location":{"row":19,"col":16},
"cumulativeValue":0,"count":0},

{"name":"Number of Runs: ","location":{"row":20,"col":16},
"cumulativeValue":0,"count":0}
];

// all seats in a list
var N = 180;
var seatindexlist = Array.apply(null, {length: N}).map(Number.call, Number);


//marking out left, right wings and center aisle

var left_wing = [];
var right_wing = [];
var aisle = [];
var x = 0;
var y = 0;
var z = 0;

for (var j = 8; j < 11; j++) {
 for (var i = 6; i < 36; i++) {
  left_wing[x] = {"location": {"row":j,"col":i}, "id":x+1, "occupied": 0};
  x += 1
 };
};

//console.log(left_wing);

for (var j = 12; j < 15; j++) {
 for (var i = 6; i < 36; i++) {
  right_wing[y] = {"location": {"row":j,"col":i}, "id":y+91, "occupied": 0};
  y += 1
 };
};

for (var i = 4; i < 36; i++){
 aisle[z] = {"location": {"row":11,"col":i}, "occupied": 0}
 z+=1
};


var allseats = left_wing.concat(right_wing);
var allseatscopy = left_wing.concat(right_wing);
//console.log(allseats);


// row and column coordinates into screen coordinates x and y
function getLocationCell(location){
	var row = location.row;
	var col = location.col;
	var x = (col-1)*cellWidth; //cellWidth set in Reload()
	var y = (row-1)*cellHeight; //cellHeight set in Reload()
	return {"x":x,"y":y};
};

// in this format for getLocationCell() to work!!


//initialize

(function() {
 // call the function simStep every animationDelay milliseconds
 simTimer = window.setInterval(simStep, animationDelay);
 Reload();
})();

function adjust() {
	window.clearInterval(simTimer); // clear the Timer
	animationDelay = 510 - document.getElementById("slider1").value;
	simTimer = window.setInterval(simStep, animationDelay);
};

//initialize page
function Reload(){

	adjust();

	// Re-initialize simulation variables

  // current simulation time
	statistics[0].cumulativeValue=0;
	statistics[0].count=0;

	seatFull = 0;
	seatFullCheck = [0,0];
	passengers = [];

	left_wing = [];
	right_wing = [];
	x = 0;
	y = 0;
	for (var j = 8; j < 11; j++) {
	 for (var i = 6; i < 36; i++) {
	  left_wing[x] = {"location": {"row":j,"col":i}, "id":x+1, "occupied": 0};
	  x += 1
	 };
	};

//console.log(left_wing);

	for (var j = 12; j < 15; j++) {
	 for (var i = 6; i < 36; i++) {
	  right_wing[y] = {"location": {"row":j,"col":i}, "id":y+91, "occupied": 0};
	  y += 1
	 };
	};

	allseats = left_wing.concat(right_wing);
	allseatscopy = left_wing.concat(right_wing);



var drawsurface = document.getElementById("surface");
var creditselement = document.getElementById("credits");
var w = window.innerWidth; //width of entire window
var h = window.innerHeight; //height of entire window
var surfaceWidth =(w - WINDOWBORDERSIZE);
var surfaceHeight= (h-creditselement.offsetHeight - 3*WINDOWBORDERSIZE);

drawsurface.style.width = surfaceWidth+"px";
drawsurface.style.height = surfaceHeight+"px";
drawsurface.style.left = WINDOWBORDERSIZE/2+'px';
drawsurface.style.top = WINDOWBORDERSIZE/2+'px';
drawsurface.style.border = "thick solid rgba(80,109,47,0.5)";
drawsurface.innerHTML = ''; // Empties contents of drawing surface

numCols = maxCols;
cellWidth = surfaceWidth/numCols;
numRows = Math.ceil(surfaceHeight/cellWidth);
cellHeight = surfaceHeight/numRows;

surface = d3.select('#surface');

surface.selectAll('*').remove(); // we added this because setting the inner html to blank may not remove all svg elements
surface.style("font-size","100%");
// rebuild contents of the drawing surface
updateSurface();

};

// everytime a change occurs, updatesurface is called
function updateSurface(){

 //Select all svg elements of class "passenger" and map it to the data list called passengers
 var allpassengers = surface.selectAll(".passenger").data(passengers);


 // If the list of svg elements is shorter than the data list, the new elements are in the .enter() list.
 // The first time this is called, all the elements of data will be in the .enter() list.
 // Create an svg group ("g") for each new entry in the data list; give it class "passenger"
 var newpassengers = allpassengers.enter().append("g").attr("class","passenger");
 //Append an image element to each new passenger svg group, position it according to the location data, and size it to fill a cell
 // Also note that we can choose a different image to represent the passenger based on the passenger type
 newpassengers.append("svg:image")
  .attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
  .attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
  .attr("width", Math.min(cellWidth,cellHeight)+"px")
  .attr("height", Math.min(cellWidth,cellHeight)+"px")
  .attr("xlink:href",function(d){return urlPassenger});

 // For the existing passengers, we want to update their location on the screen
 // but we would like to do it with a smooth transition from their previous position.
 // D3 provides a very nice transition function allowing us to animate transformations of our svg elements.

 //First, we select the image elements in the allpassengers list
 var images = allpassengers.selectAll("image");
 // Next we define a transition for each of these image elements.
 // Note that we only need to update the attributes of the image element which change
 images.transition()
  .attr("x",function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
  .attr("y",function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
  .duration(animationDelay).ease('linear'); // This specifies the speed and type of transition we want.

 var selectSeats = surface.selectAll(".planeArea").data(planeArea);
 var seatArea = selectSeats.enter().append("g").attr("class","planeArea");
	// For each new area, append a rectangle to the group
 seatArea.append("rect")
	.attr("x", function(d){return (d.startCol-1)*cellWidth;})
	.attr("y", function(d){return (d.startRow-1)*cellHeight;})
	.attr("width", function(d){return d.numCols*cellWidth+5;})
	.attr("height", function(d){return d.numRows*cellWidth;})
	.style("fill", function(d) {return d.color;})
	.style("stroke","#506D2F")
	.style("stroke-width",2)
  .attr("rx", 10)
  .attr("ry", 10);

 var chair = surface.selectAll(".sittingarea").data(allseats);
 var chairplace = chair.enter().append("g").attr("class", "sittingarea");

 chairplace.append("svg:image")
 .attr("x", function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
 .attr("y", function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
 .attr("width", Math.min(cellWidth,cellHeight)+"px")
 .attr("height", Math.min(cellWidth,cellHeight)+"px")
 .attr("xlink:href", function(d){return urlChair;});

 var allwindowimg = surface.selectAll(".allwindow").data(allwindow);
 var allwindowimg1 = allwindowimg.enter().append("g").attr("class", "allwindow");

 allwindowimg1.append("svg:image")
 .attr("x", function(d){var cell= getLocationCell(d.location); return cell.x+"px";})
 .attr("y", function(d){var cell= getLocationCell(d.location); return cell.y+"px";})
 .attr("width", Math.min(cellWidth,cellHeight)+"px")
 .attr("height", Math.min(cellWidth,cellHeight)+"px")
 .attr("xlink:href", function(d){return windowpic;});

 var seatLabelpos = surface.selectAll(".seatLabel").data(seatLabel);
 var seatLabelpos1 = seatLabelpos.enter().append("g").attr("class","seatLabel");
 // For each new statistic group created we append a text label
 seatLabelpos1.append("text")
   .attr("x", function(d) { var cell= getLocationCell(d.location); return (cell.x+cellWidth)+"px"; })
   .attr("y", function(d) { var cell= getLocationCell(d.location); return (cell.y+cellHeight/2)+"px"; })
   .attr("dy", ".35em")
   .attr("font-size", "20px")
   //.attr("font-weight", "bold")
   .attr("font-family", "Helvetica")
   .attr("fill", "#506D2F")
   .style("text-align", "center")
   .text(function(d) {return d.name;});


 // The simulation should serve some purpose
 // so we will compute and display the average length of stay of each patient type.
 // We created the array "statistics" for this purpose.
 // Here we will create a group for each element of the statistics array (two elements)

 var allstatistics = surface.selectAll(".statistics").data(statistics);
 var newstatistics = allstatistics.enter().append("g").attr("class","statistics");
 // For each new statistic group created we append a text label
 newstatistics.append("text")
   .attr("x", function(d) { var cell= getLocationCell(d.location); return (cell.x+cellWidth)+"px"; })
   .attr("y", function(d) { var cell= getLocationCell(d.location); return (cell.y+cellHeight/2)+"px"; })
   .attr("dy", ".35em")
   .attr("font-size", "21px")
   //.attr("font-weight", "bold")
   .attr("font-family", "Helvetica")
   .attr("fill", "#506D2F")
   .text("");

 // The data in the statistics array are always being updated.
 // So, here we update the text in the labels with the updated information.
 allstatistics.selectAll("text").text(function(d) {
   //var avgLengthOfStay = d.cumulativeValue/(Math.max(1,d.count)); // cumulativeValue and count for each statistic are always changing
   return d.name+d.cumulativeValue.toFixed(1); }); //The toFixed() function sets the number of decimal places to display
};

// to add passengers to screen

function randomSeat(obj){
    var keys = Object.keys(obj)
    return obj[keys[ keys.length * Math.random() << 0]];
};


function addPassengers(){
 // assign a random seat to a passenger
 // delete that seat from list
 // until no more available seats
 var luggage = 0;
 if (Math.random()> 0.5) {
		 luggage = 1;} 

 if (allseatscopy.length>0 && aisle[0].occupied == 0) { // add && no passenger at (11,4)
  var passengerseat = randomSeat(allseatscopy);
  var passengerRow = Number(passengerseat.location.row);
  var passengerCol = Number(passengerseat.location.col);
  var newpassenger = {"location":{"row":11,"col":4},
  "target":{"row":passengerRow,"col":passengerCol},
  "aisle":{"row":11,"col":passengerCol},
  "state":UNSEATED, "luggage":luggage,
  "bagwaitcount":1, "seatmovecount": 1};
  passengers.push(newpassenger); //adding passenger to aisle
  var seatindex = allseatscopy.indexOf(passengerseat);
  allseatscopy.splice(seatindex, 1);
  aisle[0].occupied = 1;
  //console.log(allseatscopy.length);
 };
};

var seatsOccupied = {}; // used to manipulate states based on middle/aisle occupied

for (var i = 6; i < 36; i++) {
  seatsOccupied[i] = [];
}

function updatePassenger(passengerIndex){

	//passengerIndex is an index into the passengers data array
	passengerIndex = Number(passengerIndex); //it seems passengerIndex was coming in as a string
	var passenger = passengers[passengerIndex];

	// get the current location of the passenger
	var row = passenger.location.row;
	var col = passenger.location.col;
  console.log(row);
  console.log(col);
	//var type = passenger.type; for elderly, normal future implementation
	var state = passenger.state;

 //fun part
 // getting the NEXT aisle position
 var nextAislePos = aisle.filter(function(a){ return a.location.col === col + 1 });
 //console.log(nextAislePos);
 var nextAisleIndex = Number(aisle.indexOf(nextAislePos[0]));
 //console.log(nextAisleIndex);
 var nextAisleOccupied = aisle[nextAisleIndex];
 //console.log(nextOccupied.occupied);
 // getting CURRENT aisle position
 var currentAislePos = aisle.filter(function(a){ return a.location.col === col });
 //console.log(currentAislePos);
 var currentAisleIndex = Number(aisle.indexOf(currentAislePos[0]));
 var currentAisleOccupied = aisle[currentAisleIndex];
 //console.log(currentOccupied);

 var nextSeatPos = allseatscopy.filter(function(a){ return a.location.col === row + 1 });
 //console.log(nextAislePos);
 var nextSeatIndex = Number(aisle.indexOf(nextAislePos[0]));
 //console.log(nextAisleIndex);
 var nextAisleOccupied = aisle[nextAisleIndex];

	// determine if passenger has arrived at destination col in aisle, seat
 var hasArrivedAisle = (Math.abs(passenger.target.col-col))==0;
 var hasArrivedSeat = (Math.abs(passenger.target.row-row)+Math.abs(passenger.target.col-col))==0;
 if (hasArrivedSeat) {
   seatFull += 1;
 };

	// Behavior of passenger depends on his or her state
  switch (state) {
    case UNSEATED:
      if (hasArrivedAisle){
        if (seatsOccupied[col].includes(passenger.target.row)==false) {
          seatsOccupied[col].push(passenger.target.row);
        } // update dictionary
        if (passenger.luggage==0) { // NO LUGGAGE

          if (Math.abs(passenger.target.row-row)==1) { // left wing AISLE seat, no luggage
            passenger.location.col = col;
            passenger.location.row = passenger.target.row;
            currentAisleOccupied.occupied = 0;
            passenger.state = SEATED;
          }

          else if (passenger.target.row-row==2) { //right wing, MIDDLE seat, no luggage
            if (seatsOccupied[col].includes(12)) { // no luggage, BLOCKED by AISLE seat
              passenger.seatmovecount+=1;

              if (passenger.seatmovecount==midmovetime+1) { // WAITS  for movement in/out
                passenger.location.row = row+1;
                passenger.location.col = col;
                currentAisleOccupied.occupied = 0;
                passenger.state = WAITING; //WAITING, when no blockage for MIDDLE seat
              }
            }
            else {
              passenger.location.row = row+1;
              passenger.location.col = col;
              currentAisleOccupied.occupied = 0;
              passenger.state = WAITING; //WAITING, when no blockage for MIDDLE seat
            }
          }

          else if (passenger.target.row-row==-2) { //left wing, middle seat, no luggage
            if (seatsOccupied[col].includes(10)) { // no luggage, blocked by aisle seat
              passenger.seatmovecount+=1;

              if (passenger.seatmovecount==midmovetime+1) { // WAITS  for movement in/out
                passenger.location.row = row-1;
                passenger.location.col = col;
                currentAisleOccupied.occupied = 0;
                passenger.state = WAITING; //WAITING, when no blockage for MIDDLE seat
              }
            }
            else {
              passenger.location.row = row-1;
              passenger.location.col = col;
              currentAisleOccupied.occupied = 0;
              passenger.state = WAITING; //TBC what to do when no blockage, middle seat???
            }
          }

          else if (passenger.target.row-row==3) { //right wing, window seat, no luggage
            if (seatsOccupied[col].includes(12)) { // no luggage, BLOCK by AISLE seat
              if (seatsOccupied[col].includes(13)) { // BLOCK by MIDDLE also
                passenger.seatmovecount+=1;

                if (passenger.seatmovecount==windowmovetime3+1) { // WAITS  for movement in/out
                  passenger.location.row = row+1;
                  passenger.location.col = col;
                  currentAisleOccupied.occupied = 0;
                  passenger.state = WAITING; //WAITING, when no blockage for WINDOW seat
                }

              }

              else { // only AISLE
                passenger.seatmovecount+=1;

                if (passenger.seatmovecount==windowmovetime1+1) { // WAITS  for movement in/out
                  passenger.location.row = row+1;
                  passenger.location.col = col;
                  currentAisleOccupied.occupied = 0;
                  passenger.state = WAITING; //WAITING, when no blockage for WINDOW seat
                }
              }

            }
            else { // no luggage, not blocked by aisle seat
              if (seatsOccupied[col].includes(13)) { // no luggage, BLOCK by MIDDLE only
                passenger.seatmovecount+=1;

                if (passenger.seatmovecount==windowmovetime2+1) { // WAITS  for movement in/out
                  passenger.location.row = row+1;
                  passenger.location.col = col;
                  currentAisleOccupied.occupied = 0;
                  passenger.state = WAITING; //WAITING, when no blockage for WINDOW seat
                }
              }
              else { // no luggage, not blocked by middle or aisle
                passenger.location.row = row+1;
                passenger.location.col = col;
                currentAisleOccupied.occupied = 0;
                passenger.state = WAITING; //TBC what to do when no blockage, middle seat???
              }
            }
          }

          else if (passenger.target.row-row==-3) { //left wing, window seat, no luggage
            if (seatsOccupied[col].includes(10)) { // no luggage, blocked by aisle seat
              if (seatsOccupied[col].includes(9)) { // blocked by middle also
                passenger.seatmovecount+=1;

                if (passenger.seatmovecount==windowmovetime3+1) { // WAITS  for movement in/out
                  passenger.location.row = row-1;
                  passenger.location.col = col;
                  currentAisleOccupied.occupied = 0;
                  passenger.state = WAITING; //WAITING, when no blockage for WINDOW seat
                }
              }

              else { // only AISLE
                passenger.seatmovecount+=1;

                if (passenger.seatmovecount==windowmovetime1+1) { // WAITS  for movement in/out
                  passenger.location.row = row-1;
                  passenger.location.col = col;
                  currentAisleOccupied.occupied = 0;
                  passenger.state = WAITING; //WAITING, when no blockage for WINDOW seat
                }
              }

            }
            else { // no luggage, not blocked by aisle seat
              if (seatsOccupied[col].includes(9)) { // no luggage, blocked by middle only
                passenger.seatmovecount+=1;

                if (passenger.seatmovecount==windowmovetime2+1) { // WAITS  for movement in/out
                  passenger.location.row = row-1;
                  passenger.location.col = col;
                  currentAisleOccupied.occupied = 0;
                  passenger.state = WAITING; //WAITING, when no blockage for WINDOW seat
                }
              }
              else { // no luggage, not blocked by middle or aisle
                passenger.location.row = row-1;
                passenger.location.col = col;
                currentAisleOccupied.occupied = 0;
                passenger.state = WAITING; //TBC what to do when no blockage, middle seat???
              }
            }
          }

        }// end of NO LUGGAGE loop

        if (passenger.luggage==1) { // LUGGAGE
          if (passenger.bagwaitcount<bagtime) { // ensure they wait only once
            passenger.bagwaitcount+=1; //
          }
          //console.log(passenger.bagwaitcount);
          if (passenger.bagwaitcount==bagtime) {
            if (Math.abs(passenger.target.row-row)==1) { // left wing AISLE seat, luggage
              passenger.location.col = col;
              passenger.location.row = passenger.target.row;
              currentAisleOccupied.occupied = 0;
              passenger.state = SEATED;
            }

            else if (passenger.target.row-row==2) { //right wing, MIDDLE seat, luggage
              if (seatsOccupied[col].includes(12)) { // luggage, BLOCKED by AISLE seat
                passenger.seatmovecount+=1;

                if (passenger.seatmovecount==midmovetime) { // WAITS  for movement in/out
                  passenger.location.row = row+1;
                  passenger.location.col = col;
                  currentAisleOccupied.occupied = 0;
                  passenger.state = WAITING; //WAITING, when no blockage for MIDDLE seat
                }
              }
              else {
                passenger.location.row = row+1;
                passenger.location.col = col;
                currentAisleOccupied.occupied = 0;
                passenger.state = WAITING; //WAITING, when no blockage for MIDDLE seat
              }
            }

            else if (passenger.target.row-row==-2) { //left wing, middle seat, no luggage
              if (seatsOccupied[col].includes(10)) { // luggage, blocked by aisle seat
                passenger.seatmovecount+=1;

                if (passenger.seatmovecount==midmovetime) { // WAITS  for movement in/out
                  passenger.location.row = row-1;
                  passenger.location.col = col;
                  currentAisleOccupied.occupied = 0;
                  passenger.state = WAITING; //WAITING, when no blockage for MIDDLE seat
                }
              }
              else {
                passenger.location.row = row-1;
                passenger.location.col = col;
                currentAisleOccupied.occupied = 0;
                passenger.state = WAITING; //TBC what to do when no blockage, middle seat???
              }
            }

            else if (passenger.target.row-row==3) { //right wing, window seat, no luggage
              if (seatsOccupied[col].includes(12)) { // luggage, BLOCK by AISLE seat
                if (seatsOccupied[col].includes(13)) { // BLOCK by MIDDLE also
                  passenger.seatmovecount+=1;

                  if (passenger.seatmovecount==windowmovetime3) { // WAITS  for movement in/out
                    passenger.location.row = row+1;
                    passenger.location.col = col;
                    currentAisleOccupied.occupied = 0;
                    passenger.state = WAITING; //WAITING, when no blockage for WINDOW seat
                  }
                }

                else { // only AISLE, not MIDDLE
                  passenger.seatmovecount+=1;

                  if (passenger.seatmovecount==windowmovetime1) { // WAITS  for movement in/out
                    passenger.location.row = row+1;
                    passenger.location.col = col;
                    currentAisleOccupied.occupied = 0;
                    passenger.state = WAITING; //WAITING, when no blockage for WINDOW seat
                  }
                }
              }
              else { // LUGGAGE, not blocked by aisle seat
                if (seatsOccupied[col].includes(13)) { // luggage, BLOCK by MIDDLE only
                  passenger.seatmovecount+=1;

                  if (passenger.seatmovecount==windowmovetime2) { // WAITS  for movement in/out
                    passenger.location.row = row+1;
                    passenger.location.col = col;
                    currentAisleOccupied.occupied = 0;
                    passenger.state = WAITING; //WAITING, when no blockage for WINDOW seat
                  }
                }
                else { // LUGGAGE, not blocked by middle or aisle
                  passenger.location.row = row+1;
                  passenger.location.col = col;
                  currentAisleOccupied.occupied = 0;
                  passenger.state = WAITING; //TBC what to do when no blockage, middle seat???
                }
              }
            }

            else if (passenger.target.row-row==-3) { //left wing, window seat, luggage
              if (seatsOccupied[col].includes(10)) { // no luggage, blocked by aisle seat
                if (seatsOccupied[col].includes(9)) { // blocked by middle also
                  passenger.seatmovecount+=1;

                  if (passenger.seatmovecount==windowmovetime3) { // WAITS  for movement in/out
                    passenger.location.row = row-1;
                    passenger.location.col = col;
                    currentAisleOccupied.occupied = 0;
                    passenger.state = WAITING; //WAITING, when no blockage for WINDOW seat
                  }
                }

                else { // only AISLE
                  passenger.seatmovecount+=1;

                  if (passenger.seatmovecount==windowmovetime1) { // WAITS  for movement in/out
                    passenger.location.row = row-1;
                    passenger.location.col = col;
                    currentAisleOccupied.occupied = 0;
                    passenger.state = WAITING; //WAITING, when no blockage for WINDOW seat
                  }
                }

              }
              else { // LUGGAGE, not blocked by aisle seat
                if (seatsOccupied[col].includes(9)) { // no luggage, blocked by middle only
                  passenger.seatmovecount+=1;

                  if (passenger.seatmovecount==windowmovetime2+1) { // WAITS  for movement in/out
                    passenger.location.row = row-1;
                    passenger.location.col = col;
                    currentAisleOccupied.occupied = 0;
                    passenger.state = WAITING; //WAITING, when no blockage for WINDOW seat
                  }
                }
                else { // LUGGAGE, not blocked by middle or aisle
                  passenger.location.row = row-1;
                  passenger.location.col = col;
                  currentAisleOccupied.occupied = 0;
                  passenger.state = WAITING; //TBC what to do when no blockage, middle seat???
                }
              }
            }
          }
        }// end of LUGGAGE loop
    }
      else if (nextAisleOccupied.occupied==0) { // hasn't reached AISLE
        currentAisleOccupied.occupied = 0;
        nextAisleOccupied.occupied = 1;
        passenger.location.col = col + 1;
        passenger.location.row = row;
    }
      break;

    case WAITING:

      if (Math.abs(passenger.target.row - row) == 1) { // MIDDLE seat
        passenger.location.row = passenger.target.row;
        passenger.location.col = col;
        passenger.state = SEATED;
      }

      else if (passenger.target.row - row == 2) { // WINDOW seat
        passenger.location.row = row + 1;
        passenger.location.col = col;
        passenger.state = WAITING;
      }

      else if (passenger.target.row - row == -2) { // WINDOW seat
        passenger.location.row = row - 1;
        passenger.location.col = col;
        passenger.state = WAITING;
      }
      break;
  }
}

function updateDynamicAgents(){
	// loop over all the agents and update their states
  updateSurface();
  seatFull = 0;
	for (var passengerIndex in passengers){
		updatePassenger(passengerIndex);
	};
};

var record = [];
var sumo = 0; // to compute average time

function isCompleted() {

	if (seatFullCheck[seatFullCheck.length-1] == 180) {
		isRunning = false;
		record.push(statistics[0].cumulativeValue);

    statistics[3].cumulativeValue=record.length; // Increment # sim runs
    statistics[2].cumulativeValue = 0;
    sumo = 0;
    for (var i = 0; i < record.length; i++) {
      sumo += record[i];
    }
    statistics[2].cumulativeValue = sumo / record.length;

    if (record.length == n) {
      updateSurface();
    };

    if (record.length < n) {
			Reload();
			isRunning = true;

      // FOR AVERAGE TIME, RETURN AVERAGE OF RECORD!!
		};
	}
};



function simStep(){
	//This function is called by a timer; if running, it executes one simulation step
	//The timing interval is set in the page initialization function near the top of this file
	if (isRunning){ //the isRunning variable is toggled by toggleSimStep
		// Increment current time (for computing statistics)
		// If necessary, new passengers are added to screen
		addPassengers();
		// In the next function we update each passenger location
		updateDynamicAgents();
		isCompleted();

		seatFullCheck.push(seatFull)
		statistics[0].cumulativeValue+=2.27; //increment current time
    statistics[1].cumulativeValue+=2.27; //increment grand total time

	}
};

// We need a function to start and pause the the simulation.
function toggleSimStep(){
	//this function is called by a click event on the html page.
	// Search BasicAgentModel.html to find where it is called.
	isRunning = !isRunning;
	//console.log(seatFullCheck[seatFullCheck.length-1] == 180);
	//console.log(seatFullCheck);
	//console.log(seatFull);
	//console.log(record);
	//console.log("isRunning: "+isRunning);
};

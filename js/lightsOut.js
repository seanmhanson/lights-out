var volume = true;
var music = true;
var $drone = $('#drone');
var $song = $('#song');
var songEvent;
var songIsPlaying = false;

var square = function(){
	var x = 0;
	var y = 0; 
	var height = 100;

	function publicSetHeight(val){
		height = val;
	}

	function publicGetCoords(){
		return [ 	[x, y],
					[x + height, y],
					[x + height, y + height],
					[x, y + height]];
	}

	function publicSetXY(valx, valy){
		x = valx;
		y = valy;
	}

	function publicInit(valx, valy, height){
		publicSetXY(valx, valy);
		publicSetHeight(height);
	}

	function publicToString(){
		coords = publicGetCoords();
		coordString = "[";
		for (pair of coords){
			coordString += "[" + pair + "], ";
		}
		coordString = coordString.substring(0, coordString.length - 2) + "]";
		return coordString;
	}

	function publicGetPathstring(){
		coords = publicGetCoords();
		pathstring = "M";
		for (pair of coords){
			pathstring += pair[0];
			pathstring += ",";
			pathstring += pair[1];
			pathstring += "L"
		}
		pathstring = pathstring.substring(0, pathstring.length - 1) + "Z";
		return pathstring;
	}

	return {
		setHeight: publicSetHeight,
		getCoords: publicGetCoords,
		toString: publicToString,
		setXY: publicSetXY,
		init: publicInit,
		getPathstring : publicGetPathstring	
	};
}();

var lightsOut = function(){
	var ROWS = 5;
	var COLS = ROWS;
	var clickToggle = 0;

	PAPER_WIDTH = $("#raphael-container").width();
	GUTTER_RATIO = .1;
	var UNIT_WIDTH = PAPER_WIDTH/(ROWS + ROWS*GUTTER_RATIO + GUTTER_RATIO);
	var GUTTER_WIDTH = UNIT_WIDTH*GUTTER_RATIO;
	delete PAPER_WIDTH;
	delete	GUTTER_RATIO;
	
	var UNIT_COLOR = "#1495ff";
	var STROKE_COLOR = "#1495ff";
	var OFF_OPACITY = ".25";
	var ON_OPACITY = ".65";

	var paper = Raphael("raphael-container", "100%", "100%");
	var grid = [];
	var gameOn = true;
	var activeSquares = 0;

	var updateCount = function(int){
		activeSquares += int;
		$("#counter").html(activeSquares);
	};

	var checkWin = function(){
		if(activeSquares == 0 && gameOn == true){
			alert("You win!");
			publicResetGame();
		}
	};

	var findNeighbors = function(x, y, grid){
		toCheck = [[x-1, y], [x, y-1], [x, y+1], [x+1, y]];
		neighbors = [];

		for (var i=0; i<toCheck.length; i++){
			if ((toCheck[i][0]>=0 && 
				toCheck[i][0]< COLS) &&
				(toCheck[i][1]>=0 &&
				toCheck[i][1]< ROWS)){
					neighbors.push(grid[toCheck[i][1]][toCheck[i][0]]);
			}
		};

		return neighbors;
	};

	var toggleSquare = function(square){
		if (volume){
			clickToggle = (clickToggle + 1) % 5;
			document.getElementById('smallClick'+clickToggle).play();
		}
		if (square.data("active")){
				square.data("active", false);
				square.attr({"fill-opacity": OFF_OPACITY});
				updateCount(-1);
			} else {
				square.data('active', true);
				square.attr({"fill-opacity": ON_OPACITY});
				updateCount(1);
			};

			for (var i=0; i<square.data("neighbors").length; i++){
				working_sq = square.data("neighbors")[i];
				if (working_sq.data("active")){
				working_sq.data("active", false);
				working_sq.attr({"fill-opacity": OFF_OPACITY});
				updateCount(-1);
				}else{
					working_sq.data('active', true);
					working_sq.attr({"fill-opacity": ON_OPACITY});
					updateCount(1);
				};
			};
			checkWin();
	};

	var makeSquare = function(pathstring, valX, valY){
		var sq = paper.path(pathstring);
		sq.node.setAttribute('class', 'square');
		sq.attr({fill: UNIT_COLOR});
		sq.attr({stroke: STROKE_COLOR});
		sq.attr({"fill-opacity": OFF_OPACITY});
		sq.data("x", valX);
		sq.data("y", valY);
		sq.data("active", false);

		sq.attr({cursor: "pointer"}).mouseup(function(e){
			toggleSquare(this);
		});
		return sq;
	};

	var drawBoard = function(){
		for (var i=0; i<ROWS; i++){
			x_offset = GUTTER_WIDTH;
			y_offset = GUTTER_WIDTH*(i+1) + UNIT_WIDTH*(i);
			gridRow = [];

			for (var j=0; j<ROWS; j++){
				square.init(x_offset, y_offset, UNIT_WIDTH);
				pathstring = square.getPathstring();
				var sq = makeSquare(pathstring, j, i);
				gridRow[j] = sq;
				x_offset += UNIT_WIDTH + GUTTER_WIDTH;
			}
			grid[i] = gridRow;
		};

		for (i=0; i<grid.length; i++){
			for (j=0; j<grid[i].length; j++){
				grid[i][j].data('neighbors', findNeighbors(j,i,grid));
			}
		};
	};

	var publicResetGame = function(){
		gameOn = false;
		toggleVolume = false;
		if (volume){
			toggleVolume = true;
			volume = false
		}
		for (var i=0; i<grid.length; i++){
			for (var j=0; j<grid[i].length; j++){
				if (Math.floor((Math.random() * 2)) == 1){
					console.log("Toggled square "+i,j)
					toggleSquare(grid[i][j]);
				}else{
					console.log("Didn't toggle square "+i,j)
				}
			}
		}
		if (toggleVolume){
			volume = true;
		}
		gameOn = true;
	};

	drawBoard();
	publicResetGame();

	return {resetGame : publicResetGame}
}();

$(document).ready( function (){
	$(".loading-icon").fadeOut(500, function(){
		startMusic(true);
		document.getElementById('intro').play();
		$(".overlay-text").fadeIn(3000, function(){
			$('.overlay-subtext').fadeIn(3000, 
				function(){setTimeout(function(){
					document.getElementById('lightswitch').play();
					document.getElementById('intro').pause();
					$('.overlay').hide();
				}, 2000)
			});
		});
	});
});

$(document).on("click", ".volume-control", function(){
	if (volume){
		$(".volume-control i").removeClass('fa-volume-up').addClass('fa-volume-off');
		volume = false;
	} else {
		$(".volume-control i").removeClass('fa-volume-off').addClass('fa-volume-up');
		volume = true;
	}
}).on("click", ".reset-control", function(){
	$('#reset-icon').addClass('spin');
	lightsOut.resetGame();
	setTimeout( function(){
		$('#reset-icon').removeClass('spin');
	}, 500);
}).on("click", ".music-control", function(){
	if (music){
		$('.music-control i').addClass('disabled');
		music = false;
		stopMusic();
	} else {
		$('.music-control i').removeClass('disabled');
		music = true;
		startMusic(false);
	}
});

var startMusic = function(intro){
	$drone.on('ended', function(){
		this.currentTime = 0;
		this.play();
	});
	$song.on('ended', function(){
		songIsPlaying = false;
		this.currentTime = 0;
		setSongTimeout();
	});

	if (intro){
		$drone.currentTime = 0;
		$drone.get(0).volume = .4;
		$drone.get(0).play();
	} else {
		$drone.get(0).volume = 0;
		$drone.get(0).play();
		$drone.animate({volume: .4}, 1000);
	}
	if (songIsPlaying){
		$song.get(0).volume = 0;
		$song.get(0).play();
		$song.animate({volume: .04}, 1000);
	} else {
		setSongTimeout();
	}
};

var setSongTimeout = function(){
	songEvent = setTimeout(function(){
		songIsPlaying = true;
		$song.currentTime = 0;
		$song.get(0).volume = .04;
		$song.get(0).play();
		}, Math.floor((Math.random() * 15) + 31)*1000)
};

var stopMusic = function(){
	$drone.animate({volume: 0}, 500);
	$song.animate({volume: 0}, 500);
	clearTimeout(songEvent)
	setTimeout(function(){
		$drone.get(0).pause();
		$song.get(0).pause();
	}, 500);
};
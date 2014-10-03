function WatchApp(_parentMap, _coord) {
	AppCircle.call(this, "WatchApp", _parentMap);
	this.coord = _coord;
	this.color = "black";
}
WatchApp.prototype = new AppCircle();
WatchApp.prototype.constructor = WatchApp;

WatchApp.prototype.makeApp = function(appBox) {

	var group = document.createElementNS("http://www.w3.org/2000/svg", "g");
	group.setAttribute("x", appBox[0]);
	group.setAttribute("y", appBox[1]);
	group.setAttribute("width", appBox[2]);
	group.setAttribute("height", appBox[3]);

	this.app = group;

	var background = document.createElementNS("http://www.w3.org/2000/svg", "rect");
	background.setAttribute("fill", "black");
	background.setAttribute("x", appBox[0]);
	background.setAttribute("y", appBox[1]);
	background.setAttribute("width", appBox[2]);
	background.setAttribute("height", appBox[3]);
	group.appendChild(background);

	this.center = [appBox[0] + appBox[2]/2, appBox[1] + appBox[3]/2];
	this.radius = appBox[2] * 0.45;

	var ticktocks = this.drawTicks();
	group.appendChild(ticktocks);


	this.addStyleTag();

	var hourHand = this.drawHourHand();
	hourHand.setAttribute("class", "watch-hand hour");
	group.appendChild(hourHand);

	var minHand = this.drawMinuteHand();
	minHand.setAttribute("class", "watch-hand minute");
	group.appendChild(minHand);
	

	var secHand = this.drawSecondHand();
	secHand.setAttribute("class", "watch-hand second");
	group.appendChild(secHand);

	
	return group;
}

WatchApp.prototype.drawSecondHand = function() {
	var secondHandPinRadius = 0.02 * this.radius;
	var secondHandStrokeWidth = 0.02 * this.radius;
	var secondHand = document.createElementNS("http://www.w3.org/2000/svg", "g");

	var mainHandStart = [this.center[0], this.center[1] - secondHandPinRadius];
	var mainHandMove = [0, - this.radius + secondHandPinRadius];
	var mainHand = this.drawLine(mainHandStart, mainHandMove, secondHandStrokeWidth, "orange");

	var tailStart = [this.center[0], this.center[1] + secondHandPinRadius];
	var tailMove = [0, 0.03];
	var tail = this.drawLine(tailStart, tailMove, secondHandStrokeWidth, "orange");

	var pin = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	pin.setAttribute("stroke-width", secondHandStrokeWidth/2);
	pin.setAttribute("stroke", "orange");
	pin.setAttribute("cx", this.center[0]);
	pin.setAttribute("cy", this.center[1]);
	pin.setAttribute("r", secondHandPinRadius);

	secondHand.appendChild(pin);
	secondHand.appendChild(mainHand);
	secondHand.appendChild(tail);
	secondHand.setAttribute("opacity", 0.7);
	return secondHand;
}

WatchApp.prototype.drawMinuteHand = function() {
	var minuteHandPinRadius = 0.03 * this.radius;
	var minuteHand = document.createElementNS("http://www.w3.org/2000/svg", "g");

	var thinHandStrokeWidth = 0.02 * this.radius;
	var thinHandStart = [this.center[0], this.center[1] - minuteHandPinRadius];
	var thinHandMove = [0, - this.radius * 0.2 + minuteHandPinRadius];
	var thinHand = this.drawLine(thinHandStart, thinHandMove, thinHandStrokeWidth, "white");

	var thickHandStrokeWidth = 0.07 * this.radius;
	var thickHandStart = [this.center[0], this.center[1] - this.radius * 0.2 + minuteHandPinRadius];
	var thickHandMove = [0, - this.radius * 0.78 + minuteHandPinRadius];
	var thickHand = this.drawLine(thickHandStart, thickHandMove, thickHandStrokeWidth, "white");

	var pin = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	pin.setAttribute("stroke-width", thinHandStrokeWidth);
	pin.setAttribute("stroke", "white");
	pin.setAttribute("cx", this.center[0]);
	pin.setAttribute("cy", this.center[1]);
	pin.setAttribute("r", minuteHandPinRadius);

	minuteHand.appendChild(pin);
	minuteHand.appendChild(thinHand);
	minuteHand.appendChild(thickHand);
	return minuteHand;
}

WatchApp.prototype.drawHourHand = function() {
	var hourHandPinRadius = 0.03 * this.radius;
	var hourHand = document.createElementNS("http://www.w3.org/2000/svg", "g");

	var thinHandStrokeWidth = 0.02 * this.radius;
	var thinHandStart = [this.center[0], this.center[1] - hourHandPinRadius];
	var thinHandMove = [0, - this.radius * 0.2 + hourHandPinRadius];
	var thinHand = this.drawLine(thinHandStart, thinHandMove, thinHandStrokeWidth, "white");

	var thickHandStrokeWidth = 0.07 * this.radius;
	var thickHandStart = [this.center[0], this.center[1] - this.radius * 0.2 + hourHandPinRadius];
	var thickHandMove = [0, - this.radius * 0.5 + hourHandPinRadius];
	var thickHand = this.drawLine(thickHandStart, thickHandMove, thickHandStrokeWidth, "white");

	var pin = document.createElementNS("http://www.w3.org/2000/svg", "circle");
	pin.setAttribute("stroke-width", thinHandStrokeWidth);
	pin.setAttribute("stroke", "white");
	pin.setAttribute("cx", this.center[0]);
	pin.setAttribute("cy", this.center[1]);
	pin.setAttribute("r", hourHandPinRadius);

	hourHand.appendChild(pin);
	hourHand.appendChild(thinHand);
	hourHand.appendChild(thickHand);
	return hourHand;
}

WatchApp.prototype.addStyleTag = function() {
	var now = new Date();
	var sec = now.getSeconds();
	var min = now.getMinutes();
	var hour = now.getHours();

	var secAngle = sec * 6;
	var minAngle = min * 6 + secAngle / 60;
	var hourAngle = hour * 30 + minAngle / 12;

	var secondStyle = ".second {" + 
		"-webkit-animation: sec-spin 60s linear 0s infinite normal;" +
		"-moz-animation: sec-spin 60s linear 0s infinite normal;" +
		"-ms-animation: sec-spin 60s linear 0s infinite normal;" +
		"-o-animation: sec-spin 60s linear 0s infinite normal;" +
		"animation: sec-spin 60s linear 0s infinite normal;" +
		"transform: rotate({secAngle}deg); } \n" +

		"@-webkit-keyframes sec-spin { " +
		"0% { transform: rotate({secAngle}deg); } " +
		"100% { transform: rotate({secAngle360}deg); } } \n";
	var re = new RegExp("{secAngle}", 'g');
	secondStyle = secondStyle.replace(re, secAngle);
	secondStyle = secondStyle.replace("{secAngle360}", secAngle + 360);

	var minuteStyle = ".minute {" + 
		"-webkit-animation: min-spin 3600s linear 0s infinite normal;" +
		"-moz-animation: min-spin 3600s linear 0s infinite normal;" +
		"-ms-animation: min-spin 3600s linear 0s infinite normal;" +
		"-o-animation: min-spin 3600s linear 0s infinite normal;" +
		"animation: min-spin 3600s linear 0s infinite normal;" +
		"transform: rotate({minAngle}deg); } \n" +

		"@-webkit-keyframes min-spin { " +
		"0% { transform: rotate({minAngle}deg); } " +
		"100% { transform: rotate({minAngle360}deg); } } \n";
	re = new RegExp("{minAngle}", 'g');
	minuteStyle = minuteStyle.replace(re, minAngle);
	minuteStyle = minuteStyle.replace("{minAngle360}", minAngle + 360);

	var hourStyle = ".hour {" + 
		"-webkit-animation: hour-spin 43200s linear 0s infinite normal;" +
		"-moz-animation: hour-spin 43200s linear 0s infinite normal;" +
		"-ms-animation: hour-spin 43200s linear 0s infinite normal;" +
		"-o-animation: hour-spin 43200s linear 0s infinite normal;" +
		"animation: hour-spin 43200s linear 0s infinite normal;" +
		"transform: rotate({hourAngle}deg); } \n" +

		"@-webkit-keyframes hour-spin {" +
		"0% { transform: rotate({hourAngle}deg); }" +
		"100% { transform: rotate({hourAngle360}deg); } } \n";
	re = new RegExp("{hourAngle}", 'g');
	hourStyle = hourStyle.replace(re, hourAngle);
	hourStyle = hourStyle.replace("{minAngle360}", hourAngle + 360);

	var style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = secondStyle + minuteStyle + hourStyle;
	document.getElementsByTagName('head')[0].appendChild(style);
}
WatchApp.prototype.drawTicks = function() {
	var origin = this.center;
	var radius = this.radius
	var group = document.createElementNS("http://www.w3.org/2000/svg", "g");
	group.setAttribute("id", "ticktocks");
	for (var i = 0; i < 60; i++) {
		var angle = i * 6;
		if (i % 5 == 0) {
			var tock = this.drawLine([origin[0],origin[1]-radius], [0, 0.05*radius], 0.006, "gray");
			tock.setAttribute("transform", "rotate("+angle+" "+origin.join(" ")+")");
			group.appendChild(tock);
		}
		var tick = this.drawLine([origin[0],origin[1]-radius], [0, 0.03*radius], 0.004, "gray");
		tick.setAttribute("transform", "rotate("+angle+" "+origin.join(" ")+")");
		group.appendChild(tick);
	}
	return group;
}

// Math addition: http://cwestblog.com/2012/11/12/javascript-degree-and-radian-conversion/
Math.radians = function(degrees) {
  return degrees * Math.PI / 180;
};
Math.degrees = function(radians) {
  return radians * 180 / Math.PI;
};

WatchApp.prototype.drawLine = function(startPoint, lineTo, lineWidth, color) {
	if (color == undefined || color == null) color = "white";
	if (lineWidth == undefined || lineWidth == null) lineWidth = 0.004;
	var line = document.createElementNS("http://www.w3.org/2000/svg", "path");
	var d = "M" + startPoint.join(" ") + " l " + lineTo.join(" ");
	line.setAttribute("stroke-width", lineWidth);
	line.setAttribute("stroke-linecap", "round");
	line.setAttribute("stroke", color);
	line.setAttribute("fill", "none");
	line.setAttribute("d", d);
	return line;
}
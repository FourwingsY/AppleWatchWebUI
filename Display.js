function Display(_element, _map) {
	this.width = 375;
	this.height = 470;
	this.element = _element;
	this.map = _map;
	if (_map) {
		this.currentCenter = _map.origin;
		this.currentCenterCandidates = [this.currentCenter, this.currentCenter];
	}

	this.interactionEnabled = true;
	this.runningApp = null;
	this.lastViewBox = null;

	// scale : 좌표상의 1을 몇 픽셀로 그릴 것인가
	this.scale = 100;
	this.maxScale = 100;
	this.minScale = 60;
	this.defaultRadius = 0.125;
}

Display.prototype = {
	constructor: Display,
	
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	// Draw Functions
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	draw: function() {
		for (var app in this.map.apps) {
			var circle = this.map.apps[app];
			if (circle.icon == null) {
				// debugger;
				continue;
			}
			this.element.appendChild(circle.icon);
		}
		this.setDisplayCenter(this.currentCenter.getPosition());
		this.refresh();
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	// Functions For DragModule
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	canMoveViewBoxTo: function(dx, dy) {
		if (this.interactionEnabled === false) {
			console.log("what?>:");
			return false;
		}
		var nearApps = this.currentCenter.getNearApps();

		var idx = this.moveToCoordIdx(dx, dy);
		if (nearApps[idx] === undefined) return false;
		if (nearApps[idx].isSentinel()) return false;
		return true;
	},

	moveToCoordIdx: function(dx, dy) {
		var overSqrt3 = 1 / Math.sqrt(3);
		var gradient = dy/dx;
		if (dx === 0) {
			if (dy > 0) return 1;
			else return 4;
		}
		var idx = 0;
		if (gradient <= -overSqrt3) idx = 5;
		else if (gradient > overSqrt3) idx = 1;
		else idx = 0;

		if (dx < 0) idx = (idx + 3) % 6;
		return idx;
	},

	moveViewBox: function(dx, dy) {
		var viewBox = this._getViewBox();
		var newViewBox = [viewBox[0]+dx/this.scale, viewBox[1]+dy/this.scale, viewBox[2], viewBox[3]];
		this._setViewBox(newViewBox);
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	// Functions For ZoomModule
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	getScale: function() {
		return this.scale;
	},
	setScale: function(newScale) {
		if (this.interactionEnabled === false || this.zoomEnabled === false) return;
		this.scale = newScale;
		var centerPos = this.getDisplayCenter();
		var newViewBox = [centerPos[0] - this.width / this.scale / 2, centerPos[1] - this.height / this.scale / 2, this.width/this.scale, this.height/this.scale];
		this._setViewBox(newViewBox);
		this.refresh();
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	// Functions For ClickModule
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */

	clicked: function(target, pos) {
		if (this.interactionEnabled === false) return;

		var viewBox = this._getViewBox();
		var clickedPos = [viewBox[0] + pos[0] / this.scale, viewBox[1] + pos[1] / this.scale];
		var clickedCoord = this.getCoordFromPos(clickedPos);
		var clickedCircle = this.getCircleAtCoord(clickedCoord);

		// crown clicked
		if (target != this.element) {
			if (this.runningApp !== null) {
				this.closeApp();
			} else {
				var origin = this.getCircleAtCoord([0,0]);
				this.snapCenterTo(origin);
			}
			return;
		}

		// Display Clicked
		if (this.runningApp === null && clickedCircle == this.currentCenter) {
			this.openApp(clickedCircle);
			return;
		}
		if (clickedCircle.isSentinel() || clickedCircle === undefined) {
			var nearCircle = this.getNearCircle(clickedPos);
			if (nearCircle == this.currentCenter) {
				currentAnimationModule.reset();
				currentAnimationModule = null;
				return;
			}
			clickedCircle = nearCircle;
		}
		
		this.snapCenterTo(clickedCircle);
	},

	getNearCircle: function(pos) {
		var centerPos = this.currentCenter.getPosition();
		var diff = Utility.subCoord(centerPos, pos);

		for (var r = 0; r < 1; r += 0.05) {
			var guessPos = Utility.sumCoord(pos, [diff[0] * r, diff[1] * r]);
			var guessCoord = this.getCoordFromPos(guessPos);
			var guessCircle = this.getCircleAtCoord(guessCoord);
			if (guessCircle.isSentinel() || guessCircle === undefined) continue;
			else return guessCircle;
		}
		return this.currentCenter;
	},

	snapCenter: function() {
		this.snapCenterTo(this.currentCenter);
	},

	snapCenterTo: function(circle) {
		if (circle.isSentinel()) return;
		this.interactionEnabled = false;
		start = null;
		startState = null;
		window.requestAnimationFrame(this.snapAnimation.bind(this, circle));

	},

	snapAnimation: function(circle, timestamp) {
		// Start State
		if (startState === null) startState = this._getViewBox();
		// Goals
		var circlePos = circle.getPosition();
		var x = circlePos[0] - this.width / this.scale / 2;
		var y = circlePos[1] - this.height / this.scale / 2;

		if (start === null) start = timestamp;
		if (animationTime === 0) {
			var centerPos = this.currentCenter.getPosition();
			animationTime = Utility.getDist(centerPos, circlePos) * 400;
			if (animationTime === 0) animationTime = 400;
		}
		progress = (timestamp - start) / animationTime;

		// 변화될 상태 계산
		var newViewBox = Utility.interpolation(progress, 1, 0, [x, y], startState.slice(0,2));
		newViewBox = newViewBox.concat(startState.slice(2,4));

		this._setViewBox(newViewBox);
		this.refresh();

		if (progress < 1) {
			window.requestAnimationFrame(this.snapAnimation.bind(this, circle));
		} else {
			this.currentCenter = circle;
			this.interactionEnabled = true;
			animationTime = 0;
			// 클릭 이벤트리스너 복구
			if (currentAnimationModule != null)
				currentAnimationModule.reset();
		}
	},

	openApp: function(circle) {
		start = null;
		this.interactionEnabled = false;

		var embeddedApp = document.createElement("embed");
		embeddedApp.src = circle.getAppAddr();
		embeddedApp.style.width = "100%";
		embeddedApp.style.height = "100%";
		document.getElementById("runningApp").appendChild(embeddedApp);

		var circlePos = circle.getPosition();
		var appWidth = (circle.iconType == IconType.ANIMATE) ? circle.radius * 2 : circle.radius * 1.2;
		var endViewBox = [circlePos[0] - appWidth/2, circlePos[1] - appWidth/2 * 470 / 375, appWidth, appWidth * 470 / 375];	
		

		this.runningApp = circle;
		var runningApp = document.querySelector("#runningApp");
		runningApp.style.width = "100%";
		runningApp.style.height = "100%";
		runningApp.style.opacity = "0";

		var appStartWidth = circle.radius*2 / this._getViewBox()[2] * this.element.clientWidth;
		var appStartHeight = circle.radius*2 / this._getViewBox()[2] * this.element.clientHeight;
		this.lastViewBox = this._getViewBox();
		var animations = [
			{
				"element":this.element,
				"start":{"viewBox":this._getViewBox()},
				"end":{"viewBox":endViewBox}
			}
		]
		var elementLtwh = [this.element.offsetLeft, this.element.offsetTop, this.element.clientWidth, this.element.clientHeight];
		var elementCenter = [Math.ceil(elementLtwh[0] + elementLtwh[2]/2), Math.ceil(elementLtwh[1] + elementLtwh[3]/2)];

		var animation = function(timestamp) {
			var progress;
			if (start === null) {
				start = timestamp;
				// embeddedApp.className="app-open app-open-end";
			}
			progress = (timestamp - start) / 1000;

			// 처음과 끝이 정해져있는 애니메이션들
			for (var i = 0; i < animations.length; i++) {
				var definedMotion = animations[i];
				animateElement(definedMotion.element, definedMotion.start, definedMotion.end, progress);
			}

			// 그때그때 계산해서 맞춰야 하는 애니메이션들
			var width = appWidth * elementLtwh[2] / this._getViewBox()[2];

			var scale = width / elementLtwh[2];

			runningApp.style.opacity = progress;
			runningApp.style.transform = "scale("+scale+","+scale+")";
			runningApp.style.webkitTransform = "scale("+scale+","+scale+")";
			
			
			if (progress < 1)
				window.requestAnimationFrame(animation);
			if (progress >= 1) {
				this.interactionEnabled = true;
				currentAnimationModule.reset();
			}
		}.bind(this)

		window.requestAnimationFrame(animation);
	},
	closeApp: function() {
		start = null;

		var circle = this.runningApp;
		var circlePos = circle.getPosition();
		var radius = circle.radius;
		var startViewBox = this._getViewBox();
		var appWidth = (circle.iconType == IconType.ANIMATE) ? circle.radius * 2 : circle.radius * 1.2;
		var endViewBox = this.lastViewBox;

		var appDisplay = document.querySelector("#runningApp");

		var animations = [
			{
				"element":this.element,
				"start":{"viewBox":startViewBox},
				"end":{"viewBox":endViewBox}
			}
		]

		var elementLtwh = [this.element.offsetLeft, this.element.offsetTop, this.element.clientWidth, this.element.clientHeight];

		var animation = function(timestamp) {
			var progress;
			if (start === null) {
				start = timestamp;
			}
			progress = (timestamp - start) / 1000;
			console.log(progress);

			// 처음과 끝이 정해져있는 애니메이션들
			for (var i = 0; i < animations.length; i++) {
				var definedMotion = animations[i];
				animateElement(definedMotion.element, definedMotion.start, definedMotion.end, progress);
			}

			// 그때그때 계산해서 맞춰야 하는 애니메이션들
			var scale = appWidth / this._getViewBox()[2];

			runningApp.style.opacity = 1 - progress;
			runningApp.style.transform = "scale("+scale+","+scale+")"
			runningApp.style.webkitTransform = "scale("+scale+","+scale+")";
			
			if (progress < 1)
				window.requestAnimationFrame(animation);
			if (progress >= 1) {
				while (appDisplay.firstChild) {
					appDisplay.removeChild(appDisplay.firstChild);
				}
				appDisplay.removeAttribute("style");
				appDisplay.style.width = 0;
				appDisplay.style.height = 0;
				this.interactionEnabled = true;
				this.runningApp = null;
				currentAnimationModule.reset();
			}
		}.bind(this)

		window.requestAnimationFrame(animation);
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	// Refresh Functions
	// Refresh about ONLY circles radius / position
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	refresh: function() {
		this._refreshCenter();
		this._refreshCircles();
	},

	_refreshCenter: function() {
		var circleAtCenter = this.getCircleAtCenterOfDisplay();
		this.currentCenter = circleAtCenter;
		var candidatesForCenter = this.getCandidatesForCenter();
		this.setCandidatesForCenter(candidatesForCenter);
	},

	_refreshCircles: function() {
		this._resizeAllCircles();
		this._tunePositions();
	},

	_resizeAllCircles: function() {
		for (var coord in this.map.apps) {
			var circle = this.getCircleAtCoord(coord);
			var zoomInRadius = this.triangleInterpolation(circle, this.currentCenter, this.currentCenterCandidates[0], this.currentCenterCandidates[1], this._getRadius.bind(this));
			var zoomOutRadius = this.triangleInterpolation(circle, this.currentCenter, this.currentCenterCandidates[0], this.currentCenterCandidates[1], this._getZoomOutRadius.bind(this));
			var newRadius = Utility.interpolation(this.scale, this.maxScale, this.minScale, zoomInRadius, zoomOutRadius);
			circle.setRadius(newRadius);
		}
	},

	_getRadius: function(circle, psudoCenter) {
		var radiusData = {
			"0,0": 0.46,
			"0,2": 0.37,
			"1,1": 0.42,
			"1,3": 0.125,
			"2,0": 0.42,
			"2,2": 0.32,
			"3,1": 0.32,
			"3,3": 0.125,
			"4,0": 0.125,
			"4,2": 0.125,
			"5,1": 0.2
		};

		var coordDiff = Utility.subCoord(psudoCenter.coord, circle.coord);
		var key = Math.abs(coordDiff[0])+","+Math.abs(coordDiff[1]);
		var radius = radiusData[key] || this.defaultRadius;

		return radius;
	},

	_getZoomOutRadius: function(circle, psudoCenter) {
		var circlePos = circle.getPosition();
		var dist = circle.getDistanceFrom(psudoCenter);

		return Math.max(0.45 - 0.07 * dist, this.defaultRadius);
	},

	_tunePositions: function() {
		for (var coord in this.map.apps) {
			var circle = this.getCircleAtCoord(coord);
			var circlePos = circle.getPosition();
			var zoomInTuneDistance = this.triangleInterpolation(circle, this.currentCenter, this.currentCenterCandidates[0], this.currentCenterCandidates[1], this._getTuneDistance.bind(this));
			var zoomOutTuneDistance = [0,0];
			var tuneDistance = Utility.interpolation(this.scale, this.maxScale, this.minScale, zoomInTuneDistance, zoomOutTuneDistance);
			circle.tunePosition(tuneDistance);
		}
	},

	_getTuneDistance: function(circle, psudoCenter) {
		var tuneData = {
			"6,0": [-0.3, 0],
			"6,2": [-0.4, -0.14],
			"5,1": [-0.3, 0],
			"5,3": [-0.4, -0.14],
			"4,0": [-0.3, 0],
			"4,2": [-0.4, -0.14],
			"4,4": [-0.05, -0.1],
			"3,1": [-0.14, -0.05],
			"3,3": [-0.2, -0.1],
			"2,2": [-0.05, -0.1],
			"2,4": [-0.05, -0.1],
			"1,3": [0.03, -0.4],
			"0,4": [0.03, -0.4]
		};

		var sub = Utility.subCoord(circle.coord, psudoCenter.coord);
		var key = Math.abs(sub[0])+","+Math.abs(sub[1]);
		
		var tuneValue = tuneData[key] || [0,0];
		tuneValue = tuneValue.slice(0);
		if (sub[0] < 0) tuneValue[0] = -tuneValue[0];
		if (sub[1] < 0) tuneValue[1] = -tuneValue[1];

		return tuneValue;
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	// ViewBox Functions
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	getDisplayCenter: function() {
		var viewBox = this._getViewBox();
		var width = viewBox[2];
		var height = viewBox[3];
		var center = [viewBox[0] + width/2, viewBox[1] + height/2];

		return center;
	},
	setDisplayCenter: function(pos) {
		var viewBox = this._getViewBox();
		var width = viewBox[2];
		var height = viewBox[3];
		var newViewBox = [pos[0] - width/2, pos[1] - height/2, width, height];
		this._setViewBox(newViewBox);
	},
	_getViewBox: function() {
		var ltwh = this.element.getAttribute("viewBox").split(" ");
		return ltwh.map(function(str){return parseFloat(str);});
	},
	_setViewBox: function(newViewBox) {
		// var curViewBox = this._getViewBox();
		// var move = [newViewBox[0] - curViewBox[0], newViewBox[1] - curViewBox[1]];
		// var idx = this.moveToCoordIdx(move[0], move[1]);
		// this.movingDir = idx;
		this.element.setAttribute("viewBox", newViewBox.join(" "));
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	// get Center
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	getCircleAtCenterOfDisplay: function() {
		var centerPos = this.getDisplayCenter();
		var coord = this.getCoordFromPos(centerPos);
		var centerCircle = this.getCircleAtCoord(coord);
		return centerCircle;
	},

	getCoordFromPos: function(pos) {
		var x = Math.round(pos[0]*2);
		var y = Math.round(pos[1]*2/Math.sqrt(3));

		if ((Math.abs(x) + Math.abs(y)) % 2 !== 0) {
			if (Math.abs(x+1 - pos[0]) < Math.abs(x-1+pos[0]))
				x = x + 1;
			else x = x - 1;
		}
		return [x, y];
	},
	getCircleAtCoord: function(coord) {
		var result = "";
		if (typeof coord == "string") result = this.map.apps[coord];
		else result = this.map.apps[coord.toString()];

		return result;
	},

	// Candidates Functions
	getCandidatesForCenter: function() {
		var centerPos = this.getDisplayCenter();
		var curCenterCirclePos = this.currentCenter.getPosition();
		var sub = Utility.subCoord(centerPos, curCenterCirclePos);
		var dir = this.moveToCoordIdx(sub[0], sub[1]);
		var candidates = this.currentCenter.getNearAppsWithDir(dir);

		candidates.sort(function(c1, c2) {
			var c1Pos = c1.getPosition();
			var c2Pos = c2.getPosition();
			return Utility.getDist(centerPos, c1Pos) - Utility.getDist(centerPos, c2Pos);
		});

		return candidates.slice(0,2);
	},
	setCandidatesForCenter: function(newCenterCandidates) {
		this.currentCenterCandidates = newCenterCandidates;
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	// Utility Functions
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	triangleInterpolation: function(c, c1, c2, c3, func) {
	
		var p = this.getDisplayCenter();
		var x = c1.getPosition();
		var y = c2.getPosition();
		var z = c3.getPosition();
		var vx = func(c, c1);
		var vy = func(c, c2);
		var vz = func(c, c3);

		if (typeof vx == "number") {
			vx = [vx];
			vy = [vy];
			vz = [vz];
		}

		var w = [];
		for (var i = 0; i < vx.length; i++) {
			var det = x[0]*y[1]-y[0]*x[1]+y[0]*z[1]-z[0]*y[1]+z[0]*x[1]-x[0]*z[1];
			if (det === 0) {
				if (vx.length == 1)
					return vx[0];
				else return vx;
			}
			var A = ((y[1]-z[1])*vx[i]+(z[1]-x[1])*vy[i]+(x[1]-y[1])*vz[i]) / det;
			var B = ((z[0]-y[0])*vx[i]+(x[0]-z[0])*vy[i]+(y[0]-x[0])*vz[i]) / det;
			var C = ((y[0]*z[1]-z[0]*y[1])*vx[i]+(z[0]*x[1]-x[0]*z[1])*vy[i]+(x[0]*y[1]-y[0]*x[1])*vz[i]) / det;
			w.push(A*p[0]+B*p[1]+C);
		}

		if (w.length == 1) return w[0];
		return w;
	}
};
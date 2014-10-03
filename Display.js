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
	this.dragEnabled = true;
	this.zoomEnabled = true;
	this.clickEnabled = true;

	this.runningApp = null;

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
			var element = this._drawCircle(circle);
			circle.element = element;
		}
		this.setDisplayCenter(this.currentCenter.getPosition());
		this.refresh();
	},
	_drawCircle: function(circle) {
		var eCircle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
		var circlePos = circle.getPosition();
		eCircle.setAttribute("key", circle.appName);
		eCircle.setAttribute("cx", circlePos[0]);
		eCircle.setAttribute("cy", circlePos[1]);
		eCircle.setAttribute("r", circle.radius);
		eCircle.setAttribute("fill", circle.color);
		// eCircle.addEventListener("click", this.clickCircle.bind(this, circle));
		
		this.element.appendChild(eCircle);

		// var eText = document.createElementNS("http://www.w3.org/2000/svg", "text");
		// eText.textContent = circle.coord.toString();
		// eText.setAttribute("x", circlePos[0]-0.3);
		// eText.setAttribute("y", circlePos[1]);
		// eText.setAttribute("font-size", 0.2);
		// eText.setAttribute("fill", "red");
		// this.element.appendChild(eText);
		return eCircle;
	},

	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	// Functions For DragModule
	/* * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * * */
	canMoveViewBoxTo: function(dx, dy) {
		if (this.interactionEnabled === false || this.dragEnabled === false) return false;

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

	clicked: function(pos) {
		var viewBox = this._getViewBox();
		var clickedPos = [viewBox[0] + pos[0] / this.scale, viewBox[1] + pos[1] / this.scale];
		var clickedCoord = this.getCoordFromPos(clickedPos);
		var clickedCircle = this.getCircleAtCoord(clickedCoord);

		// appRect가 나타난 시점에서는 scale이 의미가 없어지므로 clickedCircle을 판별할 수 없음.
		// 따라서 runningApp을 먼저 검사하고 clickedCircle을 체크하는 로직의 순서로 갈 수밖에 없음.
		if (this.interactionEnabled === false || this.clickEnabled === false) return;
		if (this.runningApp !== null) {
			this.closeApp();
			return;
		}
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
			start = null;
			startState = null;
			this.interactionEnabled = true;
			animationTime = 0;
			// 클릭 이벤트리스너 복구
			if (currentAnimationModule != null)
				currentAnimationModule.reset();
			// circle.element.addEventListener("click", this.clickCircle.bind(this, circle));
		}
	},

	openApp: function(circle) {
		this.interactionEnabled = false;

		var width = 0.6 * 2 * circle.radius;
		var height = 0.75 * 2 * circle.radius;
		var circleCenter = circle.getTunedPosition();

		var appBox = [circleCenter[0] - width/2, circleCenter[1] - height/2, width, height];
		var eRect = circle.makeApp(appBox);
		
		this.element.appendChild(eRect);

		window.requestAnimationFrame(this.openAppAnimation.bind(this, eRect));
	},

	openAppAnimation: function(appRect, timestamp) {
		var progress;
		if (start === null) start = timestamp;
		progress = (timestamp - start) / 2000;

		// Start State
		if (startState === null) startState = this._getViewBox();
		// Goals
		var x = appRect.getAttribute("x");
		var y = appRect.getAttribute("y");
		var w = appRect.getAttribute("width");
		var h = appRect.getAttribute("height");

		// 변화될 상태 계산
		var newViewBox = Utility.interpolation(progress, 1, 0, [x,y,w,h], startState);
		this._setViewBox(newViewBox);
		appRect.setAttribute("opacity", progress);

		if (progress < 1) {
			window.requestAnimationFrame(this.openAppAnimation.bind(this, appRect));
		} else {
			start = null;
			startState = null;
			this.interactionEnabled = true;
			this.dragEnabled = false;
			this.zoomEnabled = false;
			if (currentAnimationModule !== null)
				currentAnimationModule.reset();
			this.runningApp = appRect;
		}
	}, 

	closeApp: function() {
		this.interactionEnabled = false;
		this.refresh();
		window.requestAnimationFrame(this.closeAppAnimation.bind(this, this.runningApp));
		this.setCandidatesForCenter(this.getCandidatesForCenter());
	}, 

	closeAppAnimation: function(appRect, timestamp) {
		var progress;
		if (start === null) start = timestamp;
		progress = (timestamp - start) / 2000;

		// Start State
		if (startState === null) startState = this._getViewBox();
		// Goals
		var centerPos = this.currentCenter.getPosition();
		var goal = [centerPos[0] - this.width / this.scale / 2, centerPos[1] - this.height / this.scale / 2, this.width/this.scale, this.height/this.scale];

		// 변화될 상태 계산
		var newViewBox = Utility.interpolation(progress, 1, 0, goal, startState);
		this._setViewBox(newViewBox);
		appRect.setAttribute("opacity", 1-progress);

		if (progress < 1) {
			window.requestAnimationFrame(this.closeAppAnimation.bind(this, appRect));
		} else {
			start = null;
			startState = null;
			this.element.removeChild(appRect);
			this.interactionEnabled = true;
			this.zoomEnabled = true;
			this.dragEnabled = true;
			this.runningApp = null;
			if (currentAnimationModule !== null)
				currentAnimationModule.reset();
		}
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
function AppCircle(_name, _parentMap) {
	this.parentMap = _parentMap;
	this.element = undefined;
	this.appName = _name;
	// this.app = this.makeApp();
	this.radius = 0.33;
	this.coord = [];
	this.color = this.getRandomColor();
}

AppCircle.prototype = {
	constructor: AppCircle,
	nearCoords: [[2,0], [1,1], [-1,1], [-2, 0], [-1, -1], [1, -1]],
	getNearApps: function() {
		var nearAppList = [];
		for (var i = 0; i < 6; i++) {
			var nearCoord = Utility.sumCoord(this.coord, this.nearCoords[i]);
			var nearApp = this.parentMap.getApp(nearCoord);

			nearAppList.push(nearApp);
		}
		return nearAppList;
	},
	getNearAppsWithDir: function (dir) {
		var nearAppsWithDir = [];
		var first = (dir - 1 < 0) ? 5 : (dir - 1);
		var last = (dir + 1 >=6 ) ? 0 : (dir + 1);

		var nearApps = this.getNearApps();

		nearAppsWithDir.push(nearApps[first]);
		nearAppsWithDir.push(nearApps[dir]);
		nearAppsWithDir.push(nearApps[last]);

		return nearAppsWithDir;
	},
	getPosition: function() {
		var x = this.coord[0] / 2;
		var y = this.coord[1] * Math.sqrt(3) / 2;
		return [x, y];
	},
	getTunedPosition: function() {
		var x = this.element.getAttribute("cx");
		var y = this.element.getAttribute("cy");
		return [x, y];
	},
	tunePosition: function(tuneValue) {
		var pos = this.getPosition();
		var x = pos[0] + tuneValue[0];
		var y = pos[1] + tuneValue[1];
		this.element.setAttribute("cx", x);
		this.element.setAttribute("cy", y);
	},
	getDistanceFrom: function(anotherCircle) {
		var sub = Utility.subCoord(this.coord, anotherCircle.coord);
		if (Math.abs(sub[0]) > Math.abs(sub[1])) {
			return (Math.abs(sub[0]) + Math.abs(sub[1])) / 2;
		}
		else return Math.abs(sub[1]);
	},
	setRadius: function(newRad) {
		// if (this.radius - newRad > 0.1) debugger;
		this.radius = newRad;
		this.element.setAttribute("r", newRad);
	},
	makeApp: function(appBox) {
		var appRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
		appRect.setAttribute("fill", this.getRandomColor());
		appRect.setAttribute("opacity", 0);
		appRect.setAttribute("x", appBox[0]);
		appRect.setAttribute("y", appBox[1]);
		appRect.setAttribute("width", appBox[2]);
		appRect.setAttribute("height", appBox[3]);
		return appRect;
	},
	// http://stackoverflow.com/a/1484514
	getRandomColor: function() {
		var letters = '0123456789ABCDEF'.split('');
		var color = '#';
		for (var i = 0; i < 6; i++ ) {
			color += letters[Math.floor(Math.random() * 16)];
		}
		// avoid too-dark color
		var count = 0;
		for (var i = 1; i <= 3; i++) {
			if (color[i] < '4')
				count ++;
		}
		if (count == 3) return this.getRandomColor()
		return color;
	},
	isSentinel: function() {
		return false;
	}
}

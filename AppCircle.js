function AppCircle(_name, _iconType) {
	this.appName = _name;
	this.radius = 50;
	this.coord = [];
	this.parentMap = undefined;

	this.backgroundColor = this.getRandomColor();
	this.iconType = _iconType;
	this.icon = this.makeIcon(_iconType);
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
		var x = this.icon.getAttribute("x") + this.radius;
		var y = this.icon.getAttribute("y") + this.radius;
		return [x, y];
	},
	tunePosition: function(tuneValue) {
		var pos = this.getPosition();
		var x = pos[0] + tuneValue[0];
		var y = pos[1] + tuneValue[1];
		this.icon.setAttribute("x", x - this.radius);
		this.icon.setAttribute("y", y - this.radius);
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
		this.icon.setAttribute("width", newRad*2);
		this.icon.setAttribute("height", newRad*2);
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
	},
	makeIcon: function(iconType) {
		var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
		svg.setAttribute("viewBox", "-50 -50 100 100");
		
		if (iconType !== IconType.ANON)
			svg.id = this.appName + "-icon";

		if (iconType == IconType.ANON) {
			svg.setAttribute("key", "anon-icon");

			var icon = document.createElementNS("http://www.w3.org/2000/svg", "circle");
			icon.setAttribute("cx", 0);
			icon.setAttribute("cy", 0);
			icon.setAttribute("r", 50);
			icon.setAttribute("fill", this.backgroundColor);
			if (this.isSentinel()) {
				icon.setAttribute("fill", "black");
			}
			svg.appendChild(icon)
			
		} else if (iconType == IconType.IMAGE) {
			var imageAddr = "./apps/"+this.appName+"/"+this.appName+"-icon.svg";
			var icon = document.createElementNS("http://www.w3.org/2000/svg", "image");
			icon.setAttributeNS("http://www.w3.org/1999/xlink", "href", imageAddr)
			svg.appendChild(icon)

		} else if (iconType == IconType.ANIMATE) {
			var icon = eval(this.appName+".drawIcon()");
			svg.appendChild(icon);
		}
	
		return svg;
	},
	getAppAddr: function() {
		return "./apps/"+this.appName+"/"+this.appName+".html";
	}
}

function Hexagon(_origin) {
	this.origin = _origin;
	this.origin.parentMap = this;
	this.origin.coord = [0,0];
	this.apps = {
		"0,0": this.origin,
		"2,0": new Sentinel(this, [2,0]),
		"1,1": new Sentinel(this, [1,1]),
		"1,-1": new Sentinel(this, [1,-1]),
		"-1,1": new Sentinel(this, [-1,1]),
		"-1,-1": new Sentinel(this, [-1,-1]),
		"-2,0": new Sentinel(this, [-2,0])
	};
}

Hexagon.prototype = {
	constructor: Hexagon,
	getApp: function(coord) {
		var result = this.apps[coord.toString()];
		return result;
	},
	addApp: function(appName) {
		var newApp = new AppCircle(appName, this);

		var parent = this.origin;
		var dir = Math.floor(Math.random() * 6);
		var nearApps = parent.getNearAppsWithDir(dir);
		
		// 인접 앱이 풀방일 경우 재귀적으로 선택
		while (!this.listContainsSentinel(nearApps)) {
			var ridx = Math.floor(Math.random() * 3);
			var selected = nearApps[ridx];
			
			parent = selected;

			dir = dir + (ridx - 1);
			dir = (dir + 6) % 6;
			nearApps = parent.getNearAppsWithDir(dir);
		}

		// 풀방이지 않은 앱을 찾은 경우
		// newApp에 대한 정보 설정
		newApp.coord = (function(){
			var allNearApps = parent.getNearAppsWithDir(dir);
			var idx = dir + this.indexOfSentinel(allNearApps) - 1;
			idx = (idx + 6) % 6;
			var diff = newApp.nearCoords[idx];
			return Utility.sumCoord(parent.coord, diff);
		}.bind(this)());

		// 주변 Sentinel 설정
		nearApps = newApp.getNearApps();
		for (var i = 0; i < nearApps.length; i++) {
			var nearApp = nearApps[i];
			if (nearApp === undefined) {
				var nearCoord = Utility.sumCoord(newApp.coord, newApp.nearCoords[i]);
				var sentinel = new Sentinel(this, nearCoord);
				this.apps[nearCoord.toString()] = sentinel;
			}
		}

		// Map에 앱 위치 등록
		this.apps[newApp.coord.toString()] = newApp;

	},

	listContainsSentinel: function(list) {
		for (var i = 0; i < list.length; i++) {
			var app = list[i];
			if (app.isSentinel()) return true;
		}
		return false;
	},
	indexOfSentinel: function(list) {
		for (var i = 0; i < list.length; i++) {
			var app = list[i];
			if (app.isSentinel())
				return i;
		}
		return -1;
	}
};
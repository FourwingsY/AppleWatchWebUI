function WatchApp(_parentMap, _coord) {
	AppCircle.call(this, "WatchApp", _parentMap);
	this.coord = _coord;
	this.backgroundColor = "white";
}
WatchApp.prototype = new AppCircle();
WatchApp.prototype.constructor = WatchApp;

WatchApp.prototype.getAppBox = function() {
	var width = this.radius * 2;
	var height = width * 470/375;
	var circleCenter = this.getTunedPosition();

	var appBox = [circleCenter[0] - width/2, circleCenter[1] - height/2, width, height];
	return appBox;
};

WatchApp.prototype.makeIcon = function() {
	return Watch.drawWatch(true);
};
WatchApp.prototype.getAppAddr = function() {
	return "./apps/watch.html";
};
// WatchApp.prototype.appOpenAnimation = {
// 	"from": {
// 		"Display": {
// 			"viewBox": current
// 		},
// 		"App": {
// 			"size": some
// 		}
// 	},
// 	"to": {
// 		"Display": {
// 			"viewBox": appSize
// 		},
// 		"App": {
// 			"size": other
// 		}
// 	}
// }
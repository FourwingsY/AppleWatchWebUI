function Sentinel(_parentMap, _coord) {
	AppCircle.call(this, "sentinel", _parentMap);
	this.coord = _coord;
	this.color = "black";
}

Sentinel.prototype = new AppCircle();
Sentinel.prototype.constructor = Sentinel;
Sentinel.prototype.isSentinel = function() {return true;};
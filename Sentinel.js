function Sentinel(_parentMap, _coord) {
	AppCircle.call(this, "anon", IconType.ANON);
	this.parentMap = _parentMap;
	this.coord = _coord;
	this.backgroundColor = "black";
}

Sentinel.prototype = new AppCircle();
Sentinel.prototype.constructor = Sentinel;
Sentinel.prototype.isSentinel = function() {return true;};
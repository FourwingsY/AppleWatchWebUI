var ZoomModule = function(_display) {
	this.display = _display;
	this.scale = 100;
	this.wheelFunctionCaches = {
		zoom: this.zoom.bind(this)
	};
}

ZoomModule.prototype = {
	constructor: ZoomModule,
	zoom: function(e) {
		if (!this.display.zoomEnabled) return;
		var delta = e.wheelDelta / 120;
		if (this.disableZoomOut && delta < 0 || this.disableZoomIn && delta > 0)
			return;
		this.scale += delta;
		
		if (this.scale >= this.display.maxScale) {
			this.scale = this.display.maxScale;
		} else if (this.scale < this.display.minScale) {
			this.scale = this.display.minScale;
		}
		console.log(this.scale);
		this.display.setScale(this.scale);
	},
	setZoomable: function() {
		this.display.element.addEventListener("mousewheel", this.wheelFunctionCaches.zoom, false);
	},
	// resetZoomable: function() {
	// 	this.display.element.removeEventListener("mousewheel", this.wheelFunctionCaches.zoom, false);
	// }
}
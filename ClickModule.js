function ClickModule(_display, _crown) {
	this.display = _display;
	this.displayElement = _display.element;
	this.crown = _crown;

	this.clickFunctionCaches = {
		open: this.open.bind(this),
		close: this.close.bind(this)
	};
}

ClickModule.prototype = {
	constructor: ClickModule,
	setClickable: function() {
		this.displayElement.addEventListener("mouseup", this.clickFunctionCaches.open);
		this.displayElement.addEventListener("touchend", this.clickFunctionCaches.open);
		this.crown.addEventListener("mouseup", this.clickFunctionCaches.close);
		this.crown.addEventListener("touchend", this.clickFunctionCaches.close);
	},
	open: function(e) {
		console.log("open");
		if (dragFlag == true) return;
		this.displayElement.removeEventListener("mouseup", this.clickFunctionCaches.open);
		this.displayElement.removeEventListener("touchend", this.clickFunctionCaches.open);
		if (currentAnimationModule == null) currentAnimationModule = this;
		var clickedPos = [e.offsetX, e.offsetY];
		if (e.touches != undefined) {
			clickedPos = [e.touches[0].clientX, e.touches[0].clientY];
		}
		
		this.display.clicked(this.displayElement, clickedPos);
	},
	close: function(e) {
		if (dragFlag == true) return;
		this.crown.removeEventListener("mouseup", this.clickFunctionCaches.close);
		this.crown.removeEventListener("touchend", this.clickFunctionCaches.close);
		if (currentAnimationModule == null) currentAnimationModule = this;
		this.display.clicked(this.crown, [0,0]);
	},
	reset: function() {
		this.setClickable();
		currentAnimationModule = null;
	}
}
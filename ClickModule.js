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
		this.displayElement.addEventListener("click", this.clickFunctionCaches.open);
		this.crown.addEventListener("click", this.clickFunctionCaches.close);
	},
	open: function(e) {
		if (dragFlag == true) return;
		this.displayElement.removeEventListener("click", this.clickFunctionCaches.open);
		if (currentAnimationModule == null) currentAnimationModule = this;
		var clickedPos = [e.offsetX, e.offsetY];
		this.display.clicked(this.displayElement, clickedPos);
	},
	close: function(e) {
		if (dragFlag == true) return;
		this.crown.removeEventListener("click", this.clickFunctionCaches.close);
		if (currentAnimationModule == null) currentAnimationModule = this;
		this.display.clicked(this.crown, [0,0]);
	},
	reset: function() {
		this.setClickable();
		currentAnimationModule = null;
	}
}
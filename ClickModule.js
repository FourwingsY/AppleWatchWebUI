function ClickModule(_display) {
	this.display = _display;
	this.displayElement = _display.element;

	this.clickFunctionCaches = {
		click: this.click.bind(this),
	};
}

ClickModule.prototype = {
	constructor: ClickModule,
	setClickable: function() {
		this.displayElement.addEventListener("click", this.clickFunctionCaches.click);
	},
	click: function(e) {
		if (dragFlag == true) return;
		this.displayElement.removeEventListener("click", this.clickFunctionCaches.click);
		if (currentAnimationModule == null) currentAnimationModule = this;
		var clickedPos = [e.offsetX, e.offsetY];
		this.display.clicked(clickedPos);
	},
	reset: function() {
		this.setClickable();
		currentAnimationModule = null;
	}
}
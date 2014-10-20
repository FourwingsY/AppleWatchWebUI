function DragModule(_display) {
	this.lastMousePos = [];
	this.display = _display;
	this.displayElement = _display.element;

	this.dragFunctionCaches = {
		dragging: this.dragging.bind(this),
		noDragging: this.noDragging.bind(this),
		dragStart: this.dragStart.bind(this),
		dragEnd: this.dragEnd.bind(this)
	};
}

DragModule.prototype = {
	constructor: DragModule,
	getMousePos: function(e) {
		var displayRect = this.displayElement.getBoundingClientRect();
		var displayLeft = displayRect.left;
		var displayTop = displayRect.top;
		return [(e.clientX - displayLeft), (e.clientY - displayTop)];
	},
	dragStart: function(e) {
		console.log("dragstart");
		dragFlag = false;
		this.displayElement.addEventListener("mousemove", this.dragFunctionCaches.dragging);
		this.displayElement.addEventListener("touchmove", this.dragFunctionCaches.dragging);
		this.displayElement.addEventListener("mouseout", this.dragFunctionCaches.noDragging);
		this.lastMousePos = this.getMousePos(e);
	},
	dragging: function(e) {
		var mousePos = this.getMousePos(e);
		var mouseDiff = Utility.subCoord(this.lastMousePos, mousePos);
		if (dragFlag == false && Math.max(Math.abs(mouseDiff[0]), Math.abs(mouseDiff[1])) > 2)
			dragFlag = true;
		this.lastMousePos = mousePos;

		if (this.display.canMoveViewBoxTo(mouseDiff[0], mouseDiff[1])) {
			this.display.moveViewBox(mouseDiff[0], mouseDiff[1]);
			this.display.refresh();
		}
	},
	dragEnd: function(e) {
		this.displayElement.removeEventListener("mousemove", this.dragFunctionCaches.dragging);
		this.displayElement.removeEventListener("touchmove", this.dragFunctionCaches.dragging);
		this.displayElement.removeEventListener("mouseout", this.dragFunctionCaches.noDragging);
		if (this.display.interactionEnabled == true && dragFlag == true) {
			this.display.snapCenter();
		}
		dragFlag = false;
	},
	noDragging: function(e) {
		if (Utility.isDescendant(this.displayElement, e.relatedTarget)) return;
		else this.displayElement.removeEventListener("mousemove", this.dragFunctionCaches.dragging);
	},
	setDraggable: function() {
		this.displayElement.addEventListener("mousedown", this.dragFunctionCaches.dragStart);
		this.displayElement.addEventListener("touchstart", this.dragFunctionCaches.dragStart);
		this.displayElement.addEventListener("mouseup", this.dragFunctionCaches.dragEnd);
		this.displayElement.addEventListener("touchend", this.dragFunctionCaches.dragEnd);
		this.displayElement.addEventListener("touchcancel", this.dragFunctionCaches.dragEnd);
	},
	resetDraggable: function() {
		this.displayElement.removeEventListener("mousedown", this.dragFunctionCaches.dragStart);
		this.displayElement.removeEventListener("touchstart", this.dragFunctionCaches.dragStart);
		this.displayElement.removeEventListener("mouseup", this.dragFunctionCaches.dragEnd);
		this.displayElement.removeEventListener("touchend", this.dragFunctionCaches.dragEnd);
		this.displayElement.removeEventListener("touchcancel", this.dragFunctionCaches.dragEnd);
	}
}


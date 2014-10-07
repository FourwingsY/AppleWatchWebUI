DefaultAnimation = {
	openAppAnimation: function(appIcon, app, timestamp) {
		var progress;
		if (start === null) start = timestamp;
		progress = (timestamp - start) / 2000;

		// Start State
		if (startState === null) startState = display._getViewBox();
		// Goals
		var goal = [-187.5,-235,375,470];

		// 변화될 상태 계산
		var newViewBox = Utility.interpolation(progress, 1, 0, [x,y,w,h], startState);
		display._setViewBox(newViewBox);
		app.setAttribute("opacity", progress);

		if (progress < 1) {
			window.requestAnimationFrame(display.openAppAnimation.bind(display, appRect));
		} else {
			start = null;
			startState = null;
			display.interactionEnabled = true;
			display.dragEnabled = false;
			display.zoomEnabled = false;
			if (currentAnimationModule !== null)
				currentAnimationModule.reset();
			display.runningApp = appRect;
		}
	},
	closeAppAnimation: function() {

	}
}
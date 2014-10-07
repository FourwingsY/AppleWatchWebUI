function animateElement(element, startCond, endCond, progress) {
	// 변화될 상태 계산
	var states = {};
	for (option in startCond) {
		var state = Utility.interpolation(progress, 0, 1, startCond[option], endCond[option]);
		if (state instanceof Array)
			state = state.join(" ")
		states[option] = state;
	}
	
	for (option in states) {
		if (option.indexOf("style.") == 0) {
			var validOption = option.substr(6);
			console.log(element);
			console.log(element.style);
			element.style[validOption] = states[option];
		}
		else {
			element.setAttribute(option, states[option]);
		}
	}
}
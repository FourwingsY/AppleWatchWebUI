var Utility = {
	sumCoord: function(coord1, coord2) {
		if (coord2 == undefined) debugger;
		if (coord1.length != coord2.length) return;
		
		var coord = [];
		for (var i = 0; i < coord1.length; i++) {
			coord.push(coord1[i] + coord2[i]);
		}
		return coord;
	},
	subCoord: function(coord1, coord2) {
		if (coord1 == undefined || coord2 == undefined) debugger;
		if (coord1.length != coord2.length) return;
		
		var coord = [];
		for (var i = 0; i < coord1.length; i++) {
			coord.push(coord1[i] - coord2[i]);
		}
		return coord;
	},
	getDist: function(coord1, coord2) {
		var sub = Utility.subCoord(coord1, coord2);
		return Math.sqrt(sub[0]*sub[0]+sub[1]*sub[1]);
	},

	// http://stackoverflow.com/a/2234986
	isDescendant: function(parent, child) {
		if (parent == child) return true;
		var node = child.parentNode;
		while (node != null) {
			if (node == parent) {
				return true;
			}
			node = node.parentNode;
		}
		return false;
	},

	interpolation: function(p, w1, w2, v1, v2) {
		if (p >= w1) {
			return v1;
		} else if (p <= w2) {
			return v2;
		}

		var result = [];
		if (typeof v1 == "number") {
			v1 = [v1];
			v2 = [v2];
		}
		for (var i = 0; i < v1.length; i++) {
			var ratio = Math.abs(w1 - p) / Math.abs(w1 - w2);
			result.push(v2[i] * ratio + v1[i] * (1 - ratio));
		}

		if (v1.length == 1) return result[0];
		return result;
	}
}
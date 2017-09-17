exports.string = function(inString) {
	return ('"' + inString + '"');
}

exports.queryFields = function(array) {
	// Takes in string array of field names, returns parenthetical string for query
	var outString = "(";
	for (var i = 0; i < array.length; i++) {
		if (i < array.length - 1) {
			outString = outString + array[i] + ", ";
		} else {
			outString = outString + array[i] + ")";
		}
	}
	return (outString);
}

exports.queryValues = function(array) {
	// Takes in string array of values, returns them in parenthesis and quotes for query
	var outString = "(";
	for (var i = 0; i < array.length; i++) {
		if (i < array.length - 1) {
			outString = outString + "'" + array[i] + "'" + ", ";
		} else {
			outString = outString + "'" + array[i] + "')";
		}
	}
	return (outString);
}

exports.dateToAge = function(date) {
	console.log(date);
}
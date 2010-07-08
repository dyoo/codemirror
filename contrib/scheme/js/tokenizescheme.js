/* Tokenizer for JavaScript code */

var tokenizeScheme = (function() {

    // Advance the stream until the given character (not preceded by a
    // backslash) is encountered, or the end of the line is reached.
    var nextUntilUnescaped = function(source, end) {
	var escaped = false;
	var next;
	while (!source.endOfLine()) {
	    var next = source.next();
	    if (next == end && !escaped)
		return false;
	    escaped = !escaped && next == "\\";
	}
	return escaped;
    }
    
    
    // Some helper regexps
    var isOperatorChar = /[+\-*&%=<>!?|]/;
    var isHexDigit = /[0-9A-Fa-f]/;
    var isWordChar = /[\w\-\$_]/;
    
    
    var isDelimiterChar = 
	new RegExp("[\\s\\\(\\\)\\\[\\\]\\\{\\\}\\\"\\\,\\\'\\\`\\\;]");






    var START = function(source, setState) {
	function readHexNumber(){
	    source.next(); // skip the 'x'
	    source.nextWhileMatches(isHexDigit);
	    return {type: "number", style: "scheme-number"};
	}

	function readNumber() {
	    if (source.equals("-") || source.equals("+")) {
		source.next();
	    }
	    source.nextWhileMatches(/[0-9]/);
	    if (source.equals("/")) {
		source.next();
		source.nextWhileMatches(/[0-9]/);
	    }
	    else if (source.equals(".")){
		source.next();
		source.nextWhileMatches(/[0-9]/);
	    }
	    if (source.equals("e") || source.equals("E")){
		source.next();
		if (source.equals("-"))
		    source.next();
		source.nextWhileMatches(/[0-9]/);
	    }
	    return {type: "number", style: "scheme-number"};
	}

	// Read a word, look it up in keywords. If not found, it is a
	// variable, otherwise it is a keyword of the type found.
	function readWord() {
	    source.nextWhileMatches(isWordChar);
	    var word = source.get();
	    return {type: "variable", style: "scheme-symbol", content: word};
	}


	function readString(quote) {
	    var endBackSlash = nextUntilUnescaped(source, quote);
	    setState(endBackSlash ? quote : null);
	    return {type: "string", style: "scheme-string"};
	}
	



	// Fetch the next token. Dispatches on first character in the
	// stream, or first two characters when the first is a slash.
	var ch = source.next();
	if (ch == "\"") {
	    return readString(ch);
	}
	else if (isDelimiterChar.test(ch)) {
	    return {type: ch, style: "scheme-punctuation"};
	}
	else if (ch == "0" && (source.equals("x") || source.equals("X"))) {
	    return readHexNumber();
	}
	else if (/[0-9+-]/.test(ch)) {
	    return readNumber();
	}
	else if (ch == ";") {
	    nextUntilUnescaped(source, null);
	    return { type: "comment", style: "scheme-comment"};
	}
	else {
	    return readWord();
	}
    }

    // The external interface to the tokenizer.
    return function(source, startState) {
	return tokenizer(source, startState || START);
    };
})();


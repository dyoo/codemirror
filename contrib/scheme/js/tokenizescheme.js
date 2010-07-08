/* Tokenizer for Scheme code */

var tokenizeScheme = (function() {

    // scanUntilUnescaped: string-stream char -> boolean
    // Advances the stream until the given character (not preceded by a
    // backslash) is encountered.
    // Returns true if we hit end of line without closing.
    // Returns false otherwise.
    var scanUntilUnescaped = function(source, end) {
	var escaped = false;
	while (true) {
	    if (source.endOfLine()) {
		return true;
	    }
	    var next = source.next();
	    if (next == end && !escaped)
		return false;
	    escaped = !escaped && next == "\\";
	}
	return false;
    }
    

    // Advance the stream until endline.
    var scanUntilEndline = function(source, end) {
	while (!source.endOfLine()) {
	    source.next();
	}
    }

    
    // Some helper regexps
    var isHexDigit = /[0-9A-Fa-f]/;
    
    
    var isDelimiterChar = 
	new RegExp("[\\s\\\(\\\)\\\[\\\]\\\{\\\}\\\"\\\,\\\'\\\`\\\;]");

    var isNotDelimiterChar = 
	new RegExp("[^\\s\\\(\\\)\\\[\\\]\\\{\\\}\\\"\\\,\\\'\\\`\\\;]");


    var numberHeader = ("(?:(?:\\d+\\/\\d+)|"+
			(  "(?:(?:\\d+\\.\\d+|\\d+\\.|\\.\\d+)(?:[eE][+\\-]?\\d+)?)|")+
			(  "(?:\\d+(?:[eE][+\\-]?\\d+)?))"));
    var numberPatterns = [
	// complex numbers
	new RegExp("^((?:(?:\\#[ei])?[+\\-]?" + numberHeader +")?"
		   + "(?:[+\\-]" + numberHeader + ")i$)"),
	    /^((?:\#[ei])?[+-]inf.0)$/,
	    /^((?:\#[ei])?[+-]nan.0)$/,
	new RegExp("^((?:\\#[ei])?[+\\-]?" + numberHeader + "$)"),
	new RegExp("^0[xX][0-9A-Fa-f]+$")];
   

    // looksLikeNumber: string -> boolean
    // Returns true if string s looks like a number.
    var looksLikeNumber = function(s) {
	for (var i = 0; i < numberPatterns.length; i++) {
	    if (numberPatterns[i].test(s)) {
		return true;
	    }
	}
	return false;
    };



    var UNCLOSED_STRING = function(source, setState) {
	var isUnclosedString = scanUntilUnescaped(source, '"');
	if (isUnclosedString) {
	    setState(UNCLOSED_STRING);
	} else {
	    setState(START);
	}
	var text = source.get();
	return {type: "string", style: "scheme-string", content: text};
    };



    var START = function(source, setState) {
	var readHexNumber = function(){
	    source.next(); // skip the 'x'
	    source.nextWhileMatches(isHexDigit);
	    return {type: "number", style: "scheme-number"};
	}


	var readNumber = function() {
	    scanSimpleNumber();
	    if (source.equals("-") || source.equals("+")) {
		source.next();
	    }
	    scanSimpleNumber();
	    if (source.equals("i")) {
		source.next();
	    }
	    return {type: "number", style: "scheme-number"};
	}

	// Read a word, look it up in keywords. If not found, it is a
	// variable, otherwise it is a keyword of the type found.
	var readWordOrNumber = function() {
	    source.nextWhileMatches(isNotDelimiterChar);
	    var word = source.get();
	    if (looksLikeNumber(word)) {
		return {type: "number", style: "scheme-number", content: word};
	    } else {
		return {type: "variable", style: "scheme-symbol", content: word};
	    }


	}


	var readString = function(quote) {
	    var isUnclosedString = scanUntilUnescaped(source, quote);
	    if (isUnclosedString) {
		setState(UNCLOSED_STRING);
	    }
	    var word = source.get();
	    return {type: "string", style: "scheme-string", content: word};
	}


	var readPound = function() {
	    var text;
	    // FIXME: handle special things here
	    if (source.equals(";")) {
		source.next();
		text = source.get();
		return {type: text, 
			style:"scheme-symbol",
			content: text};
	    } else {
		text = source.get();

		return {type : "symbol",
			style: "scheme-symbol",
			content: text};
	    }

	};
	
	var readLineComment = function() {
	    scanUntilEndline(source);
	    var text = source.get();
	    return { type: "comment", style: "scheme-comment", content: text};	
	};



	// Fetch the next token. Dispatches on first character in the
	// stream, or first two characters when the first is a slash.
	var ch = source.next();
	if (ch === "#") {
	    return readPound();
	} else if (ch ===';') {
	    return readLineComment();
	} else if (ch === "\"") {
	    return readString(ch);
	} else if (isDelimiterChar.test(ch)) {
	    return {type: ch, style: "scheme-punctuation"};
	} else {
	    return readWordOrNumber();
	}
    }







    var makeTokenizer = function(source, state) {
	// Newlines are always a separate token.
	var isWhiteSpace = function(ch) {
	    // The messy regexp is because IE's regexp matcher is of the
	    // opinion that non-breaking spaces are no whitespace.
	    return ch != "\n" && /^[\s\u00a0]*$/.test(ch);
	}

	var tokenizer = {
	    state: state,

	    take: function(type) {
		if (typeof(type) == "string")
		    type = {style: type, type: type};

		type.content = (type.content || "") + source.get();
		if (!/\n$/.test(type.content))
		    source.nextWhile(isWhiteSpace);
		type.value = type.content + source.get();
		return type;
	    },

	    next: function () {
		if (!source.more()) throw StopIteration;

		var type;
		if (source.equals("\n")) {
		    source.next();
		    var result = this.take("whitespace");
		    return result;
		}
		
		if (source.applies(isWhiteSpace)) {
		    type = "whitespace";
		} else {
		    while (!type) {
			type = tokenizer.state(source, function(s) {
			    tokenizer.state = s;
			});
		    }
		}
		var result = this.take(type);
		return result;
	    }
	};
	return tokenizer;
    };


    // The external interface to the tokenizer.
    return function(source, startState) {
	return makeTokenizer(source, startState || START);
    };
})();

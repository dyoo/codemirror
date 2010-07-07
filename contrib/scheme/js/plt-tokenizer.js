var schemeTokenize = 
    (function() {




    //////////////////////////////////////////////////////////////////////
    // Tokenizer

    // replaceEscapes: string -> string
    var replaceEscapes = function(s) {
	return s.replace(/\\./g, function(match, submatch, index) {
	    switch(match) {
	    case '\\a': return '\a';
	    case '\\b': return '\b';
	    case '\\t': return '\t';
	    case '\\n': return '\n';
	    case '\\v': return '\v';
	    case '\\f': return '\f';
	    case '\\r': return '\r';
	    default:
		return match.substring(1);
	    }
	    // FIXME: add more escape sequences.
	});
    }

    // countNewlines: string -> number
    var newlineRegexp = new RegExp("\n", "g");
    var countNewlines = function(s) {
	return s.length - (s.replace(newlineRegexp, "")).length;
    };


    var lineOfTextRegexp = new RegExp("[^\n]*\n", "g");
    var computeColumn = function(s, col) {
	var stripped = s.replace(lineOfTextRegexp, "");
	if (stripped.length !== s.length) {
	    return stripped.length;
	} else {
	    return s.length + col;
	}
    }


    var nondelimiter = "[^\\s\\\(\\\)\\\[\\\]\\\{\\\}\\\"\\\,\\\'\\\`\\\;]";



    // error tokens have the type "incomplete-pipe-comment, incomplete-string".

    var PATTERNS = [['whitespace' , /^(\s+)/],
		    ['#;', /^([#][;])/],
		    ['comment' , // piped comments
		     new RegExp("^([#][|]"+
				"(?:(?:\\|[^\\#])|[^\\|])*"+
				"[|][#])")],
		    ['comment' , /(^;[^\n]*)/],
		    ['incomplete-pipe-comment', new RegExp("^[#][|]")],  // unclosed pipe comment
		    ['(' , /^(\(|\[|\{)/],
		    [')' , /^(\)|\]|\})/],
		    ['\'' , /^(\')/],
		    ['`' , /^(`)/],
		    [',@' , /^(,@)/],
		    [',' , /^(,)/],
		    ['char', /^\#\\(newline|backspace)/],
		    ['char', /^\#\\(.)/],
		    ['string' , new RegExp("^\"((?:([^\\\\\"]|(\\\\.)))*)\"")],
		    ['incomplete-string', new RegExp("^\"")],      // unclosed string
		    ['symbol-or-number', new RegExp("^(" + nondelimiter + "+)")]

		   ];


    var numberHeader = ("(?:(?:\\d+\\/\\d+)|"+
			(  "(?:(?:\\d+\\.\\d+|\\d+\\.|\\.\\d+)(?:[eE][+\\-]?\\d+)?)|")+
			(  "(?:\\d+(?:[eE][+\\-]?\\d+)?))"));

    var numberPatterns = [['complex' , new RegExp("^((?:(?:\\#[ei])?[+\\-]?" + numberHeader +")?"
						  + "(?:[+\\-]" + numberHeader + ")i$)")],
			  ['number' , /^((?:\#[ei])?[+-]inf.0)$/],
			  ['number' , /^((?:\#[ei])?[+-]nan.0)$/],
			  ['number' , new RegExp("^((?:\\#[ei])?[+\\-]?" + numberHeader + "$)")]];
    



    var tokenize = function(s, source) {
	if (! source) { source = ""; }

	var offset = 0;
	var line = 1;
	var column = 0;
	var tokens = [];
	var shouldContinueLooping = true;
	
	while (shouldContinueLooping) {
	    shouldContinueLooping = false;

	    for (var i = 0; i < PATTERNS.length; i++) {
		var patternName = PATTERNS[i][0];
		var pattern = PATTERNS[i][1];
		var result = s.match(pattern);
		if (result != null) {
		    var wholeMatch = result[0];
		    var tokenText = result[1];

		    switch(patternName) {
		    case "incomplete-string":
		    case "incomplete-pipe-comment":
			tokens.push({type: patternName, 
				     text: tokenText,
				     offset: offset,
				     line: line,
				     column: column,
				     span: wholeMatch.length,
				     source: source});
			break;			


		    case "string":
			tokens.push({type: patternName, 
				     text: replaceEscapes(tokenText),
				     offset: offset,
				     line: line,
				     column: column,
				     span: wholeMatch.length,
				     source: source});
			break;


		    case "symbol-or-number":
			var isNumber = false;
			for (var j = 0; j < numberPatterns.length; j++) {
			    var numberMatch = tokenText.match(numberPatterns[j][1]);
			    if (numberMatch) {
				tokens.push({type: numberPatterns[j][0],
					     text: tokenText,
					     offset: offset,
					     line: line,
					     column: column,
					     span: wholeMatch.length,
					     source: source});

				isNumber = true;
				break;
			    }
			}
			if (! isNumber) {
			    tokens.push({type: "symbol", 
					 text: tokenText,
					 offset: offset,
					 line: line,
					 column: column,
					 span: wholeMatch.length,
					 source: source});
			}
			break;

		    case "whitespace":
			// don't tokenize whitespace
			break;

		    default:
			tokens.push({type: patternName, 
				     text: tokenText,
				     offset: offset,
				     line: line,
				     column: column,
				     span: wholeMatch.length,
				     source: source});
		    }

		    offset = offset + wholeMatch.length;
		    column = computeColumn(wholeMatch, column);
		    line = line + countNewlines(wholeMatch);
		    s = s.substring(wholeMatch.length);


		    shouldContinueLooping = true;
		    break;
		}
	    }
	}
	return tokens;
    };


    return tokenize;
})();
/*
  pltTokenizer: string -> (listof token)

pltTokenizer consumes the string to be tokenized.  It produces


where a token is an object of the form

    { style: token-type,
      value: string }


and a token-type is one of the following strings:

    "#;"
    "comment"
    "("
    ")"
    "'"
    "`"
    ",@"
    ","
    "char"
    "string"
    "symbol"
    "number"
    "incomplete-pipe-comment"
    "incomplete-string"
    "unknown"
*/


var pltTokenizer = (function() {


    //////////////////////////////////////////////////////////////////////
    // Tokenizer


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



    /// error tokens have the type "incomplete-pipe-comment", "incomplete-string", or "unknown";

    var PATTERNS = [['whitespace' , /^(\s+)/],

		    ['#;', /^([#][;])/],
		    ['comment' , // piped comments
		     new RegExp("^([#][|]"+
				"(?:(?:\\|[^\\#])|[^\\|])*"+
				"[|][#])")],
		    ['comment' , /(^;[^\n]*)/],
		    ['incomplete-pipe-comment', new RegExp("^([#][|])")],  // unclosed pipe comment
		    ['(' , /^(\(|\[|\{)/],
		    [')' , /^(\)|\]|\})/],
		    ['\'' , /^(\')/],
		    ['`' , /^(`)/],
		    [',@' , /^(,@)/],
		    [',' , /^(,)/],
		    ['char', /^\#\\(newline|backspace)/],
		    ['char', /^\#\\(.)/],
		    ['string' , new RegExp("^(\"(?:([^\\\\\"]|(\\\\.)))*\")")],
		    ['symbol' , new RegExp("^(\\|(?:([^\\\\\|]|(\\\\.)))*\\|)")],
		    ['incomplete-string', new RegExp("^(\")")],      // unclosed string
		    ['symbol-or-number', new RegExp("^(" + nondelimiter + "+)")],

		    // emergency error production to catch everything else
		    ['unknown', new RegExp("^([^\s]+)")],  

		   ];
    // The set of PATTERNS here should be exhaustive, because whitespace + unknown should
    // catch anything in a string.


    var numberHeader = ("(?:(?:\\d+\\/\\d+)|"+
			(  "(?:(?:\\d+\\.\\d+|\\d+\\.|\\.\\d+)(?:[eE][+\\-]?\\d+)?)|")+
			(  "(?:\\d+(?:[eE][+\\-]?\\d+)?))"));

    var numberPatterns = [
	// complex numbers
	['number' , new RegExp("^((?:(?:\\#[ei])?[+\\-]?" + numberHeader +")?"
			       + "(?:[+\\-]" + numberHeader + ")i$)")],
	['number' , /^((?:\#[ei])?[+-]inf.0)$/],
	['number' , /^((?:\#[ei])?[+-]nan.0)$/],
	['number' , new RegExp("^((?:\\#[ei])?[+\\-]?" + numberHeader + "$)")]];
    


    // tokenize: string -> listof token
    var tokenize = function(s) {
	var tokens = [];
	
	while (s.length > 0) {
	    for (var i = 0; i < PATTERNS.length; i++) {
		var patternName = PATTERNS[i][0];
		var pattern = PATTERNS[i][1];
		var result = s.match(pattern);
		if (result != null) {
		    var wholeMatch = result[0];
		    var tokenText = result[1];

		    switch(patternName) {
		    case "symbol-or-number":
			var isNumber = false;
			for (var j = 0; j < numberPatterns.length; j++) {
			    var numberMatch = tokenText.match(numberPatterns[j][1]);
			    if (numberMatch) {
				tokens.push({ style: numberPatterns[j][0],
					      value: tokenText });

				isNumber = true;
				break;
			    }
			}
			if (! isNumber) {
			    tokens.push({ style: "symbol", 
					  value: tokenText });
			}
			break;

		    default:
			tokens.push({ style: patternName, 
				      value: tokenText });
		    }
		    
		    s = s.substring(wholeMatch.length);


		    break; 	// breaks out of the pattern for loop
		}
	    }
	}
	return tokens;
    };


    return tokenize;
})();
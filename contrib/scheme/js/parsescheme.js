var SchemeParser = Editor.Parser = (function() {
    var startParse = function(source) {

	source = tokenizeScheme(source);	
	var tokenStack = [];



	var indentTo = function(sourceState, previousTokens) {
	    return function(tokenText, currentIndentation, direction) {
		for (var i = 0; i < previousTokens.length; i++) {
		    console.log(previousTokens[i]);
		};
		return currentIndentation;
	    };
	};
	

	var iter = {
	    next: function() {
		var tok = source.next();
		tokenStack.push(tok);
		if (tok.type == "whitespace") {
		    if (tok.value == "\n") {
			tok.indentation = indentTo(source.state, 
						   tokenStack.concat([]));
		    } else {

		    }
		}
		return tok;
	    },

	    copy: function() {
		var _tokenStack = tokenStack.concat([]);
		var _tokenState = source.state;
		return function(_source) {
		    tokenStack = _tokenStack;
		    source = tokenizeScheme(_source, _tokenState);
		    return iter;
		};
	    }
	};
	return iter;
    };
    return { make: startParse };
})();

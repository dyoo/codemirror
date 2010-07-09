var SchemeParser = Editor.Parser = (function() {


    // isLparen: char -> boolean
    var isLparen = function(ch) {
	return ch === '(' || ch === '[' || ch === '{';
    };

    // isRparen: char -> boolean
    var isRparen = function(ch) {
	return ch === ')' || ch === ']' || ch === '}';
    };

    // isMatchingParens: char char -> boolean
    var isMatchingParens = function(lparen, rparen) {
	return ((lparen === '(' && rparen === ')') ||
		(lparen === '[' && rparen === ']') ||
		(lparen === '{' && rparen === '}'));
    };


    // Compute the indentation context enclosing the end of the token
    // sequence tokens.
    // The context is the token sequence of the enclosing s-expression,
    // augmented with column information.
    var getIndentationContext = function(tokens) {
	var pendingParens = [], i, j, column, context;

	// Scan for the start of the indentation context.
	for (i = tokens.length-1; i >= 0; i--) {
	    if (isLparen(tokens[i].type)) {
		if (pendingParens.length === 0) {
		    break;
		} else {
		    if (isMatchingParens(tokens[i].value,
					 pendingParens[pendingParens.length - 1])) {
			pendingParens.pop();
		    } else {
			// Error condition: we see mismatching parens,
			// so we exit with no known indentation context.
			return [];
		    }
		}
	    } else if (isRparen(tokens[i].type))  {
		pendingParens.push(tokens[i].type);
	    }
	}
	// If we scanned backward too far, we couldn't find a context.  Just
	// return the empty context.
	if (i === -1) { return []; }

	// Scan backwards to closest newline to figure out the column
	// number:
	for (j = i; j >= 0; j--) {
	    if(tokens[j].type === 'whitespace' && 
	       tokens[j].value === '\n') {
		break;
	    }
	}
	j++;
	column = 0;
	context = [];
	// Start generating the context, walking forward.
	for (; j < tokens.length; j++) {
	    if (j >= i) {
		context.push({ type: tokens[j].type,
			       value: tokens[j].value,
			       column: column });
	    }

	    if (tokens[j].type === 'whitespace' && 
		tokens[j].value === '\n') {
		column = 0;
	    } else {
		column += tokens[j].value.length;
	    }
	}
	return context;


    };






    // calculateIndentationFromContext: indentation-context number -> number
    var calculateIndentationFromContext = function(context, currentIndentation) {
	if (context.length === 0) {
	    return 0;
	}
 	if (isBeginLikeContext(context)) {
	    return beginLikeIndentation(context);
 	}
	if (isDefineLikeContext(context)) {
	    return defineLikeIndentation(context);
	}
  	if (isLambdaLikeContext(context)) {
	    return lambdaLikeIndentation(context);
  	}

	return defaultIndentation(context);
//	return currentIndentation;
    };

    // scanForward: indentation-context index -> index or -1
    // looks for the first non-whitespace thing, starting from i.
    // If we can't find one, returns -1.
    var scanForward = function(context, i) {
	for(; i < context.length; i++) {
	    if (context[i].type !== 'whitespace')
		return i;
	}
	return -1;
    };


    var scanForwardWithoutNewlines = function(context, i) {
	for(; i < context.length; i++) {
	    if (context[i].type !== 'whitespace')
		return i;
	    if (context[i].type === 'whitespace' && context[i].value === '\n')
		return -1;
	}
	return -1;
    }



    //////////////////////////////////////////////////////////////////////

    var BEGIN_LIKE_KEYWORDS = ["case-lambda", 
			       "compound-unit",
			       "compound-unit/sig",
			       "cond",
			       "delay",
			       "inherit",
			       "match-lambda",
			       "match-lambda*",
			       "override",
			       "private",
			       "public",
			       "sequence",
			       "unit"];

    var isBeginLikeContext = function(context) {
	var j = scanForward(context, 1);
	if (j === -1) { return false; }
	return (/^begin/.test(context[j].value) ||
		isMember(context[j].value, BEGIN_LIKE_KEYWORDS));
    };

    var beginLikeIndentation = function(context) {
	var i = scanForward(context, 1);
	if (i === -1) { return 0; }
	var j = scanForwardWithoutNewlines(context, i+1);
	if (j === -1) { 
	    return context[i].column +1; 
	} else {
	    return context[j].column;
	}
    };



    //////////////////////////////////////////////////////////////////////


    var DEFINE_LIKE_KEYWORDS = ["local"];

    var isDefineLikeContext = function(context) {
	var j = scanForward(context, 1);
	if (j === -1) { return false; }
	return (/^def/.test(context[j].value) ||
		isMember(context[j].value, DEFINE_LIKE_KEYWORDS));
    };


    var defineLikeIndentation = function(context) {
	var i = scanForward(context, 1);
	if (i === -1) { return 0; }
	return context[i].column +1; 
    };

    //////////////////////////////////////////////////////////////////////

    var LAMBDA_LIKE_KEYWORDS = ["cases",
				"instantiate",
				"super-instantiate",
				"syntax/loc",
				"quasisyntax/loc",
				"lambda",
				"let",
				"let*",
				"letrec",
				"recur",
				"lambda/kw",
				"letrec-values",
				"with-syntax",
				"with-continuation-mark",
				"module",
				"match",
				"match-let",
				"match-let*",
				"match-letrec",
				"let/cc",
				"let/ec",
				"letcc",
				"catch",
				"let-syntax",
				"letrec-syntax",
				"fluid-let-syntax",
				"letrec-syntaxes+values",
				"for",
				"for/list",
				"for/hash",
				"for/hasheq",
				"for/and",
				"for/or",
				"for/lists",
				"for/first",
				"for/last",
				"for/fold",
				"for*",
				"for*/list",
				"for*/hash",
				"for*/hasheq",
				"for*/and",
				"for*/or",
				"for*/lists",
				"for*/first",
				"for*/last",
				"for*/fold",
				"kernel-syntax-case",
				"syntax-case",
				"syntax-case*",
				"syntax-rules",
				"syntax-id-rules",
				"let-signature",
				"fluid-let",
				"let-struct",
				"let-macro",
				"let-values",
				"let*-values",
				"case",
				"when",
				"unless",
				"let-enumerate",
				"class",
				"class*",
				"class-asi",
				"class-asi*",
				"class*/names",
				"class100",
				"class100*",
				"class100-asi",
				"class100-asi*",
				"class100*/names",
				"rec",
				"make-object",
				"mixin",
				"define-some",
				"do",
				"opt-lambda",
				"send*",
				"with-method",
				"define-record",
				"catch",
				"shared",
				"unit/sig",
				"unit/lang",
				"with-handlers",
				"interface",
				"parameterize",
				"call-with-input-file",
				"call-with-input-file*",
				"with-input-from-file",
				"with-input-from-port",
				"call-with-output-file",
				"with-output-to-file",
				"with-output-to-port",
				"for-all"];


    var isLambdaLikeContext = function(context) {
	var j = scanForward(context, 1);
	if (j === -1) { return false; }
	return (isMember(context[j].value, LAMBDA_LIKE_KEYWORDS));
    };


    var lambdaLikeIndentation = function(context) {
	var i = scanForward(context, 1);
	if (i === -1) { return 0; }
	var j = scanForward(context, i+1);
	if (j === -1) { 
	    return context[i].column + 4; 
	} else {
	    return context[i].column + 1;
	}
    };





    //////////////////////////////////////////////////////////////////////
    var defaultIndentation = function(context) {
	var i = scanForward(context, 1);
	if (i === -1) { return 0; }
	var j = scanForwardWithoutNewlines(context, i+1);
	if (j === -1) { 
	    return context[i].column; 
	} else {
	    return context[j].column;
	}
    };



    //////////////////////////////////////////////////////////////////////
    // Helpers
    var isMember = function(x, l) {
	for (var i = 0; i < l.length; i++) {
	    if (x === l[i]) { return true; }
	}
	return false;
    };



    //////////////////////////////////////////////////////////////////////





    var startParse = function(source) {
	source = tokenizeScheme(source);	
	var tokenStack = [];



	var indentTo = function(sourceState, previousTokens) {
	    return function(tokenText, currentIndentation, direction) {
		var indentationContext = 
		    getIndentationContext(previousTokens);
		return calculateIndentationFromContext(indentationContext,
						       currentIndentation);		
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

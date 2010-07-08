
var assertTrue = function(aVal) {
    value_of(aVal).should_be_true();
};

var assertFalse = function(aVal) {
    value_of(aVal).should_be_false();
};

var assertEquals = function(expected, aVal) {
    value_of(aVal).should_be(expected);
};

var assertFails = function(thunk) {
    var isFailed = false;
    try {
	thunk();
    } catch (e) {
	isFailed = true;
    }
    value_of(isFailed).should_be_true();
};




describe('simple atoms', {
    'strings': function() {
	assertEquals([{style: 'string',
		       value: "\"hello world\"",
		       }],
		     pltTokenizer("\"hello world\""));

	assertEquals([{style: 'string',
		       value: "\"hello\\n world\"",
		       }],
		     pltTokenizer("\"hello\\n world\""));

    },

    'symbols': function() {
	assertEquals([{style: 'symbol',
		       value: "foo",
		       }],
		     pltTokenizer("foo"));

	
	assertEquals([{style: 'symbol',
		       value: "this-is-a-test",
		       }],
		     pltTokenizer("this-is-a-test"));


	assertEquals([{style: 'symbol',
		       value: "|foo|",
		       }],
		     pltTokenizer("|foo|"));


	assertEquals([{style: 'symbol',
		       value: "|foo bar|",
		       }],
		     pltTokenizer("|foo bar|"));



	assertEquals([{style: 'symbol',
		       value: "|foo\\| bar|",
		       }],
		     pltTokenizer("|foo\\| bar|"));


    },

    'integers': function() {
	assertEquals([{style: 'number',
		       value: "42",
		       }],
		     pltTokenizer("42"));

	assertEquals([{style: 'number',
		       value: "0",
		       }],
		     pltTokenizer("0"));


	assertEquals([{style: 'number',
		       value: "-0",
		       }],
		     pltTokenizer("-0"));



	assertEquals([{style: 'number',
		       value: "-128934",
		       }],
		     pltTokenizer("-128934"));


	assertEquals([{style: 'number',
		       value: "123456789012345678901234567890",
		       }],
		     pltTokenizer("123456789012345678901234567890"));
    },


    'rationals': function() {
	assertEquals([{style: 'number',
		       value: "1/42",
		       }],
		     pltTokenizer("1/42"));

	assertEquals([{style: 'number',
		       value: "-1/42",
		       }],
		     pltTokenizer("-1/42"));
    },


//     'floats': function() {
// 	pltTokenizer("1.234");
//     },
//     'complex': function() {
// 	pltTokenizer("1+2i");
//     }

});


describe("multiple tokens", {
    'number, whitespace, string': function() {
	assertEquals([{style: 'number',
		       value: "1/42",
		      },
		      {style: 'whitespace',
		       value: ' '},
		      {style: 'string',
		       value: "\"is the answer\""}],
		     pltTokenizer("1/42 \"is the answer\""));

    }
});
	 
	 


// describe('incomplete atoms', {
// });
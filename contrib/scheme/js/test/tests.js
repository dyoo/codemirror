
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
	assertEquals([{type: 'string',
		       text: "\"hello world\"",
		       offset: 0,
		       line: 1,
		       column: 0,
		       span: 13}],
		     pltTokenizer("\"hello world\""));

	assertEquals([{type: 'string',
		       text: "\"hello\\n world\"",
		       offset: 0,
		       line: 1,
		       column: 0,
		       span: 15}],
		     pltTokenizer("\"hello\\n world\""));

    },

    'symbols': function() {
	assertEquals([{type: 'symbol',
		       text: "foo",
		       offset: 0,
		       line: 1,
		       column: 0,
		       span: 3}],
		     pltTokenizer("foo"));

	
	assertEquals([{type: 'symbol',
		       text: "this-is-a-test",
		       offset: 0,
		       line: 1,
		       column: 0,
		       span: 14}],
		     pltTokenizer("this-is-a-test"));


	assertEquals([{type: 'symbol',
		       text: "|foo|",
		       offset: 0,
		       line: 1,
		       column: 0,
		       span: 5}],
		     pltTokenizer("|foo|"));


	assertEquals([{type: 'symbol',
		       text: "|foo bar|",
		       offset: 0,
		       line: 1,
		       column: 0,
		       span: 9}],
		     pltTokenizer("|foo bar|"));



	assertEquals([{type: 'symbol',
		       text: "|foo\\| bar|",
		       offset: 0,
		       line: 1,
		       column: 0,
		       span: 11}],
		     pltTokenizer("|foo\\| bar|"));


    },

    'integers': function() {
	assertEquals([{type: 'number',
		       text: "42",
		       offset: 0,
		       line: 1,
		       column: 0,
		       span: 2}],
		     pltTokenizer("42"));

	assertEquals([{type: 'number',
		       text: "0",
		       offset: 0,
		       line: 1,
		       column: 0,
		       span: 1}],
		     pltTokenizer("0"));


	assertEquals([{type: 'number',
		       text: "-0",
		       offset: 0,
		       line: 1,
		       column: 0,
		       span: 2}],
		     pltTokenizer("-0"));



	assertEquals([{type: 'number',
		       text: "-128934",
		       offset: 0,
		       line: 1,
		       column: 0,
		       span: 7}],
		     pltTokenizer("-128934"));


	assertEquals([{type: 'number',
		       text: "123456789012345678901234567890",
		       offset: 0,
		       line: 1,
		       column: 0,
		       span: 30}],
		     pltTokenizer("123456789012345678901234567890"));
    },


    'rationals': function() {
	assertEquals([{type: 'number',
		       text: "1/42",
		       offset: 0,
		       line: 1,
		       column: 0,
		       span: 4}],
		     pltTokenizer("1/42"));

	assertEquals([{type: 'number',
		       text: "-1/42",
		       offset: 0,
		       line: 1,
		       column: 0,
		       span: 5}],
		     pltTokenizer("-1/42"));
    },

//     'floats': function() {
// 	pltTokenizer("1.234");
//     },
//     'complex': function() {
// 	pltTokenizer("1+2i");
//     }

});


// describe('incomplete atoms', {
// });
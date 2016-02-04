/* eslint-env qunit */

function testNiceDateDiff(origDate, newDate, expected) {
	return test('niceDateDiff: ' + origDate + ' - ' + newDate + ' = ' + expected, function() {
		expect(1);
		const date1 = new Date(origDate);
		const date2 = new Date(newDate);

		const actual = RESUtils.niceDateDiff(date1, date2);
		equal(actual, expected, 'RESUtils.niceDateDiff(new Date("' + origDate + '"), new Date("' + newDate + '"));');
	});
}

testNiceDateDiff('Jan 01 2015', 'Jan 02 2015', '1 day');
testNiceDateDiff('Jan 01 2015', 'Jan 03 2015', '2 days');
testNiceDateDiff('Dec 31 2014', 'Jan 01 2015', '1 day');
testNiceDateDiff('Dec 25 2014', 'Jan 01 2015', '7 days');
testNiceDateDiff('Jan 25 2015', 'Feb 01 2015', '7 days');
testNiceDateDiff('Feb 22 2015', 'Mar 01 2015', '7 days');
testNiceDateDiff('Feb 23 2016', 'Mar 01 2016', '7 days');
testNiceDateDiff('Mar 01 2015', 'Apr 01 2015', '1 month');
testNiceDateDiff('Jan 01 2014', 'Jan 01 2015', '1 year');
testNiceDateDiff('Feb 01 2014', 'Feb 01 2015', '1 year');
testNiceDateDiff('Mar 01 2014', 'Mar 01 2015', '1 year');
testNiceDateDiff('Jan 01 2015', 'Jan 01 2016', '1 year');
testNiceDateDiff('Feb 01 2015', 'Feb 01 2016', '1 year');
testNiceDateDiff('Mar 01 2015', 'Mar 01 2016', '1 year');
testNiceDateDiff('Jan 01 2014', 'Jan 02 2015', '1 year and 1 day');
testNiceDateDiff('Mar 31 2015', 'Apr 01 2016', '1 year and 1 day');
testNiceDateDiff('Mar 01 2015', 'Mar 02 2016', '1 year and 1 day');
testNiceDateDiff('Mar 01 2014', 'Apr 01 2015', '1 year and 1 month');
// skip testNiceDateDiff('Mar 31 2014', 'May 01 2015', '1 year, 1 month and 1 day');
testNiceDateDiff('Jan 01 2013', 'Feb 02 2014', '1 year, 1 month and 1 day');
testNiceDateDiff('Apr 01 2014', 'May 02 2015', '1 year, 1 month and 1 day');
testNiceDateDiff('Sep 29 2013', 'Dec 01 2015', '2 years, 2 months and 2 days');

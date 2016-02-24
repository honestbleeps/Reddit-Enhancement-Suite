import 'babel-polyfill';

import test from 'ava';

import { RESUtils } from '../utils';

test('Various date ranges', t => {
	function d(from, to) {
		return RESUtils.niceDateDiff(new Date(from), new Date(to));
	}

	t.is(d('Jan 01 2015', 'Jan 02 2015'), '1 day');
	t.is(d('Jan 01 2015', 'Jan 03 2015'), '2 days');
	t.is(d('Dec 31 2014', 'Jan 01 2015'), '1 day');
	t.is(d('Dec 25 2014', 'Jan 01 2015'), '7 days');
	t.is(d('Jan 25 2015', 'Feb 01 2015'), '7 days');
	t.is(d('Feb 22 2015', 'Mar 01 2015'), '7 days');
	t.is(d('Feb 23 2016', 'Mar 01 2016'), '7 days');
	t.is(d('Mar 01 2015', 'Apr 01 2015'), '1 month');
	t.is(d('Jan 01 2014', 'Jan 01 2015'), '1 year');
	t.is(d('Feb 01 2014', 'Feb 01 2015'), '1 year');
	t.is(d('Mar 01 2014', 'Mar 01 2015'), '1 year');
	t.is(d('Jan 01 2015', 'Jan 01 2016'), '1 year');
	t.is(d('Feb 01 2015', 'Feb 01 2016'), '1 year');
	t.is(d('Mar 01 2015', 'Mar 01 2016'), '1 year');
	t.is(d('Jan 01 2014', 'Jan 02 2015'), '1 year and 1 day');
	t.is(d('Mar 31 2015', 'Apr 01 2016'), '1 year and 1 day');
	t.is(d('Mar 01 2015', 'Mar 02 2016'), '1 year and 1 day');
	t.is(d('Mar 01 2014', 'Apr 01 2015'), '1 year and 1 month');
	t.skip.is(d('Mar 31 2014', 'May 01 2015'), '1 year, 1 month and 1 day');
	t.is(d('Jan 01 2013', 'Feb 02 2014'), '1 year, 1 month and 1 day');
	t.is(d('Apr 01 2014', 'May 02 2015'), '1 year, 1 month and 1 day');
	t.is(d('Sep 29 2013', 'Dec 01 2015'), '2 years, 2 months and 2 days');
});

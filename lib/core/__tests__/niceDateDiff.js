import 'babel-polyfill';
import test from 'ava';
import { RESUtils } from '../utils';

test(t => {
	t.is(RESUtils.niceDateDiff(new Date('Jan 01 2015'), new Date('Jan 02 2015')), '1 day');
	t.is(RESUtils.niceDateDiff(new Date('Jan 01 2015'), new Date('Jan 03 2015')), '2 days');
	t.is(RESUtils.niceDateDiff(new Date('Dec 31 2014'), new Date('Jan 01 2015')), '1 day');
	t.is(RESUtils.niceDateDiff(new Date('Dec 25 2014'), new Date('Jan 01 2015')), '7 days');
	t.is(RESUtils.niceDateDiff(new Date('Jan 25 2015'), new Date('Feb 01 2015')), '7 days');
	t.is(RESUtils.niceDateDiff(new Date('Feb 22 2015'), new Date('Mar 01 2015')), '7 days');
	t.is(RESUtils.niceDateDiff(new Date('Feb 23 2016'), new Date('Mar 01 2016')), '7 days');
	t.is(RESUtils.niceDateDiff(new Date('Mar 01 2015'), new Date('Apr 01 2015')), '1 month');
	t.is(RESUtils.niceDateDiff(new Date('Jan 01 2014'), new Date('Jan 01 2015')), '1 year');
	t.is(RESUtils.niceDateDiff(new Date('Feb 01 2014'), new Date('Feb 01 2015')), '1 year');
	t.is(RESUtils.niceDateDiff(new Date('Mar 01 2014'), new Date('Mar 01 2015')), '1 year');
	t.is(RESUtils.niceDateDiff(new Date('Jan 01 2015'), new Date('Jan 01 2016')), '1 year');
	t.is(RESUtils.niceDateDiff(new Date('Feb 01 2015'), new Date('Feb 01 2016')), '1 year');
	t.is(RESUtils.niceDateDiff(new Date('Mar 01 2015'), new Date('Mar 01 2016')), '1 year');
	t.is(RESUtils.niceDateDiff(new Date('Jan 01 2014'), new Date('Jan 02 2015')), '1 year and 1 day');
	t.is(RESUtils.niceDateDiff(new Date('Mar 31 2015'), new Date('Apr 01 2016')), '1 year and 1 day');
	t.is(RESUtils.niceDateDiff(new Date('Mar 01 2015'), new Date('Mar 02 2016')), '1 year and 1 day');
	t.is(RESUtils.niceDateDiff(new Date('Mar 01 2014'), new Date('Apr 01 2015')), '1 year and 1 month');
	t.skip.is(RESUtils.niceDateDiff(new Date('Mar 31 2014'), new Date('May 01 2015')), '1 year, 1 month and 1 day');
	t.is(RESUtils.niceDateDiff(new Date('Jan 01 2013'), new Date('Feb 02 2014')), '1 year, 1 month and 1 day');
	t.is(RESUtils.niceDateDiff(new Date('Apr 01 2014'), new Date('May 02 2015')), '1 year, 1 month and 1 day');
	t.is(RESUtils.niceDateDiff(new Date('Sep 29 2013'), new Date('Dec 01 2015')), '2 years, 2 months and 2 days');
});

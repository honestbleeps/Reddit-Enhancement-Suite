import { $ } from '../vendor';

export const module = {};

module.moduleID = 'localDate';
module.moduleName = 'Local Date';
module.category = ['My account'];
module.description = 'Shows date in your local time zone when you hover over a relative date.';

module.go = () => {
	$('.sitetable')
		.on('mouseenter', 'time', function() {
			const $this = $(this);
			if (!$this.data('originalTitle')) {
				$this.data('originalTitle', $this.attr('title'));
			}
			$this.attr('title', new Date($this.attr('datetime')));
		})
		.on('mouseleave', 'time', function() {
			const $this = $(this);
			$this.attr('title', $this.data('originalTitle'));
		});
};

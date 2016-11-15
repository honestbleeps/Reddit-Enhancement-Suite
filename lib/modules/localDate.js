import { $ } from '../vendor';

export const module = {};

module.moduleID = 'localDate';
module.moduleName = 'localDateName';
module.category = 'myAccountCategory';
module.description = 'localDateDesc';

module.go = () => {
	$('.sitetable, .side')
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

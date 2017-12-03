/* @flow */

import { BodyClasses } from '../../utils';
import type { BooleanOption, EnumOption } from '../module';
import { all, isRunning } from './modules';

// Adds body classes for modules or enabled options that have `bodyClass: true`
// In the form `res-moduleId-optionKey` for boolean options
// and `res-moduleId-optionKey-optionValue` for enum options
// spaces in enum option values will be replaced with underscores
export function _addModuleBodyClasses() {
	for (const module of all()) {
		if (!isRunning(module)) continue;

		if (module.bodyClass) BodyClasses.add(`res-${module.moduleID}`);

		for (const [optId, opt] of Object.entries(module.options)) {
			if (!(opt.bodyClass && opt.value)) continue;
			// ensure that only boolean and enum options pass this check
			(opt: BooleanOption<any> | EnumOption<any>);

			if (opt.dependsOn && !opt.dependsOn(module.options)) continue;

			let cls = typeof opt.bodyClass === 'string' ?
				opt.bodyClass :
				`res-${module.moduleID}-${optId}`;

			if (opt.type === 'enum') {
				cls += `-${opt.value.replace(/\s/g, '_')}`;
			}

			BodyClasses.add(cls);
		}
	}
}

/* @flow */

import { getLocaleDictionary } from '../../../locales';
import { addListener } from './messaging';

addListener('i18n', locale => getLocaleDictionary(locale));

/* @flow */

import { Alert } from '../utils';
import { addListener } from 'browserEnvironment';

addListener('alert', text => { Alert.open(text); });

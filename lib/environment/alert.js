/* @flow */

import { addListener } from '../../browser';
import { Alert } from '../utils';

addListener('alert', text => { Alert.open(text); });

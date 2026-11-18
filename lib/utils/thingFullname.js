/* @flow */

const thingFullname = /^t\d+_[a-z0-9]+$/i;

export const isValidThingFullname = (fullname: string): boolean => thingFullname.test(fullname);

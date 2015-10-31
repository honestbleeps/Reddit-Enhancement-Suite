// Reddit Enhancement Suite
(function() { // Load everything inside an IIFE closure to avoid leaking

// Declare globals for functions expecting "window" to be the global object
var location       = window.location;
var DOMParser      = window.DOMParser;
var localStorage   = window.localStorage;
var sessionStorage = window.sessionStorage;
var XMLHttpRequest = window.XMLHttpRequest;
var navigator      = window.navigator;
var history 	   = window.history;

// avoid appearing like ES6 environment
var exports = undefined;

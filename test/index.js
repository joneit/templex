'use strict';

/* global describe, it, beforeEach, afterEach */

require('should'); // extends Object with `should`

var fmt = require('../templex.js');

describe('require() returns an object that', function() {
    it('is a function that', function() {
        (typeof fmt).should.equal('function');
    });
});

// templex node module
// https://github.com/joneit/templex

/* eslint-env node, browser */ //to allow refs to `window` in IIFE's call's actual params

(function (module) { // eslint-disable-line no-unused-expressions, strict

    // This closure supports NodeJS-less client side includes with <script> tags. See https://github.com/joneit/mnm.

    /**
     * Merges values of execution context properties named in template by {prop1},
     * {prop2}, etc., or any javascript expression incorporating such prop names.
     * The context always includes the global object. In addition you can specify a single
     * context or an array of contexts to search (in the order given) before finally
     * searching the global context.
     *
     * Merge expressions consisting of simple numeric terms, such as {0}, {1}, etc., deref
     * the first context given, which is assumed to be an array. As a convenience feature,
     * if additional args are given after `template`, `arguments` is unshifted onto the context
     * array, thus making first additional arg available as {1}, second as {2}, etc., as in
     * `templex('Hello, {1}!', 'World')`. ({0} is the template so consider this to be 1-based.)
     *
     * If you prefer something other than braces, redefine `templex.regexp`.
     *
     * See tests for examples.
     *
     * @param {string} template
     * @param {...string} [args]
     */
    function templex(template) {
        var contexts = this instanceof Array ? this : [this];
        if (arguments.length > 1) { contexts.unshift(arguments); }
        return template.replace(templex.regexp, templex.merger.bind(contexts));
    }

    templex.regexp = /\{(.*?)\}/g;

    templex.with = function (i, s) {
        return 'with(this[' + i + ']){' + s + '}';
    };

    templex.cache = [];

    templex.deref = function (key) {
        if (!(this.length in templex.cache)) {
            var code = 'return eval(expr)';

            for (var i = 0; i < this.length; ++i) {
                code = templex.with(i, code);
            }

            templex.cache[this.length] = eval('(function(expr){' + code + '})'); // eslint-disable-line no-eval
        }
        return templex.cache[this.length].call(this, key);
    };

    templex.merger = function (match, key) {
        // Advanced features: Context can be a list of contexts which are searched in order.
        var replacement;

        try {
            replacement = isNaN(key) ? templex.deref.call(this, key) : this[0][key];
        } catch (e) {
            replacement = '{' + key + '}';
        }

        return replacement;
    };

    // this interface consists solely of the templex function object
    module.exports = templex;

})(
    typeof window === 'undefined' ? module : window.module || (window.templex = {}),
    typeof window === 'undefined' ? module.exports : window.module && window.module.exports || (window.templex.exports = {})
) && (
    typeof window === 'undefined' || window.module || (window.templex = window.templex.exports)
);

/* About the above IIFE:
 * This file is a "modified node module." It functions as usual in node; but also functions directly in the browser.
 * The IIFE is superfluous for NodeJs but needed for the browser to maintain privacy for internal declarations.
 * In the browser, you can predefine a `window.module` object and the results will be in `module.exports`.
 * Alternatively, the logic in the actual params will define a `window.templex` object that works correctly regardless
 * of which NodeJs-style export mechanism is used (`module.exports.property = property` vs. `module.exports = api`).
 *
 * About the IIFE's actual params:
 * 1. If `window` object undefined, we're in NodeJs so assume there is a `module` object with an `exports` property
 * 2. If `window` object defined, we're in browser
 * 2.a. If `module` object predefined, use it
 * 2.b. If `module` object undefined, create a `templex` object
 *
 * After the IIFE returns:
 * 1. If `window` object undefined, then we're in NodeJs so we're done
 * 2. If `window` object defined, then we're in browser
 * 2.a. If `module` object predefined, we're done; results are in `moudule.exports`
 * 2.b. If `module` object undefined, redefine`templex` to point to the `templex.exports` object
 */

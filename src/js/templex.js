// templex node module
// https://github.com/joneit/templex

(function (module) { // This closure supports NodeJS-less client side includes with <script> tags. See https://github.com/joneit/mnm.

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
     * See tests for additional examples.
     * @example templex.call({r:192,g:150,b:81}, "background-color: #{(r+256).toString(16).substr(1)}{(r+256).toString(16).substr(1)}{(r+256).toString(16).substr(1)}");
     * @example templex.call({r:192,g:150,b:81,hex2:function(n){return (n+256).toString(16).substr(1)}}, "background-color: #{hex2(r)}{hex2(g)}{hex2(b)}");
     * @example helpers = {hex2:function(n){return (n+256).toString(16).substr(1)}}; templex.call([{r:192,g:150,b:81}, helpers], "background-color: #{(hex2(r)}{(hex2(g)}{(hex2(b)}");
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

            templex.cache[this.length] = eval('(function(expr){' + code + '})');
        }
        return templex.cache[this.length].call(this, key);
    };

    templex.merger = function (match, key) {
        // Advanced features: Context can be a list of contexts which are searched in order.
        var replacement;

        try {
            if (isNaN(key)) {
                replacement = templex.deref.call(this, key);
            } else {
                replacement = this[0][key];
            }
        } catch (e) {
            replacement = '{' + key + '}';
        }

        return replacement;
    };

    // this interface consists solely of the templex function object
    module.exports = templex;

})(
    window.module || (window.templex = {}),
    window.module && window.module.exports || (window.templex.exports = {})
) && (window.module || (window.templex = window.templex.exports));

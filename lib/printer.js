/**
 * @fileoverview Global |this| required for resolving indexes in node.
 * @suppress {globalThis}
 */
(function (global) {
    'use strict';

    //code here
    var printerjobs = require("./printerjobs.js");

    if (typeof module !== "undefined" && module.exports) {
        module.exports = {
            printerjobs: printerjobs
        };
    }

}(this || {}));
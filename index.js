// This is free and unencumbered software released into the public domain.
// See LICENSE.md for more information.

var printer = require("./lib/printer.js");
// console.log(printer.printerjobs)
var printerutil = require("./lib/printerutil.js");


module.exports = {
  Printer: printer.Printer,
  PrinterJobs: printer.printerjobs,
  PrinterUtil: printerutil
};
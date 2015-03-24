//shim
require("document-register-element");

//element setup
var template = require("./_template.html");
var csv = require("csv");
require("./sort-table.less");

var proto = Object.create(HTMLElement.prototype);

proto.createdCallback = function() {
  var table = this.innerHTML.replace(/\r/g, "").split("\n").filter(function(line) { return line.match(/[^,]/) }).join("\n");
  var parsed = [];
  var parser = csv.parse({ columns: true });
  parser.on("data", function(line) { parsed.push(line) });
  parser.write(table);
  parser.end();
};
proto.attachedCallback = function() {};
proto.detachedCallback = function() {};
proto.attributeChangedCallback = function() {};

document.registerElement("sort-table", { prototype: proto });

//shim
require("document-register-element");

//element setup
var template = require("./_template.html");
var csv = require("csv");
require("./sort-table.less");

var proto = Object.create(HTMLElement.prototype);

proto.createdCallback = function() {
  var tableData = this.innerHTML.replace(/^\s+|\r/gm, "").split("\n").filter(function(line) { return line.match(/[^,]/) }).join("\n");
  var parsed = [];
  var parser = csv.parse();
  parser.on("data", function(line) { parsed.push(line) });
  parser.write(tableData);
  parser.end();
  var header = parsed.splice(0,1)[0];
  this.innerHTML = template({header: header, body: parsed});

};
proto.attachedCallback = function() {};
proto.detachedCallback = function() {};
proto.attributeChangedCallback = function() {};
proto.sortTable = function() {

};

document.registerElement("sort-table", { prototype: proto });

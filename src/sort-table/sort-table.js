//shim
require("document-register-element");

//element setup
var template = require("./_template.html");
var csv = require("csv");
require("./sort-table.less");

var proto = Object.create(HTMLElement.prototype);

proto.createdCallback = function() {};
proto.attachedCallback = function() {};
proto.detachedCallback = function() {};
proto.attributeChangedCallback = function() {};

document.registerElement("sort-table", { prototype: proto });
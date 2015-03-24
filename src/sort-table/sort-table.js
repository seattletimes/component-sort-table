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

  if (this.hasAttribute("noheader")) {
    this.innerHTML = template({body: parsed});
  } else {
    var header = parsed.shift();
    this.innerHTML = template({
      header: header, 
      body: parsed
    });
  }

  this.data = {
    header: header,
    rows: parsed,
    sortOrder: 1,
    lastSort: null
  }

  if (this.hasAttribute("sortable")) {
    this.addEventListener("click", function(e) {
      if (e.target.tagName == "TH") {
        this.sortTable(e.target.id);
        e.target.className = "up";
      }
    })
  }
};
proto.attachedCallback = function() {};
proto.detachedCallback = function() {};
proto.attributeChangedCallback = function() {};
proto.sortTable = function(index) {
  if (this.data.lastSort == index) { 
    this.data.sortOrder *= -1;
  } else {
    this.data.lastSort = index;
    this.data.sortOrder = 1;
  }
  var self = this;
  this.data.rows.sort(function(a, b) {
    a = parseInt(a[index]) ? a[index] * -1 : a[index].toLowerCase();
    b = parseInt(b[index]) ? b[index] * -1 : b[index].toLowerCase();
    if (a < b) {
      return -1 * self.data.sortOrder;
    } else if (a > b) {
      return 1 * self.data.sortOrder;
    } else if (a == b) {
      return 0;
    }
  });
  this.innerHTML = template({
    header: this.data.header, 
    body: this.data.rows, 
    lastSort: this.data.lastSort, 
    sortOrder: this.data.sortOrder 
  });
};
proto.data = null;

document.registerElement("sort-table", { prototype: proto });

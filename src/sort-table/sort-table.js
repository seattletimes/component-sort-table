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
  var parser = csv.parse({ auto_parse: true });
  parser.on("data", function(line) { parsed.push(line) });
  parser.write(tableData + "\n"); // apparently csv parser expects a line break at the end of every line?
  parser.end();

  var classes = null;
  if (this.hasAttribute("classes")) {
    // allows user to style specific columns
    // obvious use case: formatting columns for numbers vs. strings
    var classes = this.attributes.classes.value.split(",");
  }

  if (this.hasAttribute("noheader")) {
    this.innerHTML = template({body: parsed});
  } else {
    var header = parsed.shift();
    this.innerHTML = template({
      header: header, 
      body: parsed,
      classes: classes
    });
  }

  this.data = {
    header: header,
    rows: parsed,
    sortOrder: 1,
    lastSort: null,
    classes: classes
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
    a = typeof a[index] == "number" ? a[index] * -1 : a[index].toLowerCase();
    b = typeof b[index] == "number" ? b[index] * -1 : b[index].toLowerCase();
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
    sortOrder: this.data.sortOrder,
    classes: this.data.classes
  });
};
proto.data = null;

document.registerElement("sort-table", { prototype: proto });

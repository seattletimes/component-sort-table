//shim
require("document-register-element");

//element setup
var template = require("./_template.html");
var csv = require("./csv");
require("./sort-table.less");

var proto = Object.create(HTMLElement.prototype);

var parseAttr = function(s) { return !s ? [] : s.split(",") };

proto.createdCallback = function() {
  var tableData = this.innerHTML.replace(/^\s+|\r/gm, "").split("\n").filter(function(line) { return line.match(/[^,]/) }).join("\n");
  var parser = new csv.Parser();
  var parsed = parser.parse(tableData);

  var classes = null;
  if (this.hasAttribute("classes")) {
    // allows user to style specific columns
    // obvious use case: formatting columns for numbers vs. strings
    classes = parseAttr(this.getAttribute("classes"));
  }

  if (this.hasAttribute("sortable")) {
    var sortAttr = parseAttr(this.getAttribute("sortable"));
  }

  if (this.hasAttribute("noheader")) {
    this.innerHTML = template({
      body: parsed,
      classes: classes
    });
  } else {
    var header = parsed.shift();
    var sortable = header.map(function(name) { 
      if (sortAttr) {
        return sortAttr.length ? sortAttr.indexOf(name) > -1 : true
      } else {
        false
      }
    });
    this.innerHTML = template({
      header: header, 
      body: parsed,
      classes: classes,
      sort: sortable
    });
  }

  this.data = {
    header: header,
    rows: parsed,
    sortOrder: 1,
    lastSort: null,
    classes: classes,
    sort: sortable
  }

  if (this.hasAttribute("sortable")) {
    var columns = parseAttr(this.getAttribute("sortable"));

    this.addEventListener("click", function(e) {
      if (e.target.tagName == "TH") {
        if (columns.length) {
          if (columns.indexOf(e.target.innerHTML) > -1) {
            this.sortTable(e.target.id);
            // e.target.className = "up";
          }
        } else {
          this.sortTable(e.target.id);
          // e.target.className = "up";
        }
      }
    });
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
    classes: this.data.classes,
    sort: this.data.sort
  });
};
proto.data = null;

document.registerElement("sort-table", { prototype: proto });

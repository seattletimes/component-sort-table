//shim
require("document-register-element");

//element setup
var template = require("./_template.html");
var csv = require("./csv");
require("./sort-table.less");
var Tabletop = require("./tabletop").Tabletop;

var proto = Object.create(HTMLElement.prototype);

var parseAttr = function(s) { return !s ? [] : s.split(",") };

proto.createdCallback = function() {
  var parsed = [];

  if (this.hasAttribute("sheet")) {
    var sheetId = this.getAttribute("sheet");
    var self = this;
    Tabletop.init({ 
      key: sheetId, 
      callback: function(data, tabletop) {
        var header = [];
        // Tabletop assums you have a header row
        for (var label in data[0]) {
          header.push(label);
        }
        parsed.push(header);
        data.forEach(function(row) {
          var parsedRow = [];
          for (var label in row) {
            parsedRow.push(row[label]);
          }
          parsed.push(parsedRow);
        });
      self.setUp(parsed);
      },
      simpleSheet: true,
      parseNumbers: true
    });
  } else {
    var tableData = this.innerHTML.replace(/^\s+|\r/gm, "").split("\n").filter(function(line) { return line.match(/[^,]/) }).join("\n");
    var parser = new csv.Parser();
    parsed = parser.parse(tableData);
    this.setUp(parsed);
  }

};

proto.attachedCallback = function() {};
proto.detachedCallback = function() {};
proto.attributeChangedCallback = function() {};

proto.setUp = function(parsed) {
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
    this.data = {
      rows: parsed,
      classes: classes
    };
  } else {
    var header = parsed.shift();
    var sortable = header.map(function(name) { 
      if (sortAttr) {
        return sortAttr.length ? sortAttr.indexOf(name) > -1 : true
      } else {
        false
      }
    });
    this.data = {
      header: header,
      rows: parsed,
      classes: classes,
      sort: sortable,
      sortOrder: 1,
      lastSort: null
    };
  }

  this.innerHTML = template(this.data);

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
  this.innerHTML = template(this.data);
};
proto.data = null;

document.registerElement("sort-table", { prototype: proto });

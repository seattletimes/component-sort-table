/*
NPM's CSV parser ends up being 150KB. We don't need quite that much reliability, so let's use something smaller.
*/

var defaults = {
  quote: "\"",
  separator: ",",
  cast: true
};

var Parser = function(options) {
  options = options || {};
  this.options = Object.create(defaults);
  for (var key in options) {
    defaults[key] = options[key];
  }
  this.quoting = false;
};

Parser.prototype = {
  parse: function(data) {
    var lines = data.split(/[\r\n]+/);
    var parsed = lines.map(this.parseLine.bind(this));
    return parsed;
  },
  parseLine: function(input, index) {
    //we don't worry about keys, because this is only used for array rows
    var row = [];
    var buffer = "";
    var quote = this.options.quote;
    var sep = this.options.separator;
    //for each character in the line...
    for (var position = 0; position < input.length; position++) {
      var character = input[position];
      if (character == quote) {
        //check for "escaped quotes" (e.g., """this is in quotes""");
        if (input[position+1] == quote && input[position+2] == quote) {
          buffer += character;
          position += 2;
        } else {
          //toggle "quoted field" mode
          this.quoting = !this.quoting;
        }
      } else if (character == sep && !this.quoting) {
        var value = buffer;
        buffer = "";
        if (this.options.cast) {
          value = this.cast(value);
        }
        row.push(value);
      } else {
        //if not a separator or a quote, push this into the buffer
        buffer += character;
      }
    }
    //at the end of the line, clear the buffer
    if (buffer) {
      if (this.options.cast) {
        row.push(this.cast(buffer));
      } else {
        row.push(buffer);
      }
    }
    //if the quotes were unbalanced, we'll still be in quoting mode
    if (this.quoting) throw("Unterminated quotes on line " + (index + 1));
    return row;
  },
  cast: function(str) {
    //automatically convert strings into types
    if (typeof str != "string") return str;
    if (str.match(/^[\d,-.]+$/)) {
      return parseFloat(str.replace(/,/g, ""));
    }
    if (str == "true") return true;
    if (str == "false") return false;
    return str;
  }
}

module.exports = {
  Parser: Parser
}
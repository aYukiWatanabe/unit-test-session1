(function(exports) {

  // TODO: check arguments
  var Field = function(xSize, ySize) {
    var map = [];
    for (var x = 0; x < xSize; x++) {
      map[x] = [];
      for (var y = 0; y < ySize; y++) {
        map[x][y] = false;
      }
    }
    this._map = map;
  };

  Field.prototype.setMine = function(x, y) {
    this._map[x][y] = true;
  }
  Field.prototype.setMineAsyncByCallback = function(x, y, proc) { // Promise is better
    var self = this;
    setTimeout(function() {
      self.setMine(x, y);
      proc(false);
    }, 1000);
  }

  Field.prototype.unsetMine = function(x, y) {
    this._map[x][y] = false;
  }
  Field.prototype.unsetMineAsyncByCallback = function(x, y, proc) { // Promise is better
    var self = this;
    setTimeout(function() {
      self.unsetMine(x, y);
      proc(false);
    }, 1000);
  }
  
  Field.prototype.check = function(x, y) {
    return this._map[x][y];
  };

  exports.Field = Field
})(typeof window !== 'undefined' ? (window.simplemine = {}) : exports);


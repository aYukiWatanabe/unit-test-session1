var Field = (this.simplemine && this.simplemine.Field) || require('../lib/main.js').Field;

describe('Field', function() {
  var xSize = 6;
  var ySize = 6;
  var field;

  var rInt = function(max) {
    return Math.floor(Math.random() * (max + 1)); // ~~ is better. See http://nmi.jp/archives/488
  }
  var createMines = function(n) {
    var mines = [];
    for (var i = 0; i < n; i++) {
      mines.push({ x: rInt(xSize - 1), y: rInt(ySize - 1) });
    }
    return mines;
  }
  var verifyMinesOnField = function(f, mines) {
    for (var x = 0; x < xSize; x++) {
      for (var y = 0; y < ySize; y++) {
        var isMine = mines.some(function(m) {
          return (m.x === x) && (m.y === y);
        });
        expect(f.check(x, y)).toEqual(isMine);
      }
    }
  }

  beforeEach(function() {
    field = new Field(xSize, ySize);
  });
  
  it('should save positions of mine', function() {

    // Execute
    var mines = createMines(2);
    mines.forEach(function(m) {
      field.setMine(m.x, m.y);
    });
    
    // Verify
    verifyMinesOnField(field, mines);
  });

  it('should clear positions of mine', function() {
    // TODO:
  });

  it('should save positions of mine by asynchronous call', function() {
    var mines = createMines(2);
    var count = 0;

    // Execute
    mines.forEach(function(m) {
      field.setMineAsyncByCallback(m.x, m.y, function(err) {
        count ++;
      });
    });
    
    waitsFor(function() { // wait() is evil
      return count === mines.length;
    });

    // Verify
    runs(function() {
      verifyMinesOnField(field, mines);
    });
  });

  it('should clear positions of mine by asynchronous call', function() {
    // TODO:
  });
});

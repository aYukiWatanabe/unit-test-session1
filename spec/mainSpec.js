
// ブラウザの場合thisがwindowなのでwindow以下のものが使われる
// Nodeの場合はrequireしたものを使う
var Field = (this.simplemine && this.simplemine.Field) || require('../lib/main.js').Field;
var Q = this.Q || require('q');

describe('Field', function() {
  var xSize = 6;
  var ySize = 6;
  var field;

  // ランダムな整数を生成
  var rInt = function(max) {
    // 通常はこのケースは~~を使う。今回は分かりやすさのため
    // http://nmi.jp/archives/488
    return Math.floor(Math.random() * (max + 1)); 
  };
  
  // ランダムな地雷の配置位置をn個作成
  var createMinePositions = function(n) {
    var ps = [];
    for (var i = 0; i < n; i++) {
      ps.push({ x: rInt(xSize - 1), y: rInt(ySize - 1) });
    }
    return ps;
  };
  
  // 地雷が指定された位置に存在するかどうかテストとして評価する
  var verifyMinesOnField = function(f, ps) {
    for (var x = 0; x < xSize; x++) {
      for (var y = 0; y < ySize; y++) {
        // Array.prototype.someは、配列のどれかが条件にマッチしたらtrueを返す。underscoreの_.any()相当
        var isMine = ps.some(function(m) {
          return (m.x === x) && (m.y === y);
        });
        expect(f.hasMine(x, y)).toEqual(isMine);
      }
    }
  };


  // 各テストの前に実行される
  beforeEach(function() {
    field = new Field(xSize, ySize);
  });
  
  /*
   * シンプルなテストケースのサンプル
   * 地雷位置情報を2つ作って、フィールドのその場所に地雷を配置
   * 配置した地雷が正しく配置されたか確認
   */
  it('should set mines', function() {

    // Execute
    var ps = createMinePositions(2);
    ps.forEach(function(m) {
      field.setMine(m.x, m.y);
    });
    
    // Verify
    verifyMinesOnField(field, ps);
  });

  /*
   * 非同期なテストケースのサンプル
   * 
   * 公式ページの非同期サンプル
   * http://pivotal.github.io/jasmine/#section-24
   */
  it('should set mines by asynchronous call', function() {
    var ps = createMinePositions(2);
    var count = 0;  // 非同期処理を待つために利用する情報

    // Execute
    ps.forEach(function(m) {
      field.setMineAsyncByCallback(m.x, m.y, function(err) {
        count ++;
      });
    });

    // waitsForで登録した関数は何度も呼ばれる。
    // 関数の返す値が真になるまで、次のrunsで登録した関数は実行されない
    // ここでは、setMineAsyncByCallback()が地雷の数だけ呼ばれる = 地雷が全て設置し終わったら runsの登録関数に移動
    // wait()という指定秒数末関数もあるが、テストケースでは基本的に秒数指定で待ってはいけない。利用は補足資料を参照。
    waitsFor(function() {
      return count === ps.length;
    });

    // Verify
    runs(function() {
      verifyMinesOnField(field, ps);
    });
  });

  /*
   * Promiseベース関数のテストケースのサンプル
   * 演習では詳細を説明しない。補足資料を参照。
   * 
   * QUnitならverifyまでチェーンして最後にstart()呼ぶだけなのに、JasmineのwaitsFor()だと記述が冗長
   * 非同期処理を書きにくい環境用にwaitsFor()とruns()を準備してしまったため、Promiseベースの環境でもそれを使う必要があり、結果冗長な書き方になる
   * Promiseベースの環境では、itをラップしてQUnitと同じようにかけるようにした方が楽そう
   */
  it('should set mines by asynchronous call(q.js)', function() {
    var ps = createMinePositions(2);
    var finished = false;

    // Execute
    Q.all(ps.map(function(m) {
      return field.setMineAsync(m.x, m.y);
    })).done(function() {
      finished = true;
    });
    
    waitsFor(function() {
      return finished;
    });

    // Verify
    runs(function() {
      verifyMinesOnField(field, ps);
    });
  });

  // 演習で実装するシンプルなテストケース
  it('should clear mine on the mass', function() {
    var ps = createMinePositions(2);
    ps.forEach(function(m) {
      field.setMine(m.x, m.y);
    });
    ps.forEach(function(m) {
      field.unsetMine(m.x, m.y);
    });

    verifyMinesOnField(field, []);
  });

  // 演習で実装する非同期のテストケース
  it('should clear mine on the mass by asynchronous call', function() {
    var ps = createMinePositions(2);
    var count = 0;

    ps.forEach(function(m) {
      field.setMineAsyncByCallback(m.x, m.y);
    });
    ps.forEach(function(m) {
      field.unsetMineAsyncByCallback(m.x, m.y, function(err) {
        count++;
      });
    });

    waitsFor(function() {
      return count === ps.length;
    });

    runs(function() {
      verifyMinesOnField(field, []);
    });
  });

});

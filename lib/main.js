/*
 * A x Bマス中の特定の位置に地雷を配置して記憶するnpmモジュール
 */

// グローバルを汚さないため、(function(){})()の形で無名関数を作成して即時実行する
// Nodeでは各ファイルがモジュールとして固有の名前空間になるので必要ないが、このファイルはBrowserからも利用するため
(function(namespace) { // 仮引数は名前空間。ファイルの最下部を参照。
  // Promiseベースの非同期処理のサンプルとしてQを利用。演習では詳細を説明しない。補足資料を参照。
  var Q = this.Q || require('q');

  /*
   * テスト対象のクラス(言語としてはクラスがない話は置いておく)
   * 将来的に引数の数が変わる可能性の高い場合、ハッシュで引数を渡す形するとメンテナンスがしやすい。
   * ただ、欠点としてtypoしやすくなるので、ASSERT()で引数チェックをすると少し安心
   */
  var Field = function(xSize, ySize) {
    // マップを持つ配列を作って、すべてのマスを初期化
    // 最近は規模が大きくなりそうならtyped arrayが使われることが多い
    var map = [];
    for (var x = 0; x < xSize; x++) {
      map[x] = [];
      for (var y = 0; y < ySize; y++) {
        map[x][y] = Field.massFlags.NONE;
      }
    }
    // プライベートプロパティの命名規則として先頭_を採用
    // Google JavaScript Style Guideでは末尾_だが、今のところ普及度では先頭_が多い感じ
    // http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
    this._map = map;
  };
  
  // マスの状態はフラグで持つ
  Field.massFlags = {
    NONE: 0x00, // 何もない
    MINE: 0x01  // 地雷が置いてある
  };

  // 地雷を設定
  Field.prototype.setMine = function(x, y) {
    this._map[x][y] |= Field.massFlags.MINE;
  };
  
  /*
   * 地雷を設定(非同期)
   * 1秒後に地雷が設定されてコールバックが呼ばれる。あくまでも非同期処理のサンプルで通常はあり得ない実装
   * オプショナルな引数にopt_をつけるのは、Google JavaScript Style Guide に合わせている。
   * http://google-styleguide.googlecode.com/svn/trunk/javascriptguide.xml
   */
  Field.prototype.setMineAsyncByCallback = function(x, y, opt_proc) {
    // setTimeoutのコールバック内ではthisが変わってしまうので、selfとして保存して利用する
    var self = this;

    // オプショナルの引数にデフォルト値を設定
    var proc = opt_proc || function() {};

    setTimeout(function() {
      self.setMine(x, y);
      // Nodeの規約に従うと、コールバックの第1引数にはエラー情報を返す
      // 非同期関数は、たとえ引数関連のエラーであっても結果は非同期の(遅延させた)コールバックで返す。同期的にコールバックを呼んではいけない
      // http://nodejs.org/api/fs.html
      proc(false);
    }, 1000);
  };

  /*
   * 地雷を設定(非同期、Promiseベース)
   * 演習では詳細を説明しない。補足資料を参照。
   */
  Field.prototype.setMineAsync = function(x, y) {
    var self = this;
    var deferred = Q.defer();
    setTimeout(function() {
      self.setMine(x, y);
      deferred.resolve();
    }, 1000);
    return deferred.promise;
  };

  // 地雷を駆除
  Field.prototype.unsetMine = function(x, y) {
    this._map[x][y] &= ~Field.massFlags.MINE;
  };

  // 地雷を駆除(非同期)
  Field.prototype.unsetMineAsyncByCallback = function(x, y, opt_proc) {
    var self = this;
    var proc = opt_proc || function() {};
    setTimeout(function() {
      self.unsetMine(x, y);
      proc(false);
    }, 1000);
  };
  
  /*
   * 地雷かどうかチェックするメソッド
   * 本来はField.massFlags.*を渡してもらうなど汎用的なIFがいい
   */
  Field.prototype.hasMine = function(x, y) {
    // 今回は分かりやすく三項演算子にしているが、普通は!!を使う
    // http://nmi.jp/archives/488
    return this._map[x][y] & Field.massFlags.MINE ? true: false;
  };

  /*
   * 特定マスの周囲8マスの地雷の数をカウントする
   * おまけ演習
   */
  Field.prototype.countNearbyMines = function(x, y) {
    var count = 0;
    for (var cx = x - 1; cx < x + 2; cx ++) {
      for (var cy = y - 1; cy < y + 2; cy ++) {
        if (cx === x && cy === y) {
          continue;
        }
        if (this.hasMine(cx, cy)) {
          count ++;
        }
      }
    }
    return count;
  };

  Field.prototype.getMap = function() {
    return this._map;
  };

  // モジュールの公開クラスとしてFieldを登録
  namespace.Field = Field;
})(
  // Browserから読み込まれた場合(windowが存在する場合)は、windowにモジュールの名前空間を追加して利用する
  // Nodeから読み込まれた場合は、Nodeに存在するexportsという外部に公開するためにオブジェクトを利用する
  typeof window !== 'undefined' ? (window.simplemine = {}) : exports
);


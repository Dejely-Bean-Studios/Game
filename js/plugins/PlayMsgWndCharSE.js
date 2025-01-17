//=============================================================================
// PlayMsgWndCharSE.js
//=============================================================================

/*:
 * @plugindesc Play SE for each character at message window
 * @author Sasuke KANNAZUKI
 *
 * @param default SE
 * @desc default sound ID on map. Be 0, 1 or 2. when 0, not play at default.
 * @default 1
 *
 * @param battle default SE
 * @desc default sound ID on battle. Be 0, 1 or 2. when 0, not play at default.
 * @default 0
 *
 * @param interval
 * @desc character number that skip without playing SE. (prefer to be 2)
 * When it sets 0, play at each character.
 * @default 2
 *
 * @param name1
 * @desc filename of SE1
 * @default Cursor1
 *
 * @param volume1
 * @desc volume of SE1
 * @default 90
 *
 * @param pitch1
 * @desc pitch of SE1
 * @default 100
 *
 * @param name2
 * @desc filename of SE2
 * @default Cursor2
 *
 * @param volume2
 * @desc volume of SE2
 * @default 75
 *
 * @param pitch2
 * @desc pitch of SE2
 * @default 125
 *
 * @param name3
 * @desc filename of SE3
 * @default Cursor2
 *
 * @param volume3
 * @desc volume of SE3
 * @default 75
 *
 * @param pitch3
 * @desc pitch of SE3
 * @default 125
 * 
 * @param name4
 * @desc filename of SE4
 * @default Cursor2
 *
 * @param volume4
 * @desc volume of SE4
 * @default 75
 *
 * @param pitch4
 * @desc pitch of SE4
 * @default 125
 * 
 * @param name5
 * @desc filename of SE5
 * @default Cursor2
 *
 * @param volume5
 * @desc volume of SE5
 * @default 75
 *
 * @param pitch5
 * @desc pitch of SE5
 * @default 125
 * 
 * @param name6
 * @desc filename of SE6
 * @default Cursor2
 *
 * @param volume6
 * @desc volume of SE6
 * @default 75
 *
 * @param pitch6
 * @desc pitch of SE6
 * @default 125
 * 
 * @help This plugin does not provide plugin commands.
 * 
 * At message window, SE can change by following notation:
 * \SE[0] : stop char SE
 * \SE[1] : play SE ID 1 at each character.
 * \SE[2] : play SE ID 2 at each character.
 * This setting is reset when map or scene changes.
 *
 * when \> is set in message window,
 * force to play char SE once.
 */
/*:ja
 * @plugindesc メッセージウィンドウで文字ごとにSEを演奏します。
 * @author 神無月サスケ
 *
 * @param default SE
 * @desc マップでのデフォルトの音IDです。
 * 0,1,2のいずれかにしてください。0は無音です。
 * @default 1
 *
 * @param battle default SE
 * @desc バトルでのデフォルトの音IDです。
 * 0,1,2のいずれかにしてください。0は無音です。
 * @default 0
 * 
 * @param interval
 * @desc 何文字スキップして音を鳴らすか(推奨値:2)。
 * 0の場合、全ての文字で音を鳴らします。
 * @default 2
 *
 * @param name1
 * @desc SE1のファイル名
 * @default Cursor1
 *
 * @param volume1
 * @desc SE1のボリューム
 * @default 90
 *
 * @param pitch1
 * @desc SE1のピッチ
 * @default 100
 *
 * @param name2
 * @desc SE2のファイル名
 * @default Cursor2
 *
 * @param volume2
 * @desc SE2のボリューム
 * @default 75
 *
 * @param pitch2
 * @desc SE2のピッチ
 * @default 125
 *
 * @help このプラグインには、プラグインコマンドはありません。
 * 
 * メッセージウィンドウで以下の書式で書くことでSEを切り替えられます。
 * \SE[0] : SEを止めます。
 * \SE[1] : SE1を鳴らします。
 * \SE[2] : SE2を鳴らします。
 * この設定は、マップかシーンが切り替わるとデフォルトにリセットされます。
 *
 * 文中で \> が設定された場合、intervalの値に関わらず、
 * 強制的に1回だけSEが演奏されます。
 */

(function() {
  //
  // process parameters
  //
  var parameters = PluginManager.parameters('PlayMsgWndCharSE');
  var defaultMode = Number(parameters['default SE'] || 1);
  var battleDefaultMode = Number(parameters['battle default SE'] || 0);
  var interval = Number(parameters['interval'] || 2);

  var name1 = (parameters['name1'] || 'Cursor1');
  var volume1 = Number(parameters['volume1'] || 90);
  var pitch1 = Number(parameters['pitch1'] || 100);

  var name2 = (parameters['name2'] || 'Cursor2');
  var volume2 = Number(parameters['volume2'] || 75);
  var pitch2 = Number(parameters['pitch2'] || 125);

  var name3 = (parameters['name3'] || 'Cursor2');
  var volume3 = Number(parameters['volume3'] || 75);
  var pitch3 = Number(parameters['pitch3'] || 125);

  var name4 = (parameters['name4'] || 'Cursor2');
  var volume4 = Number(parameters['volume4'] || 75);
  var pitch4 = Number(parameters['pitch4'] || 125);

  var name5 = (parameters['name5'] || 'Cursor2');
  var volume5 = Number(parameters['volume5'] || 75);
  var pitch5 = Number(parameters['pitch5'] || 125);

  var name6 = (parameters['name6'] || 'Cursor2');
  var volume6 = Number(parameters['volume6'] || 75);
  var pitch6 = Number(parameters['pitch6'] || 125);

  //
  // initialize variables
  //
  var _Window_Message_initMembers = Window_Message.prototype.initMembers;
  Window_Message.prototype.initMembers = function() {
    _Window_Message_initMembers.call(this);
    this.charSECount = 0;
    this.charSEmode = defaultMode;
  };

  //
  // set Battle Mode
  //
  var _Scene_Battle_createMessageWindow =
   Scene_Battle.prototype.createMessageWindow;
  Scene_Battle.prototype.createMessageWindow = function() {
    _Scene_Battle_createMessageWindow.call(this);
    this._messageWindow.charSEmode = battleDefaultMode;
  };

  //
  // set the char SE mode
  //  
  var _Window_Message_processEscapeCharacter =
   Window_Message.prototype.processEscapeCharacter;
  Window_Message.prototype.processEscapeCharacter = function(code, textState) {
    switch (code) {
    case 'SE':
      this.charSEmode = this.obtainEscapeParam(textState);
      console.log(this.charSEmode);
      break;
    case '>':
      // force to play char SE once. 
      this.charSECount = interval + 1;
      // do not break, also do default process.
    default:
      _Window_Message_processEscapeCharacter.call(this, code, textState);
      break;
    }
  };

  //
  // play char SE at message window
  //  
  var _Window_Message_processNormalCharacter =
   Window_Message.prototype.processNormalCharacter;
  Window_Message.prototype.processNormalCharacter = function(textState) {
    _Window_Message_processNormalCharacter.call(this, textState);
    this.processCharSE();
  };

  Window_Message.prototype.processCharSE = function(){
    if(this._showFast) { // triggered (= skipping message)
      return;
    }
    if(!this._lineShowFast) { // unless '\>' mode
      ++this.charSECount;
    }
    if(this.charSECount > interval) {
      this.playCharSE();
      this.charSECount = 0;
    }
  };

  Window_Message.prototype.playCharSE = function(){
    switch (this.charSEmode) {
    case 0:
      // not play sound
      break;
    case 1:
      if(name1){
        var audio = {};
        audio.name = name1;
        audio.pitch = pitch1;
        audio.volume = volume1;
        AudioManager.playSe(audio);
      }
      break;
    case 2:
      if(name2){
        var audio = {};
        audio.name = name2;
        audio.pitch = pitch2;
        audio.volume = volume2;
        AudioManager.playSe(audio);
      }
      break;
    case 3:
      if(name3){
        var audio = {};
        audio.name = name3;
        audio.pitch = pitch3;
        audio.volume = volume3;
        AudioManager.playSe(audio);
      }
      break;
    case 4:
      if(name4){
        var audio = {};
        audio.name = name4;
        audio.pitch = pitch4;
        audio.volume = volume4;
        AudioManager.playSe(audio);
      }
      break;
    case 5:
      if(name5){
        var audio = {};
        audio.name = name5;
        audio.pitch = pitch5;
        audio.volume = volume5;
        AudioManager.playSe(audio);
      }
      break;
    case 6:
      if(name6){
        var audio = {};
        audio.name = name6;
        audio.pitch = pitch6;
        audio.volume = volume6;
        AudioManager.playSe(audio);
      }
      break;
    default:
      // not supported yet
      break;
    }
  };
})();

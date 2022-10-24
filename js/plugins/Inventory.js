//=============================================================================
// Inventory.js
//=============================================================================

/*:
 * @plugindesc Displays the inventory
 * @author Ethan Chung
 *
 * 
 *
 * @help
 * To open and close the inventory on any screen press i
 * To close the inventory press i again or esc
 * 
 * Once in the inventory select an item using enter to view more details
 * To exit this screen press enter again or esc
 * 
 * num Clues changes the number of clues in the inventory
 * 
 * Switches to activate clues must be sequential, switchStart can be changed to match the start number of the sequence
 * 
 * clue# can be changed to change the description of the clues
 *
 * @param numClues
 * @desc The number of clues in the game
 * @default 6
 * 
 * @param switchStart
 * @desc the number at which the switches for the clues start
 * 
 * @param clue1
 * @desc the description text for the clue
 * @default Cyrus made dinner
 * 
 * @param clue2
 * @desc the description text for the clue
 * @default Cyrus did the dishes
 * 
 * @param clue3
 * @desc the description text for the clue
 * @default Cyrus died after falling
 * 
 * @param clue4
 * @desc the description text for the clue
 * @default Someone buzzed into the apartment
 * 
 * @param clue5
 * @desc the description text for the clue
 * @default Cyrus watched TV
 * 
 * @param clue6
 * @desc the description text for the clue
 * @default Cyrus read a book
 */

var Inventory = Inventory || {};

var parameters = PluginManager.parameters('Inventory');

var back_blur = true;

var selected_item = 0;
// Map I to a command
Input.keyMapper["73"] = "I";
var clues = Number(parameters['numClues']);
// Tracks which command is pressed and is used to display the correct image in more info
var itemID = 0;

inventory_background = 'notebook'

ImageManager.reservePicture(inventory_background)

picture_ID = 14

// Open the inventory on keypress
_alias_map_update = Scene_Map.prototype.update;
Scene_Map.prototype.update = function() {
    _alias_map_update.call(this);
    if (Input.isTriggered("I")) {
        SceneManager.push(Scene_Inventory);
    }
}

SceneManager.snapForBackground = function() {
    this._backgroundBitmap = this.snap();
    if (back_blur) {
        this._backgroundBitmap.blur();
    }
};

//=============================================================
//                              Scenes                        =
//=============================================================


//---------------------Inventory-----------------------
function Scene_Inventory() {
    this.initialize.apply(this, arguments);
}

Scene_Inventory.prototype = Object.create(Scene_MenuBase.prototype);
Scene_Inventory.prototype.constructor = Scene_Inventory;

Scene_Inventory.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
    ImageManager.reserveFace('inventoryclues1')
    picX = Graphics.boxWidth / 2
    picY = Graphics.boxHeight / 2
    $gameScreen.showPicture(picture_ID, inventory_background, 1, picX, picY, 100, 100, 255, 0);
    back_blur = false;
};

Scene_Inventory.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
    this._inventorywindow = new Window_Inventory();
    for (var i = 0; i < clues; i++) {
        this._inventorywindow.setHandler("command" + i, this.moreInfo.bind(this, i));
    }
    this.addWindow(this._inventorywindow);
}

Scene_Inventory.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
    this._inventorywindow.refresh();
}

Scene_Inventory.prototype.update = function() {
    Scene_MenuBase.prototype.update.call(this);
    // Close the inventory on keypress
    if (Input.isTriggered('escape') || Input.isTriggered('I')) {
        this.popScene();
        $gameScreen.clearPictures();
        back_blur = true;
    }
}

Scene_Inventory.prototype.moreInfo = function(itemNum) {
    itemID = itemNum;
    SceneManager.push(Scene_MoreInfo);
    selected_item = itemNum;
}

//------------------------MoreInfo Scene-------------------------------------------------

function Scene_MoreInfo() {
    this.initialize.apply(this, arguments);
}

Scene_MoreInfo.prototype = Object.create(Scene_MenuBase.prototype);
Scene_MoreInfo.prototype.constructor = Scene_MoreInfo;

Scene_MoreInfo.prototype.initialize = function() {
    Scene_MenuBase.prototype.initialize.call(this);
    ImageManager.reserveFace('clues1')
    this.windows = {};
    back_blur = false;
};

Scene_MoreInfo.prototype.create = function() {
    Scene_MenuBase.prototype.create.call(this);
        this.windows["_item" + itemID] = new Window_MoreInfo(itemID);
        this.addWindow(this.windows["_item" + itemID]);
};

Scene_MoreInfo.prototype.start = function() {
    Scene_MenuBase.prototype.start.call(this);
        this.windows["_item" + itemID].drawAllItems();
    this.item()
}

Scene_MoreInfo.prototype.update = function() {
    Scene_MenuBase.prototype.update.call(this);
    // Close zoomed in image on keypress
    if (Input.isTriggered('ok') || Input.isTriggered('cancel')) {
        this.popScene();
        $gameScreen.clearPictures();
        back_blur = true;
    }
}

Scene_MoreInfo.prototype.item = function() {
    this.windows["_item" + itemID].show();
}

//=============================================================
//                          Windows                           =
//=============================================================

//-----------------------Inventory Window-------------------------
function Window_Inventory() {
    this.initialize.apply(this, arguments);
}

Window_Inventory.prototype = Object.create(Window_HorzCommand.prototype);
Window_Inventory.prototype.constructor = Window_Inventory;

Window_Inventory.prototype.initialize = function() {
    x = (Graphics.boxWidth / 2) - (this.windowWidth() / 2)
    y = (Graphics.boxHeight / 2) - (this.windowHeight() / 2)
    Window_HorzCommand.prototype.initialize.call(this, x, y);
    this.setBackgroundType(-1);
    this.activate();
    this.select(selected_item);
    selected_item = 0
}

Window_Inventory.prototype.makeCommandList = function() {
    for (var i = 0; i < clues; i++) {
        this.addCommand("Item" + i, "command" + i);
    }
};

Window_Inventory.prototype.maxCols = function () {
    return 3;
}

Window_HorzCommand.prototype.numVisibleRows = function() {
    return 2;
};

Window_Inventory.prototype.maxPageRows = function () {
    return 2;
}
Window_Inventory.prototype.windowHeight = function() {
    return this.fittingHeight(this.numVisibleRows()) * 2;
};

Window_Inventory.prototype.windowWidth = function() {
    return this.windowHeight() * (3/2) + 15;
};

Window_Inventory.prototype.drawItem = function (index) {
    var itemRect = this.itemRect(index);
    if ($gameSwitches.value(index + Number(parameters['switchStart']))) {
        this.drawFace("inventoryclues1", index + 1, itemRect.x + 10, itemRect.y + 10, itemRect.width - 20, itemRect.height - 20); 
    }
    else {
        this.drawFace("inventoryclues1", 0, itemRect.x + 10, itemRect.y + 10, itemRect.width - 20, itemRect.height - 20);
    }
}

Window_Inventory.prototype.itemHeight = function() {
    return (this.height - this.padding * 2) / this.maxPageRows();
};

Window_Inventory.prototype.itemWidth = function() {
    return this.itemHeight()
}

//----------------------------MoreInfo Window------------------------------------
//when an item in the inventory is selected show a zoomed in icon and a short description

function Window_MoreInfo() {
    this.initialize.apply(this, arguments);
}

Window_MoreInfo.prototype = Object.create(Window_Base.prototype);
Window_MoreInfo.prototype.constructor = Window_MoreInfo;

// Initialize the inventory
Window_MoreInfo.prototype.initialize = function(image) {
    width = 300;
    height = 800
    x = (Graphics.boxWidth / 2) - (width / 2)
    y = (Graphics.boxHeight / 3) - (height / 2)
    Window_Base.prototype.initialize.call(this, x, y, width, height);
    this.setBackgroundType(-1);
    this.activate();
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.image = image;
    this.changeTextColor(this.textColor(15));
}

Window_MoreInfo.prototype.drawAllItems = function() {
    this.contents.clear(); 
    if ($gameSwitches.value(this.image + Number(parameters['switchStart']))) {
        this.drawFace("clues1", this.image + 1, -18, 30, this.width, this.height)
        this.drawText(parameters["clue" + (this.image + 1)], 0, this.height / 1.5, this.width - 36, 'center');
    }
    else {
        this.drawFace("clues1", 0, -18, 30, this.width, this.height)
        this.drawText("You haven't found this clue yet", 1, this.height / 1.5, this.width - 36, 'center');
    }
}
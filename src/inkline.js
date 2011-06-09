blankBlockStr = "<div class='box-container'><div class='box-button' style='display:none;'>&gt;</div><div class='box-source' contentEditable='true'></div><div class='box-output'></div></div>";

dir="C:\\Users\\Felix\\";

converter = new Showdown.converter();

blockSeparator = "\n\n";

cFullscreen = require("fullscreen");
cUI = require("ui");
cMenu = require("menu");
cFile = require("file");
cFilePicker = require("file-picker");
cHotkey = require("hotkey");

var filename = "";

// UI

function togglePanel() {
    $("#panelslider").slideToggle();
}

function toggleFullscreen() {
    cFullscreen.toggle(window);
}

function pickFile() {
    fp = cFilePicker.FilePicker();
    fp.title = "Open File";
    fp.mode = "save";
    fp.show(function(x) {
	if (x === undefined) {
	    console.log("Nothing picked");
	} else {
	    console.log("picked " + x);
	}
    });
}

// BLOCK QUERIES

function getActiveBlock() {
    node = window.getSelection().getRangeAt(0).endContainer;
    return $($(node).parents(".box-container").get(0));
}

// BLOCK MANIPULATION

insertEmptyBlock = function(block) {
    $(block).after(blankBlockStr);
    return $(block).next().get(0);
}

insertAfterBlock = function(source,target) {
    block = insertEmptyBlock(target);
    textnode = document.createTextNode(source);
    $($(block).find(".box-source").get(0)).prepend(textnode);
    $(block).find('.box-button').click( function () { toggleBlock($(this).parent()); } );
    $(block).find('.box-source').dblclick( function () { toggleBlock($(this).parent()); } );
    $(block).find('.box-output').dblclick( function () { toggleBlock($(this).parent()); } );
    return block;
}

appendEmptyBlock = function() {
    $(".column").append(blankBlockStr);
    return $(".column").children().last();
}

function appendBlock(str) {
    block = appendEmptyBlock();
    textnode = document.createTextNode(str);
    $($(block).find(".box-source").get(0)).prepend(textnode);
    $(block).find('.box-button').click( function () { toggleBlock($(this).parent()); } );
    $(block).find('.box-source').dblclick( function () { toggleBlock($(this).parent()); } );
    $(block).find('.box-output').dblclick( function () { toggleBlock($(this).parent()); } );    
    return block;
}


// BLOCK SPLITTING

// delete block if necessary. split block if necessary.
function processBlock(block) {
    sourceElt = $(block).find(".box-source").get(0);
    source = readBlock(sourceElt);
    if(source.trim() == "") { // delete
	$(block).remove();
	return [];
    }
    var sources = source.split(blockSeparator);
    if(sources.length > 1) { // split
	sourceElt.innerHTML = sources[0];
	blocks = [$(block).get(0)];
	for(i = 1; i < sources.length; i++) {
	    b = insertAfterBlock(sources[i], blocks[blocks.length-1]);
	    blocks.push(b);
	}
	return blocks;
    } else { // no-op
	return [$(block).get(0)];
    }
}

function deleteEmptyBlocks() {
    $(".box-container").each(function (block) {
	sourceElt = $(block).find(".box-source").get(0);
	source = readBlock(sourceElt);
	if(source.trim() == "") { // delete
	    $(block).remove();
	    return [];
	}
    });
}


// TRANSFORMATION

function transformBlock(block) {
    sourceElt = $(block).find(".box-source").get(0);
    outputElt = $(block).find(".box-output").get(0);
    source = readBlock(sourceElt);
    output = converter.makeHtml(source); // here, we apply showdown!
    outputElt.innerHTML = output;
    displayBlock(block);
    MathJax.Hub.Queue(["Typeset",MathJax.Hub,outputElt]);
}

function transformAll() {
    $(".box-container").each(function(i, e) { transformBlock(e); })
}

function editBlock(block) {
    sourceElt = $(block).find(".box-source").get(0);
    outputElt = $(block).find(".box-output").get(0);   
    $(sourceElt).removeClass("hidden");
    $(outputElt).addClass("hidden");
    r = window.getSelection().getRangeAt(0);
    r.setStart($(sourceElt).get(0),0);
    r.collapse(true);
    $(sourceElt).focus();
}

function displayBlock(block) {
    sourceElt = $(block).find(".box-source").get(0);
    outputElt = $(block).find(".box-output").get(0);   
    $(sourceElt).addClass("hidden");
    $(outputElt).removeClass("hidden");    
}

function blockInEditMode(block) {
    sourceElt = $(block).find(".box-source").get(0);
    outputElt = $(block).find(".box-output").get(0);
    return $(outputElt).hasClass("hidden");   
}

function toggleBlock(block) {
    if(blockInEditMode(block)) {
	blocks = processBlock(block);
	console.log("toggleBlock: transforming " + blocks.length + " blocks");
	for(i = 0; i < blocks.length; i++) {
            transformBlock(blocks[i]);
	}
    } else {
        editBlock(block);
    }
}

// KEYBOARD HANDLING

function showChar(e)
{
    alert("Key Pressed: " + String.fromCharCode(e.charCode) + "\n"
	  + "charCode: " + e.charCode + " which: " + e.which + " keyCode " + e.keyCode);
}

function keyboardEventToString(event) {
    // Don't fire in text-accepting inputs that we didn't directly bind to
    if ( this !== event.target && (/textarea|select/i.test( event.target.nodeName ) || event.target.type === "text") ) {
	return;
    }

    //if (event.which == 0)
    //event.which = event.keyCode;

    // Keypress represents characters, not special keys
    var special = event.type !== "keypress" && jQuery.hotkeys.specialKeys[ event.which ],
    character = String.fromCharCode( event.which ).toLowerCase(),
    key, modif = "", possible = {};

    // check combinations (alt|ctrl|shift+anything)
    if ( event.altKey && special !== "alt" ) {
	modif += "alt+";
    }
    
    if ( event.ctrlKey && special !== "ctrl" ) {
	modif += "ctrl+";
    }
    
// TODO: Need to make sure this works consistently across platforms
    if ( event.metaKey && !event.ctrlKey && special !== "meta" ) {
	modif += "meta+";
    }
    
    if ( event.shiftKey && special !== "shift" ) {
	modif += "shift+";
    }
    
    if ( special ) {
	return modif + special;
	//possible[ modif + special ] = true;
	
    } else {
	return modif + character;
	//possible[ modif + character ] = true;
	/*possible[ modif + jQuery.hotkeys.shiftNums[ character ] ] = true;
	
	// "$" can be triggered as "Shift+4" or "Shift+$" or just "$"
	if ( modif === "shift+" ) {
	    possible[ jQuery.hotkeys.shiftNums[ character ] ] = true;
	}*/
    }
    return possible;
}

function handleKeydown(e) {
    // first handle special characters
    str = keyboardEventToString(e);
    switch(str) {
	case "ctrl+s":
        case "cmd+s":
        case "f5":
	    saveFile();
	    return false;
	case "f9":
	    openFile();
	    return false;
	case "f11":
	    toggleFullscreen();
	    return false;
	case "esc":
	    toggleMenu("root");
	    return false;
	case "ctrl+t":
	    transformAll();
	    return false;
	case "ctrl+return":
	    console.log("ctrl+enter pressed");
	    b = getActiveBlock();
	    if(b != undefined) {
		nb = insertAfterBlock("",b);
		toggleBlock(b);
		editBlock(nb);
	    }
	    return false;
    }
    return true;
}


function handleKeypress(e) {
    if(e.charCode != 0) {
	c = String.fromCharCode(e.charCode);
	insertCharacter(c);
    }
    return false;
}

$(document).keydown(handleKeydown);


// LOAD AND SAVE

function saveNow() {
    //time = new Date().getTime();
    //saveDocumentToFile(dir + "test-" + time + ".txt");
    saveDocumentToFile(fileName());
}

function loadNow() {
	loadDocumentFromFile(fileName());
}

function loadDocumentFromJSON(obj) {
    if(obj != undefined) {
	$(".column").empty();
	for(var i = 0; i < obj.length; i++) {
	    appendBlock(obj[i].text);
	}
	setActiveBlock($($(".box-container").get(0)));
    }
}

function loadDocumentFromText(str) {
    if(str != undefined) {
		$(".column").empty();
		blocks = str.split(blockSeparator); // blocks are delimited by two blank lines
		for(var i = 0; i < blocks.length; i++) {
	    	appendBlock(blocks[i]);
		}
	// setActiveBlock($($(".box-container").get(0)));
	    transformAll();
    }	
}

function loadDocumentFromFile(path) {
    loadDocumentFromText(cFile.read(path));
    notify("Loaded " + path  + ".");
}

function saveDocumentToJSON() {
    result = [];
    blockContents = $(".box-source");
    for(var i = 0; i < blockContents.length; i++) {
	result.push( { text: readBlock($(blockContents.get(i))) } );
    }
    return result;
}

function saveDocumentToText() {
    result = [];
    blockContents = $(".box-source");
    for(var i = 0; i < blockContents.length; i++) {
		result.push( readBlock($(blockContents.get(i))) );
    }
    return result.join(blockSeparator);
}

function saveDocumentToFile(path) {
    content = saveDocumentToText();
    var stream = cFile.open(path, "w");
    try {
        stream.write(content);
	notify("Saved " + path  + ".");
    }
    finally {
        stream.close();
    }
}

function fileName() {
    return $("#panelslider input").val();
}

function readBlock(block) {
    res = "";
    childNodes = $(block).get(0).childNodes;
    for(var i = 0; i < childNodes.length; i++) {
	    if(childNodes[i].nodeType == 3) {
	        res += childNodes[i].nodeValue;
	    } else if (childNodes[i].nodeType == 1 && $(childNodes[i]).get(0).tagName == "BR") {
	        res += "\n";
	    }
    }
    return res;
}

// UTITLITY

String.prototype.trim = function () {
    return this.replace(/^\s*/, "").replace(/\s*$/, "");
}

jQuery.fn.center = function () {
    this.css("position","absolute");
    this.css("top", ( $(window).height() - this.outerHeight() ) / 2 + $(window).scrollTop() + "px");
    this.css("left", ( $(window).width() - this.outerWidth() ) / 2 + $(window).scrollLeft() + "px");
    return this;
}


// MENU

/*var menuTest = cMenu.Menu({
    parent: cUI.getMenu(),
    label: "File",
    children: [
	cMenu.Menu({
	    label: "Open",
	    type: "radio",
	    checked: true,
	    onClick: function(e) { loadNow(); }
	}),
	cMenu.Menu({
	    label: "Pick File",
	    onClick: function(e) { pickFile(); }
	})
    ]
});*/

function showMenu(key) {
    $("#menu").show();
    $(".menu-page").hide();
    $("#menu-"+key).show();
    $("#menu").center();
}

function toggleMenu() {
    if($("#menu").css('display') == "none") {
	showMenu('root');
    } else {
	$('#menu').hide();
    }
}

// MENU COMMANDS

function openFile() {
    console.log("Open File");
    fp = cFilePicker.FilePicker();
    fp.title = "Open File";
    fp.mode = "open";
    fp.show(function(x) {
	if (x === undefined) {
	    console.log("Open File: nothing picked");
	} else {
	    console.log("Open File: picked " + x);
	    filename = x;
	    loadDocumentFromFile(x);
	}
    });
}

function saveFile() {
    console.log("Save File");
    if(filename == "") {
	console.log("Save File: no filename set");
	fp = cFilePicker.FilePicker();
	fp.title = "Save As File";
	fp.mode = "save";
	fp.show(function(x) {
	    if (x === undefined) {
		console.log("Save File: nothing picked");
	    } else {
		console.log("Save File: picked " + x);
		filename = x;
		saveFile();
	    }
	});	
    } else {
	saveDocumentToFile(filename);
    }
}

function newFile() {
    filename = "";
    $(".column").empty();
    appendEmptyBlock();
}

function setFont(font) {
    $("#thefont").attr("href", "themes/font-"+font+".css");
}

function setTheme(theme) {
    $("#thetheme").attr("href", "themes/theme-"+theme+".css");
}

// NOTIFY

function notify(str) {
    console.log("Notify: " + str);
    $("#notify-area").html(str);
    $("#notify-area").fadeIn().delay(4000).fadeOut();
}
	
$(document).ready(function() {
    //cUI.setIcon().title = "Qute";
    //cUI.setIcon().imageSpec = "icon-512.png";
    loadDocumentFromText("Welcome to **Qute**$^+$!\n");

    $("#notify-area").hide();
    window.resizeTo(960,650);
});


/*
    Qute - a themable text editor with paragraph-wise preview of markup
    Copyright (C) 2011 Felix Breuer

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

mozDirtyStr = "<br _moz='true' _moz_dirty=''/>";
blankBlockStr = "<div class='box-container'><div class='box-button' style='display:none;'>&gt;</div><div class='box-source' contentEditable='true'>" + mozDirtyStr + "</div><div class='box-output'></div></div>";

dir="C:\\Users\\Felix\\";

converter = new Showdown.converter();

blockSeparator = "\n\n";

cFullscreen = require("fullscreen");
cUI = require("ui");
cMenu = require("menu");
cFile = require("file");
cFilePicker = require("file-picker");
cHotkey = require("hotkey");
cClipboard = require("clipboard");
cPrefs = require("preferences-service");

var filename = "";

var twoColumnMode = false;
var transformTimer = false;

// UI

function togglePanel() {
    $("#panelslider").slideToggle();
}

function toggleFullscreen() {
    cFullscreen.toggle(window);
}

function toggleTwoColumnMode() {
    setTwoColumnMode(!twoColumnMode);
}

function setTwoColumnMode(b) {
    if(b) {
        /* activate two column mode */
        $("#column-mode").attr("href", "two-column.css");
        twoColumnMode = true;
        /* bind event handlers */
        $('.box-source').live('keyup.twoColumn paste.twoColumn', function(event) { 
            if(transformTimer) {
                console.log("clearing Timeout");
                window.clearTimeout(transformTimer);
                transformTimer = undefined;
            }
            // window.setTimeout( function() {alert("foo");}, 1000);
            transformTimer = window.setTimeout(function() { transformBlock($(event.target).parent(".box-container")) }, 800);
        }).live('blur.twoColumn', function(event) {
            transformBlock($(event.target).parent(".box-container"))
        });
        
    } else {
        /* activate one column mode */
        $("#column-mode").attr("href", "one-column.css");
        twoColumnMode = false;
        /* unbind event handlers */
        if(transformTimer) {
            console.log("clearing Timeout");
            window.clearTimeout(transformTimer);
            transformTimer = undefined;
        }
        $('.box-source').die('keyup.twoColumn paste.twoColumn blur.twoColumn');
    }
}

function toggleScrollbar() {
    /* scroll bar cannot be hidden via css */
    $("#scroll-area").toggleClass("hidescroll");
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
    insertAfterBlock("",block);
}

insertAfterBlock = function(str,target) {
    $(target).after(blankBlockStr);
    block = $(target).next().get(0);
    prepareBlankBlock(block, str);
    return block;
}

appendEmptyBlock = function() {
    appendBlock("");
}

function appendBlock(str) {
    $(".column").append(blankBlockStr);
    block = $(".column").children().last();
    prepareBlankBlock(block, str);
    return block;
}

function prepareBlankBlock(block, str) {
    textnode = document.createTextNode(str);
    $($(block).find(".box-source").get(0)).prepend(textnode);
    $(block).find('.box-button').click( function () { toggleBlock($(this).parent()); } );
    $(block).find('.box-source').dblclick( function () { toggleBlock($(this).parent()); } );
    $(block).find('.box-output').click( function () { toggleBlock($(this).parent()); } );    
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
    console.log("toggleBlock");
    if(blockInEditMode(block)) {
        blocks = processBlock(block);
        console.log("toggleBlock: transforming " + blocks.length + " blocks");
        for(i = 0; i < blocks.length; i++) {
            transformBlock(blocks[i]);
        }
        // remove cursor
        window.getSelection().removeAllRanges();
    } else {
        editBlock(block);
    }
}


// EDITING

function closeCurrentBlockAndAddNext() {
    b = getActiveBlock();
    if(b != undefined) {
        nb = insertAfterBlock("",b);
        toggleBlock(b);
        editBlock(nb);
    }
}

/* make sure that the block is in edit mode when calling this function! */
function placeCursor(block, offset) {
    normalizeBlock(block);
    elem = $(block).find(".box-source").get(0);
    for(i = 0; i < elem.childNodes.length; i++) {
        if(elem.childNodes[i].nodeType == Node.TEXT_NODE) {
            s = window.getSelection();
            r = document.createRange();
            r.setStart(elem.childNodes[i], offset);
            r.collapse(false);
            s.removeAllRanges();
            s.addRange(r);
            return;
        }
    }
}

/* inserts text at the end of the block. 
   does *not* trigger a transform. */
function appendTextToBlock(txt, target) {
    t = document.createTextNode(txt);
    $(target).find(".box-source").append(t);
    normalizeBlock(target);
}

/* inserts text at the beginning of the block. 
   does *not* trigger a transform. */
function prependTextToBlock(txt, target) {
    t = document.createTextNode(txt);
    $(target).find(".box-source").prepend(t);
    normalizeBlock(target);
}


function insertText(str) {
    r = window.getSelection().getRangeAt(0);
    t = document.createTextNode(new String(str));
    r.insertNode(t);
    r.setStartAfter(t);
    r.setEndAfter(t);
    r.collapse(false);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
}

function insertNewline() {
    insertText("\n");
 }

function normalizeBlock(target) {
    $(target).get(0).normalize();
    $(target).find(".box-source br").remove();
    $(target).find(".box-source").append(mozDirtyStr);
    $(target).get(0).normalize();    
}

function normalizeActiveBlock() {
    b = getActiveBlock();
    if(b.get(0)) {
        normalizeBlock(b);
    }
}

function splitParagraph() {
    b = getActiveBlock();
    if(b.get(0)) {
        normalizeActiveBlock();
        txt = readBlock($(b).find(".box-source").get(0));
        r = window.getSelection().getRangeAt(0).cloneRange();
        txt1 = "";  // first half of the paragraph source
        txt2 = "";  // second half of the paragraph source
        if(r.startContainer.nodeType == Node.ELEMENT_NODE) {
            // range is on an element, i.e. either at the beginning or
            // end of the paragraph
            if(r.startOffset == 0) {
                // we are at the beginning
                // in this case the *first* of the new paragraphs is empty!
                txt2 = txt;
            } else {
                // we are at the end
                txt1 = txt;
            }
        } else {
            // range is on a text node
            offset = r.startOffset;
            txt1 = txt.slice(0,offset);
            txt2 = txt.slice(offset);
        }
        b2 = insertAfterBlock(txt2,b);
        b1 = insertAfterBlock(txt1,b);
        b.remove();
        transformBlock(b1);
        transformBlock(b2);
        if(txt1 == "") { editBlock(b1); } else { displayBlock(b1); }
        editBlock(b2);
    }
}

function joinPrevious() {
    b = getActiveBlock();
    if(b.get(0)) {
        if(b.prev().get(0)) {
            p = b.prev().get(0);
            prevtxt = readBlock($(p).find(".box-source").get(0));
            thistxt = readBlock(b.find(".box-source").get(0));
            offset = prevtxt.length;
            b.remove();
            appendTextToBlock(thistxt, p);
            transformBlock(p);
            editBlock(p);
            placeCursor(p,offset);
        }
    }
}

function joinNext() {
    b = getActiveBlock();
    if(b.get(0)) {
        if(b.next().get(0)) {
            n = b.next().get(0);
            nexttxt = readBlock($(n).find(".box-source").get(0));
            thistxt = readBlock(b.find(".box-source").get(0));
            offset = thistxt.length;
            $(n).remove();
            appendTextToBlock(nexttxt, b);
            transformBlock(b);
            editBlock(b);
            placeCursor(b,offset);
        }
    }    
}

function moveFocusToPreviousBlock() {
    block = getActiveBlock();
    prev = $(block).prev();
    displayBlock(block);
    editBlock(prev);
    // place caret at end of paragraph
    node = $(prev).find(".box-source").get(0).lastChild;
    r = window.getSelection().getRangeAt(0);
    r.setStartAfter(node);
    r.setEndAfter(node);
    r.collapse(false);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);    
}

function moveFocusToNextBlock() {
    block = getActiveBlock();
    next = $(block).next();
    displayBlock(block);
    editBlock(next);
}

function moveActiveBlockUp() {
    block = getActiveBlock();
    prev = $(block).prev();
    prev.detach();
    prev.insertAfter(block);
}

function moveActiveBlockDown() {
    block = getActiveBlock();
    next = $(block).next();
    next.detach();
    next.insertBefore(block);
}

// COPY AND PASTE

function pasteAtCursorPosition() {
    text = cClipboard.get("text");
    if(text) {
        console.log("Paste!\n");
        console.log(text);
        insertText(text);
    }
}

function copyEverything() {
    cClipboard.set(saveDocumentToText(),"text");
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
        case "meta+s":
        case "f5":
            saveFile();
            return false;
        case "f9":
            openFile();
            return false;
        case "f11":
            toggleFullscreen();
            return false;
        case "f12":
            toggleTwoColumnMode();
            return false;
        case "esc":
            toggleMenu("root");
            return false;
        case "meta+t":
        case "ctrl+t":
            transformAll();
            return false;
        case "return":
            closeCurrentBlockAndAddNext();
            return false;
        case "shift+return":
            console.log("ctrl+enter pressed");
            insertNewline();
            return false;
        case "meta+return":
        case "ctrl+return":
            splitParagraph();
            return false;
        case "meta+v":
        case "ctrl+v":
            pasteAtCursorPosition();
            return false;
        case "meta+up":
        case "ctrl+up":
            moveFocusToPreviousBlock();
            return false;
        case "meta+down":
        case "ctrl+down":
            moveFocusToNextBlock();
            return false;
        case "meta+shift+up":
        case "ctrl+shift+up":
            moveActiveBlockUp();
            return false;
        case "meta+shift+down":
        case "ctrl+shift+down":
            moveActiveBlockDown();
            return false;
        case "meta+backspace":
        case "ctrl+backspace":
            joinPrevious();
            return false;
        case "meta+del":
        case "ctrl+del":
            joinNext();
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
            } /* else if (childNodes[i].nodeType == 1 && $(childNodes[i]).get(0).tagName == "BR") {
                res += "\n";
            } */
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
    editBlock($(".box-container").get(0));
}

function setFont(font) {
    cPrefs.set("font",font);
    $("#thefont").attr("href", "themes/font-"+font+".css");
}

function setTheme(theme) {
    cPrefs.set("theme",theme);
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
    txt = $(".column").html();
    loadDocumentFromText(txt.replace("&gt;",">"));

    $("#notify-area").hide();
    window.resizeTo(960,650);

    setFont(cPrefs.get("font","cosmetica"));
    setTheme(cPrefs.get("theme","subtle-dark"));
});


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
cCProcess = require("child_process");

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


// TRANSFORMERS


// a transformer should be thought of as a function that takes a
// source string and returns an html string. however, due to mathjax
// intricacies this is not sufficient. so, a transformer is a function
// that takes a source string, a block and an outputElt and runs the
// transformation. if mathjax is not needed, the createTransformWrapper
// function can be used.
var transformers = { 
    'md': function(source,block,outputElt) {
        outputElt.innerHTML = source
        MathJax.Hub.Queue(["Typeset",MathJax.Hub,outputElt], // apply MathJax
                          [function(){
                              outputElt.innerHTML = converter.makeHtml(outputElt.innerHTML);  // apply Showdown
                              displayBlock(block);
                          }]);
    }
};

function identityTransform(source) {
    return "<div style='font-family:monospace; font-size:80%; white-space: pre-wrap'>" + source + "</div>"
}

function errorTransform(msg,pos) {
    return function(source){ return "<div style='font-family:monospace; font-size:80%; white-space: pre-wrap'>" + source.substring(0,pos) + "<span style='color: yellow'>" + msg + "</span>" + source.substring(pos,source.length) + "</div>"}
    
}

function createTransformWrapper(f) {
    return function(source,block,outputElt) {
        html = f(source)
        outputElt.innerHTML = html
        displayBlock(block)
    }
}



// TRANSFORMATION

function ometa2js(code) {
    console.log("translating OMeta code...")
    console.log("code is: \n" + code)
    translationError = function(m, code) { alert("Translation error - please tell Alex about this!"); throw fail }
    tree = BSOMetaJSParser.matchAll(code, "topLevel", undefined, function(m, i) { throw objectThatDelegatesTo(fail, {errorPos: i}) })
    console.log("OMetaJS Parse tree: \n" + tree)
    jscode = BSOMetaJSTranslator.match(tree, "trans", undefined, translationError) 
    console.log("Generated JS code: \n" + jscode)
    return jscode
}

function processOMeta(code) {
    jscode = ometa2js(code)
    return eval(jscode)
}

function transformBlock(block) {
    sourceElt = $(block).find(".box-source").get(0);
    outputElt = $(block).find(".box-output").get(0);
    source = readBlock(sourceElt);
    // check if the first characters form a sequence of the form @key:param
    regexp = /^(@(\w*)(:(\w*))?\s)?((.|\n)*)/m
    // example
    // regexp.exec("@foo:bar Hello World!\nHow are you?")
    // ["@foo:bar Hello World!\nHow are you?", "@foo:bar", "foo", ":bar", "bar", "Hello World!\nHow are you?", "?"]
    result = regexp.exec(source)
    hasprefix = (result[1] != null)
    language = result[2]
    param = result[4]
    content = result[5]
    if(hasprefix && language == "ometa") {
        // this block defines a transformer
        console.log("Found a block in the OMeta language...")
        if(param == null) {
            notify("You forgot to name your language! Begin the block with '@ometa:[yourlanguage]'.")
        } else { 
            // we process the ometa code and add the transformer to
            // the map of transformers
            try {
                trafo = processOMeta(content)
                if(typeof trafo == "function") {
                    transformers[param] = createTransformWrapper(trafo)
                    console.log("New transformer for language " + param + " added to collection of transformers.")
                }
            } catch(e) {
                msg = "Your OMeta code is not correct. \n" + e.name + ":\n" + e.message
                notify(msg)
                console.log(msg)
            }
        }
    }
    // we transform the block content and display it
    var transformername = "md" // the defaulttransformer is "md"
    if(hasprefix && language != null) {
        transformername = language
    }
    var thetransformer = transformers[transformername]
    if(thetransformer == null) { 
        // if we don't have a custom transformer for the language, we
        // use the identity transform
        thetransformer = createTransformWrapper(identityTransform)
    }
    try {
        thetransformer(content,block,outputElt)
    } catch(e) {
        pos = (e.errorPos != undefined) ? e.errorPos : 0
        // msg = "Parse error '" + e.name + " " + e.massage + "' :"
        msg = "Parse error:"
        console.log("There was a parse error at pos " + pos + " in the block:\n" + content)
        createTransformWrapper(errorTransform(msg,pos))(content,block,outputElt)
    }
}

function transformAll() {
    $(".box-container").each(function(i, e) { transformBlock(e); })
}

function editBlock(block) {
    sourceElt = $(block).find(".box-source").get(0);
    outputElt = $(block).find(".box-output").get(0);   
    $(sourceElt).removeClass("hidden");
    $(outputElt).addClass("hidden");
    r = document.createRange();
    r.setStart($(sourceElt).get(0),0);
    r.collapse(true);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(r);
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
        finishEditingBlock(block);
    } else {
        editBlock(block);
    }
}

function finishEditingBlock(block) {
    blocks = processBlock(block);
    console.log("toggleBlock: transforming " + blocks.length + " blocks");
    for(i = 0; i < blocks.length; i++) {
        transformBlock(blocks[i]);
    }
    // remove cursor
    window.getSelection().removeAllRanges();
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

function getCursorOffset() {
    b = getActiveBlock();
    if(b.get(0)) {
        normalizeBlock(b);
        r = window.getSelection().getRangeAt(0).cloneRange();
        if(r.startContainer.nodeType == Node.ELEMENT_NODE) {
            // range is on an element, i.e. either at the beginning or
            // end of the paragraph
            if(r.startOffset == 0) {
                // we are at the beginning
                return 0;
            } else {
                // we are at the end
                return readBlock($(b).find(".box-source").get(0)).length;
            }
        } else {
            return r.startOffset;
        }
    }
    return undefined;
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
    offset = getCursorOffset();
    insertText("\n");
    b = getActiveBlock();
    placeCursor(b,offset+1);
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
        offset = getCursorOffset();
        txt1 = txt.slice(0,offset);
        txt2 = txt.slice(offset);
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
    if(prev.length > 0) {
        finishEditingBlock(block);
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
}

function moveFocusToNextBlock() {
    block = getActiveBlock();
    next = $(block).next();
    if(next.length > 0) {
        finishEditingBlock(block);
        editBlock(next);
    }
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
        offset = getCursorOffset();
        insertText(text);
        b = getActiveBlock();
        placeCursor(b,offset+text.length);
    }
}

function copyEverything() {
    cClipboard.set(saveDocumentToText(),"text");
}

function copyOutputToClipboard(mime) {
    cClipboard.set(saveOutputToText(),mime);
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
    thestring = keyboardEventToString(e);
    switch(thestring) {
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
            if($(".box-output").filter(".hidden").length > 0) {
                transformAll();
            } else {
                editBlock($(".box-container").get(0));
            }
            return false;
        case "return":
            splitParagraph();
            return false;
        case "shift+return":
            console.log("ctrl+enter pressed");
            insertNewline();
            return false;
        case "meta+return":
        case "ctrl+return":
            closeCurrentBlockAndAddNext();
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
        case "alt+metaup":
        case "alt+ctrl+up":
            joinPrevious();
            return false;
        case "alt+meta+down":
        case "alt+ctrl+down":
            joinNext();
            return false;
        case "backspace":
            if(window.getSelection().getRangeAt(0).collapsed && getCursorOffset() == 0) {
                joinPrevious();
                return false;
            } else {
                return true;
            }
        case "del":
            if(window.getSelection().getRangeAt(0).collapsed) {
                off = getCursorOffset();
                len = readBlock(getActiveBlock().find(".box-source").get(0)).length;
                if(off == len) {
                    joinNext();
                    return false;
                } else {
                    return true;
                }
            }
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

function saveOutputToText() {
    result = [];
    blockContents = $(".box-output");
    for(var i = 0; i < blockContents.length; i++) {
        result.push( $(blockContents.get(i)).html() );
    }
    return result.join("\n");
}

function saveStringToFile(path, content) {
    var stream = cFile.open(path, "w");
    try {
        stream.write(content);
        notify("Saved " + path  + ".");
    }
    finally {
        stream.close();
    }
}

function saveDocumentToFile(path) {
    saveStringToFile(path, saveDocumentToText());
}

function saveOutputToFile(path,mj) {
    saveStringToFile(path, "<html><head>" + (mj ? "<script type='text/javascript' src='http://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML'></script>" : "") + "</head><body>"  + saveOutputToText() + "</body></html>");
}

function fileName() {
    return $("#panelslider input").val();
}

function readBlock(block) {
    /* these first four lines ensure that block is a .box-source element */
    /*b = $(block).find(".box-source").get(0);
    if(b) {
        block = b;
    }*/
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

function exportHTML(mj) {
    fp = cFilePicker.FilePicker();
    fp.title = "Export HTML";
    fp.mode = "save";
    fp.show(function(x) {
        if (x === undefined) {
            console.log("Export HTML: nothing picked");
        } else {
            console.log("Export HTML: picked " + x);
            saveOutputToFile(x,mj);
        }
    });     
}

function exportLaTeX() {
    fp = cFilePicker.FilePicker();
    fp.title = "Export LaTeX";
    fp.mode = "save";
    fp.show(function(x) {
        if (x === undefined) {
            console.log("Export LaTeX: nothing picked");
        } else if (filename == "") {
            console.log("Export LaTeX: you have to save first");
        } else {
            console.log("Export LaTeX: picked " + x);
            saveFile();
            notify("Running pandoc... If this does not appear to do anything, are you sure you have set the path to pandoc correctly?");
            exe = $("#pandoc-exe").val();
            cPrefs.set("pandoc-exe",exe);
            cCProcess.spawn(exe, ["-f", "markdown", "-t", "latex", "-o", x, filename]);
            notify("Running pandoc succeeded.");
        }
    });     
}


function exportPDF() {
    if (filename == "") {
        console.log("Export PDF: you have to save first");
        notify("You have to save before you can export to PDF!");
        return;
    }
    fp = cFilePicker.FilePicker();
    fp.title = "Export PDF";
    fp.mode = "save";
    fp.show(function(x) {
        if (x === undefined) {
            console.log("Export PDF: nothing picked");
        } else {
            console.log("Export PDF: picked " + x);
            saveFile();
            notify("Running markdown2pdf... If this does not appear to do anything, are you sure you have set the path to markdown2pdf correctly?");
            exe = $("#pandoc-m2p-exe").val();
            cPrefs.set("pandoc-m2p-exe",exe);
            cCProcess.spawn(exe, ["-o", x, filename]);
            notify("Running markdown2pdf succeeded.");
        }
    });     
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
    txt = defaulttxt
    console.log("Initial content:\n"+txt)
    loadDocumentFromText(txt)

    $("#notify-area").hide();
    window.resizeTo(960,650);

    setFont(cPrefs.get("font","cosmetica"));
    setTheme(cPrefs.get("theme","subtle-dark"));
    $("#pandoc-exe").val(cPrefs.get("pandoc-exe","C:\\Program Files (x86)\\Pandoc\\bin\\pandoc.exe"));
    $("#pandoc-m2p-exe").val(cPrefs.get("pandoc-m2p-exe","C:\\Program Files (x86)\\Pandoc\\bin\\markdown2pdf.exe"));
});


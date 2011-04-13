/*
 *  Acunote Shortcuts.
 *
 *  Acunote Shortcuts is a greasemonkey script based on
 *  Javascript Keyboard Shortcuts library extracted from Acunote
 *  http://www.acunote.com/open-source/javascript-keyboard-shortcuts
 *
 *  Adds keyboard navigation for:
 *  Reddit           http://reddit.com
 *  Digg             http://digg.com
 *  YCombinator News http://news.ycombinator.com
 *
 *  Shortcuts Library Copyright (c) 2007-2008 Pluron, Inc.
 *  Reddit, Digg and YCNews Scripts Copyright (c) 2008 Pluron, Inc.
 *  Other scripts are copyright of their respective authors.
 *
 *  Permission is hereby granted, free of charge, to any person obtaining
 *  a copy of this software and associated documentation files (the
 *  "Software"), to deal in the Software without restriction, including
 *  without limitation the rights to use, copy, modify, merge, publish,
 *  distribute, sublicense, and/or sell copies of the Software, and to
 *  permit persons to whom the Software is furnished to do so, subject to
 *  the following conditions:
 *
 *  The above copyright notice and this permission notice shall be
 *  included in all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 *  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 *  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 *  NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
 *  LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
 *  OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
 *  WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

// --------------------------------------------------------------------
//
// ==UserScript==
// @name          Acunote Shortcuts
// @description   Adds cursor and keyboard shortcuts for news.ycombinator.com, reddit.com, and digg.com
// @include       http://news.ycombinator.org*
// @include       http://news.ycombinator.com*
// @include       http://reddit.com*
// @include       http://www.reddit.com*
// @include       http://digg.com*
// @include       http://www.digg.com*
// @include       http://example.com*
// ==/UserScript==


var w = null;
//It is not necessary to use unsafeWindow for non-Firefox browsers
//Opera & WebKit/Safari provide full access to window object;
if (typeof unsafeWindow !== 'undefined') {
    w = unsafeWindow;
} else {
    w = window;
}

/*
 *  ===========================================================
 *  Acunote Shortcuts: The Library
 *  Copyright (c) 2007-2008 Pluron, Inc.
 *  ===========================================================
 */
function ShortcutsSource() {
    var shortcutListener = {

        listen: true,

        shortcut: null,
        combination: '',
        lastKeypress: 0,
        clearTimeout: 2000,

        // Keys we don't listen 
        keys: {
            KEY_BACKSPACE: 8,
            KEY_TAB:       9,
            KEY_ENTER:    13,
            KEY_SHIFT:    16,
            KEY_CTRL:     17,
            KEY_ALT:      18,
            KEY_ESC:      27,
            KEY_SPACE:    32,
            KEY_LEFT:     37,
            KEY_UP:       38,
            KEY_RIGHT:    39,
            KEY_DOWN:     40,
            KEY_DELETE:   46,
            KEY_HOME:     36,
            KEY_END:      35,
            KEY_PAGEUP:   33,
            KEY_PAGEDOWN: 34
        },

        init: function() {
            if (!window.SHORTCUTS) return false;
            this.createStatusArea();
            this.setObserver();
        },

        isInputTarget: function(e) {
            var target = e.target || e.srcElement;
            if (target && target.nodeName) {
                var targetNodeName = target.nodeName.toLowerCase();
                if (targetNodeName == "textarea" || targetNodeName == "select" ||
                    (targetNodeName == "input" && target.type &&
                        (target.type.toLowerCase() == "text" ||
                            target.type.toLowerCase() == "password"))
                                )  {
                    return true;
                }
            }
            return false;
        },

        stopEvent: function(event) {
            if (event.preventDefault) {
                event.preventDefault();
                event.stopPropagation();
            } else {
                event.returnValue = false;
                event.cancelBubble = true;
            }
        },


        // shortcut notification/status area
        createStatusArea: function() {
            var area = document.createElement('div');
            area.setAttribute('id', 'shortcut_status');
            area.style.display = 'none';
            document.body.appendChild(area);
        },

        showStatus: function() {
            document.getElementById('shortcut_status').style.display = '';
        },

        hideStatus: function() {
            document.getElementById('shortcut_status').style.display = 'none';
        },

        showCombination: function() {
            var bar = document.getElementById('shortcut_status');
            bar.innerHTML = this.combination;
            this.showStatus();
        },

        // This method creates event observer for the whole document
        // This is the common way of setting event observer that works 
        // in all modern brwosers with "keypress" fix for
        // Konqueror/Safari/KHTML borrowed from Prototype.js
        setObserver: function() {
            var name = 'keypress';
            if (navigator.appVersion.match(/Konqueror|Safari|KHTML/) || document.detachEvent) {
            name = 'keydown';
            }
            if (document.addEventListener) {
                document.addEventListener(name, function(e) {shortcutListener.keyCollector(e)}, false);
            } else if (document.attachEvent) {
                document.attachEvent('on'+name, function(e) {shortcutListener.keyCollector(e)});
            }
        },

        // Key press collector. Collects all keypresses into combination 
        // and checks it we have action for it
        keyCollector: function(e) {
            // do not listen if no shortcuts defined
            if (!window.SHORTCUTS) return false;
            // do not listen if listener was explicitly turned off
            if (!shortcutListener.listen) return false;
            // leave modifiers for browser
            if (e.altKey || e.ctrlKey || e.metaKey) return false;
            var keyCode = e.keyCode;
            // do not listen for Ctrl, Alt, Tab, Space, Esc and others
            for (var key in this.keys) {
                if (e.keyCode == this.keys[key]) return false;
            }
            // do not listen for functional keys
            if (navigator.userAgent.match(/Gecko/)) {
                if (e.keyCode >= 112 && e.keyCode <=123) return false;
            }
            // do not listen in input/select/textarea fields
            if (this.isInputTarget(e)) return false;
            // get letter pressed for different browsers
            var code = e.which ? e.which : e.keyCode
            var letter = String.fromCharCode(code).toLowerCase();
            if (e.shiftKey) letter = letter.toUpperCase();
            // IE hack to support "?"
            if (window.ie && (code == 191) && e.shiftKey) {
                letter = '?';
            }
            if (shortcutListener.process(letter)) shortcutListener.stopEvent(e);
        },

        // process keys
        process: function(letter) {
            if (!window.SHORTCUTS) return false;
            if (!shortcutListener.listen) return false;
            // if no combination then start from the begining
            if (!shortcutListener.shortcut) { shortcutListener.shortcut = SHORTCUTS; }
            // if unknown letter then say goodbye
            if (!shortcutListener.shortcut[letter]) return false
            if (typeof(shortcutListener.shortcut[letter]) == "function") {
                shortcutListener.shortcut[letter]();
                shortcutListener.clearCombination();
            } else {
                shortcutListener.shortcut = shortcutListener.shortcut[letter];
                // append combination
                shortcutListener.combination = shortcutListener.combination + letter;
                if (shortcutListener.combination.length > 0) {
                    shortcutListener.showCombination();
                    // save last keypress timestamp (for autoclear)
                    var d = new Date;
                    shortcutListener.lastKeypress = d.getTime();
                    // autoclear combination in 2 seconds
                    setTimeout("shortcutListener.clearCombinationOnTimeout()", shortcutListener.clearTimeout);
                };
            }
            return true;
        },

        // clear combination
        clearCombination: function() {
            shortcutListener.shortcut = null;
            shortcutListener.combination = '';
            this.hideStatus();
        },

        clearCombinationOnTimeout: function() {
            var d = new Date;
            // check if last keypress was earlier than (now - clearTimeout)
            // 100ms here is used just to be sure that this will work in superfast browsers :)
            if ((d.getTime() - shortcutListener.lastKeypress) >= (shortcutListener.clearTimeout - 100)) {
                shortcutListener.clearCombination();
            }
        }
    }
}



/*
 *  ===========================================================
 *  Acunote Shortcuts: Reddit Support
 *  Copyright (c) 2008 Pluron, Inc.
 *  ===========================================================
 */
function RedditSource() {
    var RCursorHelp =
        '=== Cursor Movement ===\n' +
        'j - move cursor up\n' +
        'k - move cursor down\n' +
        '\n=== Post Management ===\n' +
        'o, <Enter> - open original post\n'+
        '<Shift>+o - open comments\n' +
        'u - back to news list\n' +
        '\n=== Voting ===\n' +
        'v u - vote up\n' +
        'v d - vote down\n' +
        '\n=== Other ===\n' +
        '? - this help\n';

    var RCursorStyles = 
        '#shortcut_status { background: #f00;color: #fff;padding: 5px;position: absolute;bottom: 10px;right: 10px;}\n';


    var Cursor = {

        siteTable: null,
        siteTablePos: null,
        things: [],

        current: 0,

        init: function() {
            this.addStyles(RCursorStyles);
            this.siteTable = $('siteTable');

            if (this.siteTable) {
                this.siteTablePos = this.findPos(this.siteTable);
                this.things = document.querySelectorAll('#siteTable .thing');
                if (this.things) {
                    this.current = 0;
                    if (typeof readCookie !== 'undefined' && readCookie('jumpToLast')) {
                        this.showCursor(this.things.length - 1);
                        createCookie('jumpToLast', '0', -1);
                    } else
                        this.showCursor(this.current);
                }
            }
            shortcutListener.init();
        },

        next: function() {
            var i = this.current + 1;
            if (i >= this.things.length) {
                this.nextPage();
                return false;
            }
            this.showCursor(i);
        },

        previous: function() {
            var i = this.current - 1;
            if (i < 0) {
                this.previousPage(true);
                return false;
            }
            this.showCursor(i);
        },

        nextPage: function() {
            this.prevOrNextPage('next');
        },

        previousPage: function(setCursorToLastPosition) {
            setCursorToLastPosition = setCursorToLastPosition || false;
            this.prevOrNextPage('prev', setCursorToLastPosition);
        },

        prevOrNextPage: function(mode, setCursorToLastPosition) {
            var element = document.querySelector('p.nextprev a[rel]');
            if (element && element.innerHTML == mode) {
                if (setCursorToLastPosition) {
                    createCookie && createCookie('jumpToLast', '1', 0);
                }
                location.href = element.getAttribute('href');
            }
        },

        showCursor: function(i) {
            if (i < 0) return false;
            this.hideCursor(this.current);

            var row = this.things[i];
                numberNode = row.querySelector('.rank'),
                link = this.getLink(row);
                
            numberNode.style.color = 'black';
            numberNode.style.borderBottom = 'medium solid black'

            // move focus with cursor
            link && link.focus();

            var offset = window.pageYOffset,
                innerHeight = window.innerHeight,
                cursorPos = this.findPos(row);
                
            if ( (cursorPos < (offset + 58)) || (cursorPos > (offset+innerHeight-58))) {
                window.scrollTo(0, cursorPos - (innerHeight/2))
            }
            
            this.current = i;
        },
        getLink: function(row) {
            return row.querySelector('.title a.title');
        },
        getCommentLink: function(row) {
            return row.querySelector('.comments');
        },
        getCurrentRow : function() {
            return this.things[this.current];
        },

        hideCursor: function(i) {
            var row = this.things[i],
                numberNode = row.querySelector('.rank');

            numberNode.style.color = 'darkgray';
            numberNode.style.borderBottom = 'none';
        },

        voteUp: function() {
            this.getCurrentRow().querySelector('.midcol .arrow.up').onclick();
        },

        voteDown: function() {
            this.getCurrentRow().querySelector('.midcol .arrow.down').onclick();
        },

        openLink: function() {
            window.location.href = this.getLink(this.getCurrentRow()).getAttribute('href');
        },

        openComments: function() {
            window.location.href = this.getCommentLink(this.getCurrentRow()).getAttribute('href');
        },

        goBack: function() {
            if (
                window.location.href.match('comments') ||
                window.location.href.match('user') 
            ) {
                window.history.back();
            }
        },

        help: function() {
            alert(RCursorHelp);
        },

        findPos: function (obj) {
            if (!obj) return 0;
            var curtop = 0;
            if (obj.offsetParent) {
                curtop = obj.offsetTop;
                while (obj = obj.offsetParent) {
                    curtop += obj.offsetTop;
                }
            }
            return curtop;
        },

        findRowPos: function(row) {
            if (!row) return 0;
            return this.siteTablePos + row.offsetTop;
        },

        addStyles: function(css) {
            var head, style, text;
            head = document.getElementsByTagName('head')[0];
            if (!head) { return; }
            style = document.createElement('style');
            style.type = 'text/css';
            text = document.createTextNode(css);
            style.appendChild(text);
            head.appendChild(style);
        }

    }


    var SHORTCUTS = {
        '?': function() { Cursor.help(); },
        'h': function() { Cursor.help(); },
        'j': function() { Cursor.next(); },
        'k': function() { Cursor.previous(); },
        'o': function() { Cursor.openLink(); },
        'O': function() { Cursor.openComments(); },
        'u': function() { Cursor.goBack(); },
        'v': {
            'u': function() { Cursor.voteUp(); },
            'd': function() { Cursor.voteDown(); },
        }
    }
}



/*
 *  ===========================================================
 *  Acunote Shortcuts: YCNews Support
 *  Copyright (c) 2008 Pluron, Inc.
 *  ===========================================================
 */
function YCombinatorSource() {
    var YCCursorImageData = "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%09%00%00%00%0B%08%06%00%00%00%ADY%A7%1B%00%00%00%06bKGD%00%FF%00%FF%00%FF%A0%BD%A7%93%00%00%00%09pHYs%00%00%0D%3A%00%00%0D%3A%01%03%22%1E%85%00%00%00%07tIME%07%D6%0B%10%090%06%16%8E%9BU%00%00%00%1DtEXtComment%00Created%20with%20The%20GIMP%EFd%25n%00%00%00PIDAT%18%D3%8D%D0%A1%0E%C0%20%0C%84%E1%BF%E7%B0(%DE%FF%E9PXd%A7XH%B7%95%9Dl%BE%E6%9A%1A%E0l%E9c%1A!%8A%C3V%8B%3F%D0%DBv%84%FA%AA%D9%A1%B2%7B%16%14%87%B4Z%FC%88%FA%98%A6%EC%E0U%AF%13%B8Q%06%00%EC%CF%C7%2F%C8T'%AFF%81S%0A%00%00%00%00IEND%AEB%60%82"

    var YCCursorStyles = 
        '#shortcut_status { background: #f00;color: #fff;padding: 5px;position: absolute;top: 10px;right: 10px;}\n'+
        '.cursor {position:absolute; margin-top: 4px;}';


    var YCCursorHelp =
                '=== Cursor Movement ===\n' +
                'j - move cursor up\n' +
                'k - move cursor down\n' +
                '\n=== Post Management ===\n' +
                'o, <Enter> - open original post\n'+
                '<Shift>+o - open comments\n' +
                'u - back to news list\n' +
                '\n=== Voting ===\n' +
                'v u - vote up\n' +
                '\n=== Browsing ===\n' +
                'g i - open "index" page\n' +
                'g n - open "newest" page\n' +
                '\n=== Other ===\n' +
                '? - this help\n';


    var Cursor = {

        cursors: 0,
        current: 0,
        nextPageUrl: null,

        init: function() {
            this.addStyles(YCCursorStyles);
            var table = document.getElementsByTagName('table')[2];
            if (!table) return false;
            var cursorLeft = this.findPosX(table) - 15;
            var rows = table.tBodies[0].rows;
            if (rows.length == 0) return false;
            var j = 0;
            for(var i=0; i<rows.length;i++) {
                var row = rows[i];
                if (row.cells[0] && row.cells[0].className == 'title') {
                    j++;
                    // set id on post link
                    var link = row.cells[2].getElementsByTagName('a')[0];
                    link.setAttribute('id', 'post_link_'+j);
                    // set id on vote td
                    var voteCell = rows[i].cells[1];
                    if (voteCell) voteCell.setAttribute('id', 'vote_'+j);
                    // Create cursor
                    var cell = rows[i].cells[0];
                    var img = document.createElement('img');
                    img.className = "cursor";
                    img.src = YCCursorImageData;
                    img.style.display = 'none';
                    img.style.left = cursorLeft + 'px';
                    img.setAttribute('id', 'cursor_'+j);
                    cell.insertBefore(img, cell.firstChild);
                    // set id on author link
                    var authorLink = rows[i+1].getElementsByTagName('a')[0];
                    if (authorLink) authorLink.setAttribute('id', 'author_link_'+j);
                    // set id on comments link
                    var commentLink = rows[i+1].getElementsByTagName('a')[2];
                    if (commentLink) commentLink.setAttribute('id', 'comment_link_'+j);
                }
                // Try to gen link to the next page
                if ((i == rows.length-1)) {
                    var a = rows[i].getElementsByTagName('a')[0];
                    if (a && a.innerHTML == "More") {
                        this.nextPageUrl = a.getAttribute('href');
                    }
                }
            }
            this.cursors = j;
            this.current = 1;
            this.showCursor(this.current);
            shortcutListener.init();
        },

        next: function() {
            var i = this.current + 1;
            if (i > this.cursors) {
                if (!this.nextPageUrl) return false;
                location.href = this.nextPageUrl;
            }
            this.showCursor(i);
        },

        previous: function() {
            var i = this.current - 1;
            if (i < 1) return false;    
            this.showCursor(i);
        },

        showCursor: function(i) {
            if (i<=0) return false;
            this.hideCursor(this.current);
            var c = document.getElementById('cursor_'+i);
            if (!c) return false;
            c.style.display = '';
            this.current = i;

            var offset = window.pageYOffset;
            var innerHeight = window.innerHeight;
            var cursorPos = this.findPosY(c);
            if ( (cursorPos < (offset + 30)) || (cursorPos > (offset+innerHeight-30))) {
                window.scrollTo(0, cursorPos - (innerHeight/2))
            }

            document.getElementById('post_link_'+i).focus();

        },

        hideCursor: function(i) {
            var c = document.getElementById('cursor_'+i);
            if (!c) return false;
            c.style.display = 'none';
        },

        jump: function(where) {
            var linkId = where + '_link_';
            var a = document.getElementById(linkId+this.current);
            if (a) location.href = a.getAttribute('href');
        },

        vote: function() {
            var cell = document.getElementById('vote_'+this.current);
            var links = cell.getElementsByTagName('a');
            for(var i=0; i<links.length;i++) {
                var a = links[i];
                if (a.getAttribute('id').match('up')) {
                    if (a.getAttribute('onclick')) {
                        vote(a);
                    } else {
                        location.href = a.getAttribute('href');
                    }
                }
            }
        },

        back: function() {
            if (location.href.match('item')) history.back();
        },

        help: function() {
            alert(YCCursorHelp);
        },

        findPosY: function (obj) {
            if (!obj) return 0;
            var curtop = 0;
            if (obj.offsetParent) {
                curtop = obj.offsetTop;
                while (obj = obj.offsetParent) {
                    curtop += obj.offsetTop;
                }
            }
            return curtop;
        },

        findPosX: function (obj) {
            if (!obj) return 0;
            var curleft = 0;
            if (obj.offsetParent) {
                curleft = obj.offsetLeft;
                while (obj = obj.offsetParent) {
                    curleft += obj.offsetLeft;
                }
            }
            return curleft;
        },

        addStyles: function(css) {
            var head, style, text;
            head = document.getElementsByTagName('head')[0];
            if (!head) { return; }
            style = document.createElement('style');
            style.type = 'text/css';
            text = document.createTextNode(css);
            style.appendChild(text);
            head.appendChild(style);
        }

    }


    var SHORTCUTS = {
        '?': function() { Cursor.help(); },
        'h': function() { Cursor.help(); },
        'j': function() { Cursor.next();},
        'k': function() { Cursor.previous();},
        'O': function() { Cursor.jump('comment');},
        'o': function() { Cursor.jump('post');},
        'v': {
            'u': function() { Cursor.vote();}
        },
        'u': function() { Cursor.back();},
        'g': {
            'i': function() { location.href = '/'; },
            'n': function() { location.href = '/newest'; }
        }
    }
}




/*
 *  ===========================================================
 *  Shortcuts Library: Digg Support
 *  Copyright (c) 2008 Pluron, Inc.
 *  ===========================================================
 */
function DiggSource() {
    var CursorImageData = "data:image/png,%89PNG%0D%0A%1A%0A%00%00%00%0DIHDR%00%00%00%09%00%00%00%0B%08%06%00%00%00%ADY%A7%1B%00%00%00%06bKGD%00%FF%00%FF%00%FF%A0%BD%A7%93%00%00%00%09pHYs%00%00%0D%3A%00%00%0D%3A%01%03%22%1E%85%00%00%00%07tIME%07%D6%0B%10%090%06%16%8E%9BU%00%00%00%1DtEXtComment%00Created%20with%20The%20GIMP%EFd%25n%00%00%00PIDAT%18%D3%8D%D0%A1%0E%C0%20%0C%84%E1%BF%E7%B0(%DE%FF%E9PXd%A7XH%B7%95%9Dl%BE%E6%9A%1A%E0l%E9c%1A!%8A%C3V%8B%3F%D0%DBv%84%FA%AA%D9%A1%B2%7B%16%14%87%B4Z%FC%88%FA%98%A6%EC%E0U%AF%13%B8Q%06%00%EC%CF%C7%2F%C8T'%AFF%81S%0A%00%00%00%00IEND%AEB%60%82"

    var CursorStyles = 
        '#shortcut_status { background: #f00;color: #fff;padding: 5px;position: absolute;top: 10px;right: 10px;}\n'+
        '.cursor {position:absolute; margin-top: 5px; margin-left: 55px;}\n' + 
        '.news-body {padding-left: 70px;}\n' +
        'span.news-img {left: 70px;}';
    ;


    var CursorHelp =
        '=== Cursor Movement ===\n' +
        'j - move cursor up\n' +
        'k - move cursor down\n' +
        '\n=== Post Management ===\n' +
        'o, <Enter> - open original post\n'+
        '<Shift>+o - open comments\n' +
        'u - back to news list\n' +
        '\n=== Voting ===\n' +
        'd, v u - vote up ("digg it")\n' +
        '\n=== Other ===\n' +
        '? - this help\n';


    var Cursor = {

        cursors: 0,
        current: -1,
        buried: [],

        init: function() {
            if (!document.getElementById('sub-nav')) {
                this.addStyles(CursorStyles);
                var table = document.getElementById('wrapper');
                if (!table) return false;
                var rows = table.getElementsByTagName('div');
                if (rows.length == 0) return false;
                var j = 0;
                for(var i=0; i<rows.length;i++) {
                    var row = rows[i];
                    var rowId = row.getAttribute('id');
                    if (rowId && rowId.match('enclosure')) {
                        // Create cursor
                        var img = document.createElement('img');
                        img.className = "cursor";
                        img.src = CursorImageData;
                        img.style.display = 'none';
                        img.setAttribute('id', 'cursor_'+j);
                        row.insertBefore(img, row.firstChild);
                        j++;
                    }
                }
                this.cursors = j;
                this.current = 0;
                this.showCursor(this.current);
            }
            shortcutListener.init();
        },

        isBuried: function(index) {
            for (var i=0;i<this.buried.length;i++) {
                if (index == this.buried[i]) return true;
            }
            return false;
        },

        next: function() {
            var i = this.current + 1;
            if (i >= this.cursors) {
                this.goPage('next');
            }
            if (this.isBuried(i)) {
                this.showCursor(i);
                this.next();
                return;
            }
            this.showCursor(i);
        },

        previous: function() {
            var i = this.current - 1;
            if (i < 0) {
                this.goPage('previous');
            };    
            if (this.isBuried(i)) {
                this.showCursor(i);
                this.previous();
                return;
            }
            this.showCursor(i);
        },

        showCursor: function(i) {
            if (i<0) return false;
            this.hideCursor(this.current);
            var c = document.getElementById('cursor_'+i);
            if (!c) return false;
            c.style.display = '';
            this.current = i;

            var offset = window.pageYOffset;
            var innerHeight = window.innerHeight;
            var cursorPos = this.findPosY(c);
            if ( (cursorPos < (offset + 30)) || (cursorPos > (offset+innerHeight-30))) {
                window.scrollTo(0, cursorPos - (innerHeight/2))
            }

            // Move focus to post link
            var a  = this.getPostLink(i);
            if (a) a.focus();
        },

        hideCursor: function(i) {
            var c = document.getElementById('cursor_'+i);
            if (!c) return false;
            c.style.display = 'none';
        },

        getPostLink: function(i) {
            // Due to error in digg's layout we get should get heading this funny way
            var elem = document.getElementById('enclosure'+i);
            if (!elem) return false;
            var h3s = elem.getElementsByTagName('h3');
            if (!h3s) return false;
            var h3 = h3s[0];
            return h3.getElementsByTagName('a')[0];
        },

        getToolLink: function(i, className) {
            var elem = document.getElementById('enclosure'+i);
            if (!elem) return null;
            var links = elem.getElementsByTagName('a');
            for(var i=0; i<links.length; i++) {
                if (links[i].className.match(className)) {
                    return links[i];
                }
            }
            return null;
        },

        jump: function(where) {
            var a = null;
            if (where == 'post') {
                a = this.getPostLink(this.current);
            } else if (where == 'comments') {
                a = this.getToolLink(this.current, 'comments');
            } else {
                return false;
            }
            if (a) location.href = a.getAttribute('href');
        },

        goPage: function(where) {
            var href = location.href;
            var matches = location.href.match(/page(\d+)$/);
            if (!matches) {
                if (where == 'next') {
                location.href = '/page2';
                } else {
                return false;
                }
            } else {
                var pageNum = parseInt(matches[1]);
                if (where == 'next') {
                    pageNum++;
                } else {
                    pageNum--;
                }
                if (pageNum==1) {
                    location.href='/';
                } else {
                    location.href='/page'+pageNum;
                }
            } 
        },

        digg: function() {
            if (!this.isLoggedIn()) {
                poppd(this.current);
            } else {
                var li = document.getElementById('diglink'+this.current);
                var a = li.getElementsByTagName('a')[0];
                if (!a) return false;
                var href = a.getAttribute('href');
                var code = href.substring(11);
                eval(code);
            };
        },

        bury: function() {
            if (!this.isLoggedIn()) {
                poppr(this.current);
            } else {
                var div = document.getElementById('burytool'+this.current);
                if (!div) return false;
                var diglink = document.getElementById('diglink'+this.current);
                if (diglink && (diglink.className == 'buried-it')) {
                    return false;
                }
                var a = div.getElementsByTagName('a')[0];
                var href = a.getAttribute('href');
                var code = href.substring(11);
                eval(code);
                this.buried.push(this.current);
                this.next();
            };
        },

        isLoggedIn: function() {
            return document.getElementById('section-profile');
        },

        back: function() {
            if (document.getElementById('sub-nav')) history.back();
        },

        help: function() {
            alert(CursorHelp);
        },

        findPosY: function (obj) {
            if (!obj) return 0;
            var curtop = 0;
            if (obj.offsetParent) {
                curtop = obj.offsetTop;
                while (obj = obj.offsetParent) {
                    curtop += obj.offsetTop;
                }
            }
            return curtop;
        },

        findPosX: function (obj) {
            if (!obj) return 0;
            var curleft = 0;
            if (obj.offsetParent) {
                curleft = obj.offsetLeft;
                while (obj = obj.offsetParent) {
                    curleft += obj.offsetLeft;
                }
            }
            return curleft;
        },

        addStyles: function(css) {
            var head, style, text;
            head = document.getElementsByTagName('head')[0];
            if (!head) { return; }
            style = document.createElement('style');
            style.type = 'text/css';
            text = document.createTextNode(css);
            style.appendChild(text);
            head.appendChild(style);
        }

    }


    var SHORTCUTS = {
        '?': function() { Cursor.help(); },
        'h': function() { Cursor.help(); },

        'j': function() { Cursor.next();},
        'k': function() { Cursor.previous();},
        'd': function() { Cursor.digg();},
        'o': function() { Cursor.jump('post');},

        'O': function() { Cursor.jump('comments');},
        'u': function() { Cursor.back();},

        'v': {
            'u': function() { Cursor.digg();},
            'd': function() { Cursor.bury();}
        }

    }
}




// Please add your scripts here. Copy and paste the dummy script definition
// and modify it to your needs.
// Don't forget to modify the big supported sites map at the end of this file
// to turn your script on.

/*
 *  ===========================================================
 *  Shortcuts Library: Dummy Script
 *  Copyright (c) Year Author
 *  ===========================================================
 */
function DummySource() {
    var Cursor = {

        init: function() {
            shortcutListener.init();
        },

        help: function() {
            alert('Dummy shortcuts script works!');
        }

    }

    var SHORTCUTS = {
        '?': function() { Cursor.help(); },
        'h': function() { Cursor.help(); },
    }
}




/*
 *  ===========================================================
 *  Shortcuts Library: Supported Sites
 *  This greasemonkey script matches site URL against the
 *  property name and gets the source of the function
 *  specified as property value.
 *  ===========================================================
 */
var SupportedSites = {
    'ycombinator':      YCombinatorSource,
    'reddit':           RedditSource,
    'digg':             DiggSource,
    'example.com':      DummySource
}




/*
 *  ===========================================================
 *  Shortcuts Library: Loader
 *  Copyright (c) 2008 Pluron, Inc.
 *  ===========================================================
 */
var addScript = function(ShortcutsSource) {
    var getSource = function (func) {
        var js = func.toString(),
            i = js.indexOf('{');
        js = js.substr(i + 1, js.length - i - 2);
        return js;
    }
    var script = document.createElement('script'),
        source = getSource(ShortcutsSource);
    
    for (site in SupportedSites) {
        if (typeof(site) != 'string')
            continue;
        if (location.href.match(site)) {
            source += getSource(SupportedSites[site]) + '\n window.Cursor.init();';
            break;
        }
    }
    
    var text = document.createTextNode(source);
    script.appendChild(text);
    script.setAttribute('id','acunoteKeyboardShortcuts');
    if (!document.getElementById('acunoteKeyboardShortcuts')) {
        document.body.appendChild(script);
    }
}
addScript(ShortcutsSource);

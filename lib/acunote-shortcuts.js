/*
 *  Acunote Shortcuts.
 *  Javascript keyboard shortcuts mini-framework.
 *
 *  Copyright (c) 2007-2008 Pluron, Inc.
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
    shiftNums : {
        '1' : '!',
        '2' : '@',
        '3' : '#',
        '4' : '$',
        '5' : '%',
        '6' : '^',
        '7' : '&',
        '8' : '*',
        '9' : '(',
        '0' : ')'
    },

    init: function() {
        var dummy = function(e, l){
            window.setTimeout(function() {
                shortcutListener.statusNode.innerHTML = 'executed: ' + l;
                shortcutListener.showStatus();
                window.setTimeout(function() {
                    shortcutListener.hideStatus();
                }, 1000)
            }, 10)
        };
        var modifiers = {
            'C-a'  : dummy,
            'C-c'  : dummy,
            'C-s'  : dummy,
            'C-f'  : dummy,
            'M-a'  : dummy,
            'M-c'  : dummy,
            'M-s'  : dummy,
            'M-f'  : dummy,
            'CA-a' : dummy,
            'CA-c' : dummy,
            'CA-s' : dummy,
            'CA-f' : dummy,
            'CA-p' : dummy,
            'CA-o' : dummy,
            'A-a'  : dummy,
            'A-c'  : dummy,
            'A-s'  : dummy,
            'A-f'  : dummy,
            'A-p'  : dummy,
            'A-o'  : dummy,
            'a'    : dummy
        }
        window.SHORTCUTS = $H(window.SHORTCUTS).merge(modifiers).toObject();
        if (!window.SHORTCUTS) return false;
        this.createStatusArea();
        this.setObserver();
    },

    isInputTarget: function(e) {
        var target = e.target || e.srcElement;
        if (target && target.nodeName) {
            if (/textarea|select|input/.test(target.nodeName.toLowerCase()) && 
                target.type && /text|password/.test(target.type.toLowerCase())) {
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
        return false;
    },


    // shortcut notification/status area
    createStatusArea: function() {
        this.statusNode = document.createElement('div');
        this.statusNode.setAttribute('id', 'shortcut_status');
        this.statusNode.style.display = 'none';
        document.body.appendChild(this.statusNode);
    },

    showStatus: function() {
        this.statusNode.style.display = '';
    },

    hideStatus: function() {
        this.statusNode.style.display = 'none';
    },

    showCombination: function() {
        this.statusNode.innerHTML = this.combination;
        this.showStatus();
    },

    // use keypress for Gecko and Opera and keydown for Safari, Chrome and K
    // Konqueror/Safari/KHTML borrowed from Prototype.js
    eventType : function() {
        return (/Konqueror|Safari|KHTML|MSIE/.test(navigator.userAgent)) ? 'keydown' : 'keypress';
    },
    setObserver: function() {
        var listener = function(e) {shortcutListener.keyCollector(e)};
        if (document.addEventListener) {
            document.addEventListener(this.eventType(), listener, false);
        } else if (document.attachEvent) {
            document.attachEvent('on' + this.eventType(), listener);
        }
    },

    // Key press collector. Collects all keypresses into combination 
    // and checks it we have action for it
    keyCollector: function(e) {
        // do not listen if listener was explicitly turned off
        if (!shortcutListener.listen) return true;
        
        // do not listen in input/select/textarea fields
        if (this.isInputTarget(e)) return true;
        
        // do not listen for functional keys
        var isFunctional = function(e) {
            // IE doesn't stop default F-keys actions, so it doesn't need this
            if (!/MSIE/.test(navigator.userAgent)) {
                if (!e.keyIdentifier) {
                    // when only keyCode filled and keyCode is in a range - key is functional
                    return (!e.which && !e.charCode && e.keyCode >= 112 && e.keyCode <= 123)
                } else {
                    // in WebKit keyIdentifier is filled with FNN string
                    return (/^F\d+$/.test(e.keyIdentifier))
                }
                
            }
        }
        if (isFunctional(e)) return true;
        
        // get pressed key code
        var code = e.which ? e.which : e.keyCode;
        
        // do not listen for Ctrl, Alt, Tab, Space, Esc and others
        for (var key in this.keys) {
            if (code == this.keys[key]) return true;
        }
        
        var letter = String.fromCharCode(code).toLowerCase();
        
        if (e.shiftKey) {
            letter = letter.toUpperCase();
            // uppercase() or lowercase() for numbers aren't crossbrowser, so we'll do it
            if (/^\d$/.test(letter)) {
                letter = this.shiftNums[letter];
            }
            // IE hack to support "?"
            if (!+"\v1" && (code == 191)) {
                letter = '?';
            }

        }
        if (e.altKey || e.ctrlKey || e.metaKey) {
            letter = '-' + letter;
        }
        
        if (e.altKey) {
            letter = 'A' + letter;
        }
        if (e.ctrlKey) {
            letter = 'C' + letter;
        }
        if (e.metaKey) {
            letter = 'M' + letter;
        }
        if (shortcutListener.process(letter)) {
            shortcutListener.stopEvent(e);
        } 
    },

    // process keys
    process: function(letter) {
        // if no combination then start from the begining
        if (!shortcutListener.shortcut) { shortcutListener.shortcut = SHORTCUTS; }
        // if unknown letter then say goodbye
        if (!shortcutListener.shortcut[letter]) return false;
        if (typeof(shortcutListener.shortcut[letter]) == "function") {
            shortcutListener.shortcut[letter](e, letter);
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
                setTimeout(shortcutListener.clearCombinationOnTimeout, shortcutListener.clearTimeout);
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

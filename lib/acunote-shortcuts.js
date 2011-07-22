/*
 *  Acunote Shortcuts.
 *  Javascript keyboard shortcuts mini-framework.
 *
 *  Copyright (c) 2007-2011 Pluron, Inc.
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
    // adapted map from keycode.js
    map : {
        186: 59,  // ;: in IE
        187: 61,  // =+ in IE
        188: 44,  // ,<
        189: 95,  // -_ in IE
        190: 62,  // .>
        191: 47,  // /?
        192: 126, // `~
        219: 91,  // {[
        220: 92,  // \|
        221: 93   // }]
    },
    // adapted map from keycode.js
    // revesed key-value, since we need to shift char, and they need to un-shift
    shifted : {
        59  : 58,   // ;   -> :
        61  : 43,   // +   -> =
        44  : 60,   // ,   -> <
        45  : 95,   // -   -> _
        46  : 62,   // .   -> >
        47  : 63,   // /   -> ?
        192 : 96,   // ~   -> `
        92  : 124,  // \   -> |
        222 : 39,   // 222 -> '
        222 : 34,   // 222 -> "
        49  : 33,   // 1   -> !
        50  : 64,   // 2   -> @
        51  : 35,   // 3   -> #
        52  : 36,   // 4   -> $
        53  : 37,   // 5   -> %
        54  : 94,   // 6   -> ^
        55  : 38,   // 7   -> &
        56  : 42,   // 8   -> *
        57  : 40,   // 9   -> (
        58  : 41,   // 0   -> )
        91  : 123,  // [   -> {
        93  : 125   // ]   -> }
    },
    UA : {
        gecko   : navigator.userAgent.indexOf('Gecko') != -1, // chrome fits here
        ie      : navigator.userAgent.indexOf('MSIE') != -1,
        opera   : window.opera,
        webkit  : (/Safari|Chrome/.test(navigator.userAgent)),
        konq    : (/Konqueror/.test(navigator.userAgent))
    },
    init: function() {
        if (!window.SHORTCUTS) return false;
        this.createStatusArea();
        
        // opera and webkit needs special keymap for certain symbols
        // it produced from shifted map
        // adapted code from keymap.js
        if (this.UA.opera) {
            this.map = {}, reverse = {}
            for (var key in this.shifted) {
                reverse[this.shifted[key]] = key;
            }
            var unshift = [33, 64, 35, 36, 37, 94, 38, 42, 40, 41, 58, 43, 60, 95, 62, 63, 124, 34];
            for (var i = 0; i < unshift.length; ++i) {
                this.map[unshift[i]] = reverse[unshift[i]];
            }
        }
        
        if (this.UA.konq) {
            this.map[0]   = 45;
            this.map[127] = 46;
            this.map[45]  = 95;
        }
        
        this.setObserver();
    },

    isInputTarget: function(e) {
        var target = e.target || e.srcElement,
            targetNodeName = target.nodeName.toLowerCase();
        if (targetNodeName == 'textarea' || targetNodeName == 'select' ||
            (targetNodeName == 'input' && target.type &&
                (target.type.toLowerCase() == 'text' || target.type.toLowerCase() == 'password'))) {
            return true;
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
    eventType : function() {
        return (this.UA.ie || this.UA.webkit || this.UA.konq) ? 'keydown' : 'keypress';
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
        
        // do not listen for functional keys
        var isFunctional = (function(e) {
            // IE doesn't stop default F-keys actions, so it doesn't need this
            if (!this.UA.ie) {
                if (!e.keyIdentifier) {
                    // when only keyCode filled and keyCode is in a range - key is functional
                    return (!e.which && !e.charCode && e.keyCode >= 112 && e.keyCode <= 123)
                } else {
                    // in WebKit keyIdentifier is filled with FNN string
                    return (/^F\d+$/.test(e.keyIdentifier))
                }
                
            }
        }).bind(this)
        if (isFunctional(e)) return true;
        
        // get pressed key code
        var code = e.which ? e.which : e.keyCode;
        code = this.map[code] || code;
        // shifting char manually for desired browsers
        if (e.shiftKey && (this.UA.ie || this.UA.opera || this.UA.webkit)) {
            code = this.shifted[code] || code;
        }
        
        // do not listen for Ctrl, Alt, Tab, Space and others
        for (var key in this.keys) {
            if (this.UA.gecko) {
                if ((e.keyCode && e.keyCode == this.keys[key])) return true;
            } else {
                if (code == this.keys[key]) return true;
            }
        }
        
        var letter = null;
        // adds ability to add shortcut to Esc key
        if (code != 27) {
            letter = String.fromCharCode(code).toLowerCase();
        } else {
            letter = 'Esc'
        }

        // do not listen in input/select/textarea fields
        // unless we pressed Esc or the modifier
        if (this.isInputTarget(e) && !(letter == 'Esc' || e.altKey || e.ctrlKey || e.metaKey)) return true;

        if (e.shiftKey) {
            letter = letter.toUpperCase()
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
        if (shortcutListener.process(letter, e)) {
            shortcutListener.stopEvent(e);
        } 
    },

    // process keys
    process: function(letter, e) {
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

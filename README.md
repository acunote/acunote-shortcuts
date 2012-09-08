# Acunote's JavaScript Keyboard Shortcuts Framework


## Overview

Acunote Shortcuts is a JavaScript library providing everything you need to make add rich keyboard shortcut functionality to a web application.  With a few lines of code you can have Gmail-like single and multi-key keyboard shortcuts covering the essential functionality.

Acunote Shortcuts was extracted from Acunote, an <a href="http://www.acunote.com">online project management application</a> for Scrum, XP, Agile and common sense.


## Try It
Firefox extension and Greasemonkey script to add keyboard shortcuts to hacker news (news.ycombinator.com), reddit, digg and Redmine:
* [Mozilla Firefox Extension](https://github.com/acunote/acunote-shortcuts/raw/master/extension/acunote-shortcuts.xpi)
* [Greasemonkey Script](https://github.com/acunote/acunote-shortcuts/raw/master/greasemonkey/acunote-shortcuts.user.js)


## Features

*   Simple to use: just declare a keymap defining what key sequences to
    bind to what functions and the library does the rest.
*   Supports single key (e.g. "j") and compound key sequence shortcuts
    (e.g. "g i") of any length.
*   Supports binding of any letter, number, symbol, punctuation keys.
    &lt;Shift&gt; modifier is also supported. (e.g. "?").
*   Works in Mozilla Firefox 1+, Internet Explorer 6+,
    Opera 8+, Safari.</li>
*   Lightweight, does not depend on any other JavaScript library.
*   Visual feedback in the echo area.
*   Optional Ruby on Rails helper provides convenient way to define
    shortcuts from Ruby. Global and page-specific keymap are supported
    and are merged at the runtime.
*   Greasemonkey userscript with an examples of using adding shortcuts
    to News.YC, Reddit, Digg and Redmine. Includes code to add Gmail-style cursor.
*   Open Source, MIT license.


## Four Simple Steps To Use Shortcuts from Pure JavaScript

1. <a href="https://github.com/acunote/acunote-shortcuts/tarball/master">Download</a> the archive and unpack it to your web site or application directory.
2. Include shortcuts library and styles somewhere inside &lt;head&gt; tag.<pre>
&lt;script src="shortcuts.js" type="text/javascript"&gt;&lt;/script&gt;
&lt;link href="shortcuts.css" type="text/css" media="screen"/&gt;
</pre>
3. Configure shortcuts as a javascript hash.<pre>
&lt;script type="text/javascript"&gt;
var SHORTCUTS = {
    '<strong>h</strong>': function() { alert('Help!'); },
    '<strong>f</strong>': {
        '<strong>o</strong>': {
            '<strong>o</strong>': function() { alert('"foo" has been typed!'); }
        }
    },
    '<strong>b</strong>': {
        '<strong>a</strong>': {
            '<strong>R</strong>': function() { alert('"baR" has been typed!'); },
            '<strong>z</strong>': function() { alert('"baz" has been typed!'); }
        }
    }
}
&lt;/script&gt;
</pre>
4. Initialize keyboard shortcuts listener on page load.<pre>
&lt;body onload="shortcutListener.init();"&gt;
</pre>


## Four Simple Steps To Use Shortcuts from Ruby&nbsp;on&nbsp;Rails

Rails helper supports global and page-specific keymaps and merges these at runtime.<br/>This way you can define global shortcuts for the whole site in the layout, and modify them as needed for specific pages. This example uses this functionality.

1. Configure global shortcuts in your layout template. <pre>
&lt;%
@global_shortcuts = {
    <strong>:h</strong> =&gt;  "alert('Help!');",
    <strong>:f</strong> =&gt; {
        <strong>:o</strong> =&gt; {
            <strong>:o</strong> =&gt; "alert('"foo" has been typed!');"
        }
    }
}
%&gt;
</pre>
2. Add local page shortcuts to the page template.<pre>
&lt;%
@page_shortcuts = {
    <strong>:b</strong> =&gt; {
        <strong>:a</strong> =&gt; {
            <strong>:R</strong> =&gt; "alert('"bar" has been typed!');",
            <strong>:z</strong> =&gt; "alert('"baz" has been typed!');"
        }
    }
}
%&gt;
</pre>
3. Place <a href="https://github.com/acunote/acunote-shortcuts/raw/master/rails/helper/acunote_shortcuts_helper.rb">acunote_shortcuts_helper.rb</a> into you app/helpers directory and include it into ApplicationHelper class<pre>
module ApplicationHelper
    include AcunoteShortcutsHelper
end
</pre>
4. Call render_shortcuts where your javascript code is rendered<pre>
&lt;script type="text/javascript"&gt;
    &lt;%= render_shortcuts %&gt;
&lt;/script&gt;
</pre>

Then <strong>h</strong> and <strong>foo</strong> will be available for all the pages and one page will have additional <strong>bar</strong> and <strong>baz</strong> shortcuts.

## News.YC, Reddit, Digg and Redmine Keyboard Shortcuts For Your Browser
This Firefox Extension and Greasemonkey Script add Gmail-style cursor, navigation and post
management shortcuts to <a class="external" href="http://news.ycombinator.com">YCombinator News</a>, <a class="external" href="http://reddit.com">Reddit</a>, <a class="external" href="http://digg.com">Digg</a> and <a class="external" href="http://www.redmine.org">Redmine</a>. It includes <span class="nowrap">aconote-shortcuts.js</span> library, and site-specific code to setup shortcuts for each of these.</p>

<table style="border-collapse:collapse" border="1px" cellpadding="0" cellspacing="0" width="100%">
<tr>
    <th colspan="2">Cursor Movement</th>
    <th>Notes</th>
</tr>
<tr>
    <td class="shortcut">
        <strong>j</strong>
    </td>
    <td class="action">
        move cursor up
    </td>
    <td>
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>k</strong>
    </td>
    <td class="action">
        move cursor down
    </td>
    <td>
    </td>
</tr>
<tr>
    <th colspan="3">Post management</th>
</tr>
<tr>
    <td class="shortcut">
        <strong>o, &lt;Enter&gt;</strong>
    </td>
    <td class="action">
        open original post
    </td>
    <td>
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>&lt;Shift&gt;+o</strong>
    </td>
    <td class="action">
        open comments
    </td>
    <td>
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>u</strong>
    </td>
    <td class="action">
        back to news list
    </td>
    <td>
    </td>
</tr>
<tr>
    <th colspan="3">Voting</th>
</tr>
<tr>
    <td class="shortcut">
        <strong>v</strong> then <strong>u</strong>
    </td>
    <td class="action">
        vote up
     </td>
     <td>
        "dig" on Digg
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>v</strong> then <strong>d</strong>
    </td>
    <td class="action">
        vote down
    </td>
    <td>
        "bury" on Digg
    </td>
</tr>
<tr>
    <th colspan="3">Other</th>
</tr>
<tr>
    <td class="shortcut">
        <strong>g</strong> then <strong>i</strong>
    </td>
    <td class="action">
        open "index" page
    </td>
    <td>
        News.YC
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>g</strong> then <strong>n</strong>
    </td>
    <td class="action">
        open "newest" page
    </td>
    <td>
        News.YC, Reddit
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>g</strong> then <strong>h</strong>
    </td>
    <td class="action">
        open "hot" page
    </td>
    <td>
        Reddit
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>g</strong> then <strong>b</strong>
    </td>
    <td class="action">
        open "browse" page
    </td>
    <td>
        Reddit
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>g</strong> then <strong>s</strong>
    </td>
    <td class="action">
        open "saved" page
    </td>
    <td>
        Reddit
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>g</strong> then <strong>r</strong>
    </td>
    <td class="action">
        open "recommended" page
    </td>
    <td>
        Reddit
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>g</strong> then <strong>t</strong>
    </td>
    <td class="action">
        open "stats" page
    </td>
    <td>
        Reddit
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>?</strong>
    </td>
    <td class="action">
        show help
    </td>
    <td>
    </td>
</tr>
<tr>
    <th colspan="3">Redmine specific</th>
</tr>
<tr>
    <td class="shortcut">
        <strong>g</strong> then <strong>p</strong>
    </td>
    <td class="action">
        open "projects" page
    </td>
    <td>
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>g</strong> then <strong>i</strong>
    </td>
    <td class="action">
        open "issues" page
    </td>
    <td>
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>g</strong> then <strong>c</strong>
    </td>
    <td class="action">
        open "new issue" form
    </td>
    <td>
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>g</strong> then <strong>a</strong>
    </td>
    <td class="action">
        open "activity" page
    </td>
    <td>
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>g</strong> then <strong>s</strong>
    </td>
    <td class="action">
        open "summary" page
    </td>
    <td>
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>g</strong> then <strong>n</strong>
    </td>
    <td class="action">
        open "news" page
    </td>
    <td>
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>g</strong> then <strong>f</strong>
    </td>
    <td class="action">
        open "forum" page
    </td>
    <td>
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>g</strong> then <strong>l</strong>
    </td>
    <td class="action">
        open "files" page
    </td>
    <td>
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>g</strong> then <strong>r</strong>
    </td>
    <td class="action">
        open "repository" page
    </td>
    <td>
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>g</strong> then <strong>o</strong>
    </td>
    <td class="action">
        open "roadmap" page
    </td>
    <td>
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>g</strong> then <strong>w</strong>
    </td>
    <td class="action">
        open "wiki" page
    </td>
    <td>
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>g</strong> then <strong>t</strong>
    </td>
    <td class="action">
        open "settings" page
    </td>
    <td>
    </td>
</tr>
<tr>
    <td class="shortcut">
        <strong>?</strong>
    </td>
    <td class="action">
        show help
    </td>
    <td>
    </td>
</tr>
</table>

### Firefox Extension

Ready to use. Just <a href="https://github.com/acunote/acunote-shortcuts/raw/master/extension/acunote-shortcuts.xpi">install it</a>.

### Greasemonkey Script

To use Greasemonkey script with Firefox 2+ install <a href="http://www.greasespot.net">Greasemonkey</a> extension and load <a href="https://github.com/acunote/acunote-shortcuts/raw/master/greasemonkey/acunote-shortcuts.user.js">Acunote shortcuts</a> userscript. For Safari 3+ install <a href="http://8-p.info/greasekit/">GreaseKit</a> plugin and load <a href="https://github.com/acunote/acunote-shortcuts/raw/master/greasemonkey/acunote-shortcuts.user.js">Acunote shortcuts</a> userscript.

To add support for a new site:
* download the <a href="https://github.com/acunote/acunote-shortcuts/raw/master/lib/acunote-shortcuts.js">script source</a>
* copy and paste the DummySource function, rename and adapt it to your needs
* add <code>@include http://your-site.com*</code> to the list of directives at the beginning of the Greasemonkey script
* add your site to the SupportedSites map at the end of the Greasemonkey script
* post your solution to the <a href="http://groups.google.com/group/acunote-shortcuts">mailing list</a> and if it's cool, we'll include it in the next Acunote Shortcuts release


## Acunote: Powered by Shortcuts

<a href="/">Acunote</a>, our project management software, is the best way to see Acunote Shortcuts library in action. Just about everything is accessible through keyboard.  Acunote also includes more keyboard features, which will be extracted into the library in the future - advanced list selector (like keyboard feed selector in Google Reader or QuickSilver), Esc listeners, accesskey-based shortcuts, etc.
<img src="http://www.acunote.com/images/external/shortcuts_screenshot.png" />

<a href="http://www.acunote.com">Learn more...</a>

## Contributing
Acunote Shortcuts framework and Greasemonkey script are released under MIT license. Your
contributions are welcome.

Development resources:
* <a href="http://github.com/acunote/acunote-shortcuts">this GitHub project page</a>
* <a href="http://groups.google.com/group/acunote-shortcuts">mailing list</a>



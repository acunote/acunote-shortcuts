require 'test/unit'
require 'acunote_shortcuts_helper'

class AcunoteShortcutsTest < Test::Unit::TestCase

    include AcunoteShortcutsHelper

    def test_render_shortcuts
        @global_shortcuts = {
            :a => "a();",
            :b => "b();",
            :c => {
                :d => "d();"
            },
            :e => {
                :f => "f();",
                :g => {
                    :h => "h();"
                }
            },
            :h => "h();"
        }
        @page_shortcuts = {
            :b => "x();",
            :c => "y();",
            :e => {
                :x => "x();",
                :g => {
                    :y => "y();"
                }
            },
            :h => {
                :x => "x();"
            }
        }
        assert_equal render_shortcuts, "<script>
var SHORTCUTS = {
'a': function() { a(); },
'b': function() { x(); },
'c': function() { y(); },
'e': {
'f': function() { f(); },
'g': {
'h': function() { h(); },
'y': function() { y(); }
},
'x': function() { x(); }
},
'h': {
'x': function() { x(); }
}
}
</script>"
    end

end

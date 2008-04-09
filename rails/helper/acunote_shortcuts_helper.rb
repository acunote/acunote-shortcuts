# Acunote Shortcuts.
# Javascript keyboard shortcuts mini-framework - Rails app helper.
#
# Copyright (c) 2007-2008 Pluron, Inc.
#
# Permission is hereby granted, free of charge, to any person obtaining
# a copy of this software and associated documentation files (the
# "Software"), to deal in the Software without restriction, including
# without limitation the rights to use, copy, modify, merge, publish,
# distribute, sublicense, and/or sell copies of the Software, and to
# permit persons to whom the Software is furnished to do so, subject to
# the following conditions:
#
# The above copyright notice and this permission notice shall be
# included in all copies or substantial portions of the Software.
#
# THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
# EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
# MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
# NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
# LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
# OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
# WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

module AcunoteShortcutsHelper

    # In this module you will find convenient helper methods to define
    #  "local" shortcuts for the page and "global" shortcuts that will 
    # work through entire web application
    #
    # To use this helpers you should declare @global_shortcuts variable
    # somewhere in your layout rhtml like this:
    #
    #   @global_shortcuts = {
    #       'h' => "showHelp()",
    #       '/' => "Field.focus('search');"
    #   }
    # 
    # and then to declare @page_shortcuts variable for particular page, i.e:
    #
    #   @page_shortcuts = {
    #       :g => {
    #           :n => "redirect('#{my_url(:next)}');",
    #           :p => "redirect('#{my_url(:previous)}');"
    #   }
    # 
    # if global and local shortcuts have the same combination @local_shortcuts
    # variabke have precedence

    def render_shortcuts
        return "" unless @page_shortcuts or @global_shortcuts
        shortcuts = {}
        shortcuts = @global_shortcuts if @global_shortcuts
        shortcuts = shortcuts_merge(shortcuts, @page_shortcuts) if @page_shortcuts
        result = "var SHORTCUTS = {\n"
        result = result + render_shortcuts_recursive(shortcuts)
        result = result + "}"
        return result
    end

    def render_shortcuts_recursive(shortcuts)
        result = ""
        shortcuts_count = shortcuts.size
        i = 0
        shortcuts.sort{|a,b| a[0].to_s<=>b[0].to_s}.each do |key, value|
            i += 1
            if value.class == Hash
                result = result + "'#{key}': {\n" + render_shortcuts_recursive(value) + "}"
            else
                result = result + "'#{key}': function() { #{value} }"
            end
            result = result + "," unless i == shortcuts_count
            result = result + "\n"
        end
        return result
    end

    def shortcuts_merge(global, local)
        local.each do |key, value|
            if global[key].class == Hash and local[key].class == Hash
                global[key] = shortcuts_merge(global[key], local[key])
            else
                global[key] = local[key]
            end
        end
        return global
    end

end

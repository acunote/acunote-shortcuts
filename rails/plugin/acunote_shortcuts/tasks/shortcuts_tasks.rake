namespace :acunote_shortcuts do

    PLUGIN_ROOT = File.dirname(__FILE__) + '/../'

    desc "Installs required javascript and stylesheet files into public/ directory"
    task :install do
	FileUtils.cp Dir[PLUGIN_ROOT + '/assets/javascripts/*.js'], RAILS_ROOT + '/public/javascripts'
	FileUtils.cp Dir[PLUGIN_ROOT + '/assets/stylesheets/*.css'], RAILS_ROOT + '/public/stylesheets'
    end
    
    task :remove do
	FileUtils.rm %{shortcuts.js}.collect { |f| RAILS_ROOT + "/public/javascripts/" + f  }
	FileUtils.rm %{shortcuts.css}.collect { |f| RAILS_ROOT + "/public/stylesheets/" + f  }
    end

end

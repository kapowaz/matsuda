// Matsuda, trainer to Hogan.js

var Matsuda = {};

(function() {
  Matsuda.Templater = function(options){
    var templater = this;
  
    // these templates and partials should be passed upon instantiation
    templater.options = jQuery.extend({
      templates: [],
      partials:  [],
      contexts:  []
    }, options);
    
    // objects to contain compiled templates, once fetched
    templater.templates = {};
    templater.partials  = {};
    templater.contexts  = {};
    
    templater.initialize();
  };
  
  Matsuda.Templater.prototype = {
    // initialise based on supplied options
    initialize: function(){
      var templater = this;
      
      // load all partials, templates and contexts asynchronously
      jQuery.each(templater.options.templates, function(i, template){ templater.loadTemplate('template', template.name, template.resource); });
      jQuery.each(templater.options.partials, function(i, partial){ templater.loadTemplate('partial', partial.name, partial.resource); });
      jQuery.each(templater.options.contexts, function(i, context){ templater.loadContext(context.name, context.resource); });
    }, // Matsuda.Templater.initialize()
    
    // asynchronously load a template or partial, then compile it and add to the controller
    loadTemplate: function(type, name, resource, callback){
      var templater = this;
      
      jQuery.get(resource, function(data){
        templater[type + 's'][name] = Hogan.compile(data);

        $(document).trigger('matsuda.templater.' + type + '.loaded.' + name);
        if (typeof callback == "function") callback();
      });
    },
    
    // asynchronously load context data to be used with a template
    loadContext: function(name, resource, callback) {
      var templater = this;
      
      jQuery.getJSON(resource, function(data){
        templater.contexts[name] = data;
        
        $(document).trigger('matsuda.templater.context.loaded.' + name);
        if (typeof callback == 'function') callback(data, resource);
      });
    },
    
    // render the named template with the supplied context; asynchronously grab anything the template needs
    // since the rendered result can't be guaranteed to be returned instantly, handler is needed to perform
    // whatever DOM insertion is desired with the result
    
    // template and context can be either a name (string) of a pre-loaded template/context,
    // or an object ({name: foo, resource: '/path/to/resource'}) to be loaded
    
    render: function(){
      var templater = this;
      var loaded    = { template: false, context: false };
      
      // pull arguments out dynamically to accommodate the optional path argument for the context
      var template  = arguments.length >= 1 && (typeof arguments[0] == "string" || typeof arguments[0] == "object") ? arguments[0] : null;
      var context   = arguments.length >= 2 && (typeof arguments[1] == "string" || typeof arguments[1] == "object") ? arguments[1] : null;
      var path      = arguments.length >= 3 && typeof arguments[2] == "string" ? arguments[2] : null;
      var handler   = null;
      
      if (arguments.length >= 3 && typeof arguments[2] == "function") {
        handler = arguments[2];
      } else if (arguments.length >= 4 && typeof arguments[3] == "function") {
        handler = arguments[3]; 
      }

      // use a timestamp to generate a unique namespace for this particular render call
      var namespace = "matsuda.templater.render.loaded." + new Date().getTime();

      // fired whenever any single load dependency completes loading
      $(document).bind(namespace, function(){
        if (typeof handler == "function" && loaded.template && loaded.context) {
          handler(loaded.template.render(loaded.context));
          $(document).unbind(namespace);
        }
      });
      
      // 1.) The Template
      if (typeof template == "string") {
        if (typeof templater.templates[template] != "undefined") {
          loaded.template = templater.templates[template];
          $(document).trigger(namespace, ['template: pre-existing,  loaded']);
        } else {
          $(document).bind('matsuda.templater.template.loaded.' + template, function(){
            loaded.template = templater.templates[template];
            $(document).trigger(namespace, ['template: pre-existing, delayed']);
          });
        }
      } else if (typeof template == "object") {
        // we're loading in a fresh template that hasn't previously been loaded 
        templater.loadTemplate('template', template.name, template.resource, function(){
          loaded.template = templater.templates[template.name];
          $(document).trigger(namespace, ['template: not pre-existing']);
        });
      }
      
      // 2.) The Context
      if (typeof context == "string") {
        if (typeof templater.contexts[context] != "undefined") {
          loaded.context = (path == null ? templater.contexts[context] : JSONQuery(path, templater.contexts[context]));
          $(document).trigger(namespace, ['context: pre-existing, loaded']);
        } else {
          $(document).bind('matsuda.templater.context.loaded.' + context, function(){
            loaded.context = (path == null ? templater.contexts[context] : JSONQuery(path, templater.contexts[context]));
            $(document).trigger(namespace, ['context: pre-existing, delayed']);
          });
        }
      } else if (typeof context == "object") {
        // we're loading in a fresh context that hasn't previously been loaded
        templater.loadContext(context.name, context.resource, function(){
          loaded.context = (path == null ? templater.contexts[context.name] : JSONQuery(path, templater.contexts[context.name]));
          $(document).trigger(namespace, ['context: not pre-existing']);
        });
      }
    } // Matsuda.Templater.render()
  };
  
})();
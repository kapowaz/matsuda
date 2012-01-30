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
    
    render: function(template, context, handler){
      var templater = this;
      var loaded    = { template: false, context: false };    

      // fired whenever any single load dependency completes loading
      $(document).bind('matsuda.templater.render.loaded', function(){
        if (typeof handler == "function" && loaded.template && loaded.context) {
          handler(loaded.template.render(loaded.context));
          $(document).unbind('matsuda.templater.render.loaded');
        }
      });
      
      // 1.) The Template
      if (typeof template == "string") {
        if (typeof templater.templates[template] != "undefined") {
          loaded.template = templater.templates[template];
          $(document).trigger('matsuda.templater.render.loaded', ['template: pre-existing,  loaded']);
        } else {
          $(document).bind('matsuda.templater.template.loaded.' + template, function(){
            loaded.template = templater.templates[template];
            $(document).trigger('matsuda.templater.render.loaded', ['template: pre-existing, delayed']);
          });
        }
      } else if (typeof template == "object") {
        // we're loading in a fresh template that hasn't previously been loaded 
        templater.loadTemplate('template', template.name, template.resource, function(){
          loaded.template = templater.templates[template.name];
          $(document).trigger('matsuda.templater.render.loaded', ['template: not pre-existing']);
        });
      }
      
      // 2.) The Context
      if (typeof context == "string") {
        if (typeof templater.contexts[context] != "undefined") {
          loaded.context = template.contexts[context];
          $(document).trigger('matsuda.templater.render.loaded', ['context: pre-existing, loaded']);
        } else {
          $(document).bind('matsuda.templater.context.loaded.' + context, function(){
            loaded.context = templater.contexts[context];
            $(document).trigger('matsuda.templater.render.loaded', ['context: pre-existing, delayed']);
          });
        }
      } else if (typeof context == "object") {
        // we're loading in a fresh context that hasn't previously been loaded
        templater.loadContext(context.name, context.resource, function(){
          loaded.context = templater.contexts[context.name];
          $(document).trigger('matsuda.templater.render.loaded', ['context: not pre-existing']);
        });
      }
    } // Matsuda.Templater.render()
  };
  
})();
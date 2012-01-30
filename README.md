Matsuda
=======

Matsuda, trainer to Hogan.js

An experimental mechanism for making asynchronous requests using jQuery to populate templates and variable contexts to use with Hogan.js's mustache templating library, client-side.

Usage
-----

Create yourself an instance of the templater:

  var templater = new Matsuda.Templater({
    templates: [{ name: 'home', resource: '/templates/home.mustache' }],
    contexts:  [{ name: 'home', resource: '/json/home.json' }]
  });
  templater.render('home', 'home', function(result){
    $('body').append(result);
  });
  
You can choose not to initialise any templates at this point, or you can add them. Entirely up to you. It'll asynchronously load any you request and cache them, compiled by Hogan, and fire an event of `matsuda.templater.template.loaded.<name>` for each one, so you can build your own event handlers for building up the content as you like.

Alternatively, you can just create an instance then render templates and contexts as you go:

  var templater = new Matsuda.Templater();
  templater.render({name: 'home', resource: '/templates/home.mustache'}, {name: 'home', resource: '/json/home.json'}, function(result){});

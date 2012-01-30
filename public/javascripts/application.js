$(document).ready(function() {
  
  // load in the templater with a simple template for initial load-time
  var templater = new Matsuda.Templater({
    templates: [{ name: 'home', resource: '/templates/home.mustache' }, { name: 'subpath', resource: '/templates/subpath.mustache' }],
    contexts:  [{ name: 'home', resource: '/json/home.json' }, { name: 'deepstructure', resource: '/json/deepstructure.json' }]
  });
  
  // this stuff gets handled on initial load; note the nested callbacks ensure load order
  templater.render('home', 'home', function(html){
    $('section#container').append(html);
    templater.render('subpath', 'deepstructure', 'massive', function(html){
      $('section#container').append(html);
    });
  });
  
  // this one happens when you click the link that gets loaded dynamically
  $('a.postscript').live('click', function(e){
    e.preventDefault();
    templater.render({name: 'postscript', resource: '/templates/postscript.mustache'}, {name: 'postscript', resource: '/json/postscript.json'}, function(output){
      $('section#container').append(output);
    });    
  });
  
});
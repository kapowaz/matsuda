$(document).ready(function() {
  
  // load in the templater with a simple template for initial load-time
  var templater = new Matsuda.Templater({
    templates: [{ name: 'home', resource: '/templates/home.mustache' }],
    contexts:  [{ name: 'home', resource: '/json/home.json' }]
  });
  
  // this one happens on load
  templater.render('home', 'home', function(output){
    $('section#container').append(output);
  });
  
  // this one happens when you click the link that gets loaded dynamically
  $('a.postscript').live('click', function(e){
    e.preventDefault();
    templater.render({name: 'postscript', resource: '/templates/postscript.mustache'}, {name: 'postscript', resource: '/json/postscript.json'}, function(output){
      $('section#container').append(output);
    });
  });
  
});
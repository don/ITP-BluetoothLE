var Handlebars = require('handlebars');

Handlebars.registerHelper('formatId', formatId);

Handlebars.registerHelper('checkName', function(name) {
    if (!name) { 
        name = 'Unnamed';
    } 
    return name;
});

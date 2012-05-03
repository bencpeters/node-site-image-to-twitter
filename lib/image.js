var spawn = require('child_process').spawn;
var fs = require('fs');

var Image = function Image(document) {
    this.objects = document ? [document] : [];
 }

Image.prototype.convert = function(callback, filename) {    
  var cmdOptions = []; 
  cmdOptions = cmdOptions.concat(buildCmdOptions(this.objects[0], filename));
  var wkhtmltoimage_path = process.env.PORT ? './bin/wkhtmltoimage-amd64' : 'wkhtmltoimage';

  var convert = spawn(wkhtmltoimage_path,cmdOptions); 
  
  //take care of direct stdin html
  if (this.objects[0].html) {
    var inputHTML = spawn ("echo",this.objects[0].html);
    inputHTML.stdout.on('data', function (data) {
        convert.stdin.write(data);
    });
    inputHTML.on ('exit', function () {
        convert.stdin.end();
    });
  }

  var image = [];
  var err;

  convert.stdout.on('data', function (data) {
      image.push(data);
  });

  convert.stderr.on('data', function (data) {
      err += data;
  });

  convert.on ('exit', function (code) {
      if (code) {
        console.log ('child process exited with code ' + code);
      } else { 
      
        if(!filename) {
          //combine the buffers
          var size = 0;
          for (var i=0; i < image.length; ++i) {
            size+= image[0].length;
          }
          var combinedBuffer = new Buffer (size);
          var pos = 0;
          for (var i=0; i < image.length; ++i) {
            if (pos > size) {
              break;
            }
            image[i].copy(combinedBuffer, pos, 0, image[i].length);
            pos += image[i].length;
          }

          callback (err, combinedBuffer);
        } else {
          callback (err);
        }
      }
  });
}

//take global options and make them into an array
var buildOptions = function(options) {
  var commandOptions = [];
  for (name in options) {
    if (options.hasOwnProperty(name)) {
      commandOptions.push(name);
    }
  }
  return commandOptions;
};

//build the essential options for the wkhtmltoimage command
var buildCmdOptions = function (objects, filename) {
  //wkhtml options
  var cmdOptions = [];
  if (objects.options) {
    cmdOptions = buildOptions(objects.options);
  }

  //input source
  if (objects.html) {
    cmdOptions.push('-');
  } else if (objects.filename) {
    cmdOptions.push(objects.filename);
  } else {
    cmdOptions.push(objects.url);
  }

  //output
  if (filename) {
    cmdOptions.push(filename);
  } else {
    cmdOptions.push('-');
  }
    
  return cmdOptions;
};

module.exports.createImage = function (request, response, callback) {
  var theURL = request.session.url ? request.session.url : "http://www.google.com";
  new Image({ url: theURL }).convert (function (err, data) {
      if (err)
        console.log (err);
      if (data) {
        //see if we have a callback function
        if (callback) {
          callback (data, request, response); 
        } else {
          response.writeHead(200, {'Content-Type' : 'image/png',
                                   'Content-Size' : data.length }); 
          response.write(data);
          response.end ();
        }
      } else {
        fs.createReadStream('./image_error.html').pipe(response);
      }
  });
}

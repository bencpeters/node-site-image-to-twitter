/*
 * =====================================================================================
 *
 *       Filename:  server.js
 *
 *    Description:  
 *
 *        Version:  1.0
 *        Created:  04/25/2012 22:35:52
 *       Revision:  none
 *
 *         Author:  Ben Peters 
 *
 * =====================================================================================
 */

var http = require('http');
var url = require('url');
var Cookies = require('cookies');
var keys = require('keygrip')();
var Session = require('./session.js').Session ();
var sessionData = require('./session.js').SessionData;

//port - check whether we're running on heroku or not
var port = process.env.PORT || 8124;

function startServer (router, handlers) {
  var data = new sessionData();
  function onRequest (request, response) {
    var cookies = new Cookies(request, response, keys); 
    request.session = new Session (data, cookies);
    if (!request.session.formData) {
      request.session.formData = "";
    }

    request.setEncoding('utf8');

    request.addListener('data', function(data) {
      request.session.formData += data.toString ();
    });

    var path = url.parse(request.url).pathname;

    //give the response object a redirect method
    response.redirect = redirectBrowser;
    response.req = request;

    request.addListener('end', function() {
      router(path, handlers, request, response);
    });
  }

    http.createServer(onRequest).listen(port);
}

var redirectBrowser = function (url) {
  var req = this.req;
  var status = 302;

  //allow a status to be passed in as well as a link
  if (2 == arguments.length) {
    status = url;
    url = arguments[1];
  }

  this.writeHead (status, {'Location': url});
  this.end();
}

exports.start = startServer;

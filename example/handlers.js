/*
 * =====================================================================================
 *
 *       Filename:  handlers.js
 *
 *    Description:  Contains server handler functions
 *
 *        Version:  1.0
 *        Created:  04/25/2012 22:42:43
 *       Revision:  none
 *
 *         Author:  Ben Peters 
 *
 * =====================================================================================
 */
var postToTwitter = require ('../lib/twitter.js');
var startTwitterRequest = require('../lib/twitter.js').requestOAuthFromTwitter;
var verifyTwitterRequest = require('../lib/twitter.js').verifyTwitterOAuth;
var querystring = require('querystring');
var fs = require('fs');
var createImage = require('../lib/image.js').createImage;

var home = function home (request, response) {
  var index = fs.createReadStream('./html/index.html').pipe(response);
}

var tweet = function (request, response) {
  //make sure we got the tweet data
  if (request.session.formData) {
    request.session.tweet = querystring.parse(request.session.formData).tweet;
    request.session.url = querystring.parse(request.session.formData).url;
    if (request.session.oauth && request.session.oauth.access_token && request.session.oauth.access_token_secret) {
      request.session.callback = postToTwitter;
      response.redirect('/image');
    } else {
      response.redirect('/auth/twitter');
    }
    
    request.session.formData = "";
  }
  else {
    response.end ();
  }
}

var favicon = function favicon (request, response) {
  response.writeHead(200);
  response.end();
}

var image = function getImage (request, response) {
  createImage (request, response, function (data, request, response) {
      if (data) {
        //see if we have a callback function
        if (request.session && request.session.callback) {
          request.session.callback(data, request.session.oauth, request, response); 
        } else {
          response.writeHead(200, {'Content-Type' : 'image/png',
                                   'Content-Size' : data.length }); 
          response.write(data);
          response.end ();
        }
      } else {
        response.writeHead(200, {'Content-Type' : 'text/html'});
        response.write('<html><head><title>Error loading image!</title></head><body><center><h1>Error loading image!</h1><h3>Sorry, the image you requested could not be found. Reload, or try again later.</h3></center></body></html>');
        response.end ();
      }
  });
}

var handlers = {"/favicon.ico" : favicon,
                "/" : home,
                "/tweet" : tweet,
                "/image" : image,
                "/auth/twitter" : startTwitterRequest,
                "/auth/twitter/callback" : verifyTwitterRequest };

exports.handlers = handlers;

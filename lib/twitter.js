/*
 * =====================================================================================
 *
 *       Filename:  twitter.js
 *
 *    Description:  Functions to write to twitter and twitpics
 *
 *        Version:  1.0
 *        Created:  04/25/2012 23:44:36
 *       Revision:  none
 *
 *         Author:  Ben Peters 
 *
 * =====================================================================================
 */

var OAuthEcho = require('oauth').OAuthEcho;
var OAuth = require('oauth').OAuth;
var fs = require('fs');
var Image = require('./image.js').createImage;
var url = require('url');
var user_oa = new OAuth('https://api.twitter.com/oauth/request_token',
                        'https://api.twitter.com/oauth/access_token',
                        process.env.TWITTER_CONSUMER_KEY,
                        process.env.TWITTER_CONSUMER_SECRET,
                        '1.0',
                        process.env.TWITTER_CALLBACK_LOCATION + "/auth/twitter/callback",
                        "HMAC-SHA1");

var uploadImage = module.exports.uploadImage = function (data, request, response) {
  data = {media: "data:image/png;base64," + data.toString('base64')};
  data.key = process.env.TWITTER_API_KEY;
  var oa = new OAuthEcho('http://api.twitter.com/','https://api.twitter.com/1/account/verify_credentials.json', process.env.TWITTER_CONSUMER_KEY, process.env.TWITTER_CONSUMER_SECRET, '1.0A', 'HMAC-SHA1');
  return oa.post('http://api.twitpic.com/2/upload.json', request.session.oauth.access_token, request.session.oauth.access_token_secret, data, function (err, data) {
      if (err) {
        console.log(err);
        return;
      }
      try {
        return postToTwitter.call (request, JSON.parse(data), response);
      } catch (err) {
        //some kind of error, write out an error page
        console.log('Problem uploading to twitpic, error: ' + err);
        fs.createReadStream('./twitpic_error.html').pipe(response);
      }
    });
};

var postToTwitter = function (twitpicData, response) {
  var tweet =(this.session.tweet ? this.session.tweet : "test message") + " " + twitpicData.url;
  oa = new OAuth("https://twitter.com/oauth/request_token", "http://twitter.com/oauth/access_token", process.env.TWITTER_CONSUMER_KEY, process.env.TWITTER_CONSUMER_SECRET, '1.0A', null, 'HMAC-SHA1');
  return oa.post("http://api.twitter.com/1/statuses/update.json", this.session.oauth.access_token, this.session.oauth.access_token_secret, {'status': tweet}, function (err) {
    if (err) {
      console.log(err);
      fs.createReadStream('./twitter_error.html').pipe(response);
    } else {
      response.writeHead(200, 'text/html');
      response.write('Tweet posted!');
      response.end();
    }
  });
}

module.exports.requestOAuthFromTwitter = function (request, response) {
  user_oa.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results) {
      if (error) {
        console.log(error);
      }
      else {
        request.session.oauth = {};
        request.session.oauth.token = oauth_token;
        request.session.oauth.token_secret = oauth_token_secret;
        response.redirect('https://api.twitter.com/oauth/authenticate?oauth_token=' + oauth_token);
      }
  });
}

module.exports.verifyTwitterOAuth = function (request, response) {
  if (request.session.oauth) {
    request.session.oauth.verifier = url.parse(request.url).oauth_verifier; 
    var oauth = request.session.oauth;

    user_oa.getOAuthAccessToken(oauth.token,oauth.token_secret,oauth.verifier, function (error, oauth_access_token, oauth_access_token_secret, results) {
      if (error) {
        console.log(error);
      }
      else {
        request.session.oauth.access_token = oauth_access_token;
        request.session.oauth.access_token_secret = oauth_access_token_secret;
        Image (request, response, uploadImage)
      }
    });
  } else {
    console.log ("redirect called, but no oauth session");
    response.writeHead(404, {'Content-Type' : 'text/plain'});
    response.write("404 Not Found");
    response.end();
  }
}

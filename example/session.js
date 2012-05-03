/*
 * =====================================================================================
 *
 *       Filename:  session.js
 *
 *    Description:  Manages keep track of a user's session for OAuth
 *
 *        Version:  1.0
 *        Created:  04/26/2012 11:06:42
 *       Revision:  none
 *
 *         Author:  Ben Peters 
 *
 * =====================================================================================
 */

exports.Session = function () {
  var index = 0;

  function SessionRecords (data, cookies) {
    var cookie = cookies.get("sid", {signed: true });
    if (cookie) {
      //have a cookie, look for the matching data
      var sessionData = data[cookie];
      if (sessionData)
        return sessionData;
    }

    //here we either don't have a valid cookie, or don't have valid session data...
    return this.addSession (data, cookies);
  }

  SessionRecords.prototype.addSession = function(data, cookies) {
    this.deleteSession (data, cookies);
    var id = index++;
    id = id.toString ();
    cookies.set ("sid", id, { signed: true});
    data [id] = {};
    return data [id];
  }

  SessionRecords.prototype.deleteSession = function(data, cookies) {
    var cookie = cookies.get("sid", {signed: true});
    if (cookie) {
      delete data[cookie];
    }
    cookies.set ();
  }

  return SessionRecords;
}

exports.SessionData = function () { 
  this.data = {};
}

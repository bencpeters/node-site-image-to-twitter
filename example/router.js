/*
 * =====================================================================================
 *
 *       Filename:  router.js
 *
 *    Description:  Contains routing information for server
 *
 *        Version:  1.0
 *        Created:  04/25/2012 22:39:25
 *       Revision:  none
 *
 *         Author:  Ben Peters 
 *
 * =====================================================================================
 */

function routeRequest(path, handlers, request, response) {
  if (typeof handlers[path] === 'function') {
    handlers[path](request, response);
  } else {
    console.log("No request handler found for " + path);
    response.writeHead(404, {'Content-Type' : 'text/plain'});
    response.write("404 Not Found");
    response.end();
  }
}

exports.route = routeRequest;


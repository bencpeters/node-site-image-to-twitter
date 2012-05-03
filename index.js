/*
 * =====================================================================================
 *
 *       Filename:  index.js
 *
 *    Description:  
 *
 *        Version:  1.0
 *        Created:  04/25/2012 22:40:43
 *       Revision:  none
 *
 *         Author:  Ben Peters 
 *
 * =====================================================================================
 */

var server = require('./example/server.js');
var router = require('./example/router.js');
var handlers = require('./example/handlers.js').handlers;

server.start(router.route, handlers);

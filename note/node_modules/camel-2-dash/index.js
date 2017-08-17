/**
 * Converts a camel case string to a dash-separated-string.
 *
 * @method camel2Dash
 * @param str {String} the camel case string. If null or undefined returns empty string
 * @return {String} the dash-separated-string
 */
module.exports = function camel2Dash( str ) {
  // ensure starts in lower case
  var trim = require( 'jq-trim' );

  str = trim( str );

  if ( str === '' ) {
    return '';
  }

  str = str[ 0 ].toLowerCase() + str.substr( 1 );

  return str.replace( /([A-Z])/g, function ( $1 ) {
    return '-' + $1.toLowerCase();
  } );
};

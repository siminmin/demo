describe( 'camel-2-dash', function () {
  it( 'should transform a string from camelCase to dash-style', function () {
    var str = 'someCamelCaseStr';
    var expected = 'some-camel-case-str';

    var camel2Dash = require( '../' );

    var actual = camel2Dash( str );

    expect( actual ).to.equal( expected );

  } );

  describe( 'when null is passed to the fn', function () {
    it( 'should return an empty string', function () {
      var camel2Dash = require( '../' );
      var str = camel2Dash( null );
      expect( str ).to.equal( '' );
    } );
  } );

  describe( 'when an empty string is passed to the fn', function () {
    it( 'should return an empty string', function () {
      var camel2Dash = require( '../' );
      var str = camel2Dash( '   ' );
      expect( str ).to.equal( '' );
    } );
  } );
} );

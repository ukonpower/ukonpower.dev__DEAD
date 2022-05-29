attribute vec2 num;
attribute float rnd;
uniform float time;
uniform float contentChange;
uniform vec2 range;
uniform float contentNum;
uniform float particleSize;
uniform float colorOffset;

#pragma glslify: rotate = require('./rotate.glsl' )

varying float vContentChange;
varying float vAlpha;
varying vec3 vColor;

#pragma glslify: hsv2rgb = require('./hsv2rgb.glsl' )

void main( void ) {

	vec3 pos = position;

	// pos += vec3( -time * 0.03 + sin( time + num.x * 0.03 ) * 0.02,  sin( time + num.x * 0.36 ) * 0.02, 0.0 );
	pos.y -= range.y / 2.0;

	vContentChange = smoothstep( 0.0, 1.0, -(num.y * 1.0 + num.x * 0.5 ) + contentChange * 2.5  );

	// pos.xz *= (1.0 - vContentChange * 0.2);
	pos.xz *= rotate( vContentChange * (0.5 + rnd) );

	pos.y += ( 1.0 - num.y ) * 0.4 * rnd;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

	gl_Position = projectionMatrix * mvPosition;
	gl_PointSize = rnd * 7.0 * (1.0 - num.y);

	vAlpha = 1.0;
	vColor = hsv2rgb( vec3( colorOffset + rnd * 0.1 + num.y * 0.2, 1.0, 1.0 ) );

}
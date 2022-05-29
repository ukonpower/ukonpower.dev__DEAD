attribute float num;
attribute float rnd;
uniform float time;
uniform float contentChange;
uniform vec3 range;
uniform float contentNum;
uniform float particleSize;

#pragma glslify: rotate = require('./rotate.glsl' )

varying float vContentChange;

void main( void ) {

	vec3 pos = position;

	pos += vec3( -time * 0.03 + sin( time + num * 0.03 ) * 0.02,  sin( time + num * 0.36 ) * 0.02, 0.0 );
	pos = mod( pos, range );
	pos -= range / 2.0;

	vContentChange = smoothstep( 0.0, 1.0, -rnd * 1.0 + contentChange * 2.0  );

	pos.xz *= (1.0 + vContentChange * 0.2);
	pos.xz *= rotate( vContentChange * (0.5 + rnd) );

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );

	gl_Position = projectionMatrix * mvPosition;
	gl_PointSize = 3.0;


}
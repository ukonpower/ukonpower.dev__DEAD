uniform float time;
varying vec2 vUv;
varying vec3 vDir;

#pragma glslify: hsv2rgb = require('./hsv2rgb.glsl' )

void main( void ) {

	vec3 d = normalize( vDir );

	float brightness = 0.0;
	brightness += smoothstep( 0.6, 1.0, dot( d, normalize( vec3( 0.0, 0.2, -1.0 ) ) ) );
	brightness = exp( -( 1.0 - brightness ) * 6.0 ) * 0.1;

	vec3 c = vec3( brightness );

	gl_FragColor = vec4( c, 1.0 );

}
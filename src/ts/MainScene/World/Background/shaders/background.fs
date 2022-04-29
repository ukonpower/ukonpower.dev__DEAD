varying vec2 vUv;
varying vec3 vDir;

void main( void ) {

	vec3 d = normalize( vDir );

	float c = 0.0;
	c += smoothstep( 0.4, 1.0, dot( d, normalize( vec3( 0.0, 0.2, -1.0 ) ) ) );
	c = exp( -( 1.0 - c ) * 6.0 ) * 0.1;

	gl_FragColor = vec4( vec3( c ), 1.0 );

}
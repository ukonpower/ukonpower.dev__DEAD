uniform sampler2D tex;
varying vec2 vUv;

void main( void ) {

	vec4 state = texture2D( tex, vUv );
	vec3 col = vec3( state.x );


	gl_FragColor = vec4( col, 1.0 );

}
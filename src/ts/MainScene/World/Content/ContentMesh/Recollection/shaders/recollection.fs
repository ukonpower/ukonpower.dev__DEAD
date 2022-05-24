varying vec2 vUv;

uniform float visibility;

void main( void ) {

	vec4 col = vec4( 1.0 );
	col.w *= visibility;

	gl_FragColor = col;

}
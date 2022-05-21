uniform sampler2D tex;

uniform float blend;

varying vec2 vUv;
varying float vPosX;

void main( void ) {

	vec4 col = texture2D( tex, vUv );

	col.w *= smoothstep( 1.5, 1.0, abs( vPosX ) );
	// col.w *= smoothstep( 1.5, 1.49, abs( vPosX ) );

	gl_FragColor = col;

}
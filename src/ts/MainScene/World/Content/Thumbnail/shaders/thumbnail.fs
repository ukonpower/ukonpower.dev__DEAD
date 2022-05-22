uniform sampler2D tex1;
uniform sampler2D tex2;
uniform float blend;
uniform float visibility;

varying vec2 vUv;
varying float vPosX;

void main( void ) {

	vec4 col1 = texture2D( tex1, vUv );
	vec4 col2 = texture2D( tex2, vUv );

	vec4 col = mix( col1, col2, 1.0 );

	col.w *= smoothstep( 1.4, 0.8, abs( vPosX ) ) * visibility;

	gl_FragColor = col;

}
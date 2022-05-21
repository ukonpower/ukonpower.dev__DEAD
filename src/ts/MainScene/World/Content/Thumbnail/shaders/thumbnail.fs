uniform sampler2D tex1;
uniform sampler2D tex2;

uniform float blend;

varying vec2 vUv;

void main( void ) {

	vec4 col1 = texture2D( tex1, vUv );
	vec4 col2 = texture2D( tex2, vUv );

	vec4 col = mix( col1, col2, blend );

	gl_FragColor = col;

}
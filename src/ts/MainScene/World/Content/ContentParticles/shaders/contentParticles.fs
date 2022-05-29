
uniform float contentChange;
varying float vAlpha;

#pragma glslify: import('./constants.glsl' )

varying float vContentChange;
varying vec3 vColor;

void main( void ) {

	vec2 uv = gl_PointCoord.xy;

	vec2 cuv = uv * 2.0 - 1.0;

	float l = length( cuv );
	float alpha;

	alpha = smoothstep( 1.0, 0.8, l );
	alpha *= sin( vContentChange * PI );

	vec3 col = mix( vec3( 1.0 ), vColor, l );

	gl_FragColor = vec4( col, alpha * vAlpha );

}
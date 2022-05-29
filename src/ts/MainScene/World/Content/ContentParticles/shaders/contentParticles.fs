
// uniform float contentChange;

#pragma glslify: import('./constants.glsl' )

varying float vContentChange;

void main( void ) {

	vec2 uv = gl_PointCoord.xy;

	vec2 cuv = uv * 2.0 - 1.0;

	float l = length( cuv );
	float alpha;

	alpha = smoothstep( 1.0, 0.8, l );
	
	alpha *= sin( vContentChange * PI );
	// alpha *= 1.0 - contentChange;

	gl_FragColor = vec4( vec3( 1.0 ), alpha );

}
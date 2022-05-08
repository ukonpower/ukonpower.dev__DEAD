uniform sampler2D msdf;
uniform float left;
uniform float top;
uniform float width;
uniform float height;
uniform float curveTime;
varying vec2 vUv;

#pragma glslify: import('./constants.glsl' )

float median( float r, float g, float b ) {
	
    return max( min( r, g ), min( max( r, g ), b ) );
	
}

void main( void ) {

	vec4 fontTex = texture2D( msdf, vUv );
    float sigDist = median( fontTex.r, fontTex.g, fontTex.b ) - 0.5;

    float alpha = step( -0.06, sigDist );

	if( alpha < .5 ) discard;
	
	alpha *= smoothstep( 0.0, 0.8, sin( curveTime * PI));
	
	vec3 col = vec3( 0.0 );

	#ifdef WHITE

		col = vec3( 1.0 );
	
	#endif

    gl_FragColor = vec4( col, alpha );

}
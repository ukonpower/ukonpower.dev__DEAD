varying vec2 vUv;
uniform sampler2D backbuffer;
uniform vec2 resolution;

uniform sampler2D sceneTex;
uniform sampler2D lensTex;
uniform sampler2D bloomTexs[RENDER_COUNT];
uniform sampler2D noiseTex;
uniform float brightness;
uniform float time;

#pragma glslify: random = require( './random.glsl' );

vec2 lens_distortion(vec2 r, float alpha) {
    return r * (1.0 - alpha * dot(r, r)); 
}

void main(){

	vec3 c = vec3( 0.0 );

	vec2 uv = vUv;
	vec2 cuv = vUv * 2.0 - 1.0;
	float w = max( .0, length( cuv ) ) * 0.02;

	float slide;
	vec2 rUV;
	vec2 gUV;
	vec2 bUV;

	#pragma unroll_loop_start
	for ( int i = 0; i < 3; i ++ ) {
		
		slide = float( UNROLLED_LOOP_INDEX ) * 0.01;

		c.x += texture2D(sceneTex,lens_distortion( uv - 0.5, slide ) + 0.5).x;
        c.y += texture2D(sceneTex,lens_distortion( uv - 0.5, slide * 2.0 ) + 0.5).y;
        c.z += texture2D(sceneTex,lens_distortion( uv - 0.5, slide * 3.0 ) + 0.5).z;

	}
	
	#pragma unroll_loop_end
	c /= float( 3 );
	
	#pragma unroll_loop_start
	for ( int i = 0; i < RENDER_COUNT; i ++ ) {
		
		c += texture2D( bloomTexs[ UNROLLED_LOOP_INDEX ], vUv ).xyz * pow( 2.0, float( UNROLLED_LOOP_INDEX ) ) * brightness;

	}
	#pragma unroll_loop_end

	c += random( uv ) * 0.15 * c;

	c *= smoothstep( -0.8, 0.5, 1.0 - length( cuv ) );

	gl_FragColor = vec4( c, 1.0 );

}
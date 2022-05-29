void contentFade(in float visibility, sampler2D noiseTex, vec2 uv, inout vec3 color ) {

	vec4 noise = texture2D( noiseTex, uv * 0.8 );

	float v = smoothstep( 0.0, 1.0, -noise.x * 1.4 + visibility * 1.2 );
	color += 1.0 - smoothstep( 0.0, 0.003, v ); 

	if( v == 0.0 ) {
		discard;
	}

}

#pragma glslify: export(contentFade)
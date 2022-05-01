uniform float time;
varying vec2 vUv;

#pragma glslify: noise3D = require('./noise3D.glsl' )
#pragma glslify: hsv2rgb = require('./hsv2rgb.glsl' )

void main( void ) {

	vec3 col = vec3(0.0);

	vec2 uv = vUv * 0.6;

	float t = time * 0.05;

	float n1 = noise3D(vec3( uv * vec2( 1.0, 4.0 ), t ) );
	float n2 = noise3D(vec3( uv * vec2( 0.7, 3.0 + n1 * 10.0 ), t * 0.5 ) );
	
	vec2 nuv = uv * vec2( 1.0, 2.0 - n2 * 10.0 );

	col.x = noise3D(vec3( nuv, t * 0.2 + 0.0 ) );
	col.y = noise3D(vec3( nuv, t * 0.2 + 0.2 ) );
	col.z = noise3D(vec3( nuv, t * 0.2 + 0.3 ) );
	col *= 2.0;

	// col = hsv2rgb(vec3( (n3) * 1.0 * n2 + 0.3, (n3) * 1.0 * n2 + 0.3, 0.7 ) );
	// col.x += n2;
	// col.y += n3;

	col += smoothstep( 0.93, 0.94, mod( n1 * 10.0, 1.0 ) );

	col *= smoothstep( 0.75, 0.55, vUv.y );

	gl_FragColor = vec4( col, 1.0 );

}
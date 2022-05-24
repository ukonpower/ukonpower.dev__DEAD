uniform sampler2D backBuffer;

uniform vec2 dataSize;

uniform float f;
uniform float k;

uniform float time;
uniform vec2 noiseY;
uniform vec2 noiseX;

varying vec2 vUv;

#pragma glslify: noise2D = require('./noise2D.glsl' )

void main( void ) {

	vec2 d = vec2( 1.0 ) / vec2( dataSize );

	vec4 center = texture2D( backBuffer, vUv );
	vec4 top = texture2D( backBuffer, vUv + vec2( 0.0, d.y * noiseY.x ) );
	vec4 bottom = texture2D( backBuffer, vUv - vec2( 0.0, d.y * noiseY.y ) );
	vec4 left = texture2D( backBuffer, vUv - vec2( d.x * noiseX.x, 0.0 ) );
	vec4 right = texture2D( backBuffer, vUv + vec2( d.x * noiseX.y, 0.0 ) );

	float dx = 0.02;
	float dt = 1.0;

	vec2 D = vec2( 0.00002, 0.00001 );
	vec2 A = ( top.xy + bottom.xy + left.xy + right.xy - center.xy * 4.0 ) / (dx * dx);
	float B = center.x * center.y * center.y;

	float du = D.x * A.x - B + f * ( 1.0 - center.x ); 
	float dv = D.y * A.y + B - center.y * ( f + k ); 

	float nextU = center.x + du * dt;
	float nextV = center.y + dv * dt;

	float len = smoothstep( 0.499, 1.0, length( vUv - vec2( 0.5, 0.5) ));
	nextU = mix(nextU, 0.5, len);
	nextV = mix(nextV, 0.25, len);

	float erase = smoothstep( 0.2, 1.0, noise2D(vUv * 1.5 + time * 0.1));
	nextU = mix( nextU, 1.0, erase);
	nextV = mix( nextV, 0.0, erase);

	gl_FragColor = vec4( nextU, nextV, 0.0, 0.0 );

}
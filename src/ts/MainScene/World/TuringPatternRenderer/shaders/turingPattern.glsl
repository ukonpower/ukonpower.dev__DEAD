uniform sampler2D backBuffer;

uniform vec2 dataSize;

uniform float f;
uniform float k;

varying vec2 vUv;

void main( void ) {

	vec2 d = vec2( 1.0 ) / vec2( dataSize );

	vec4 center = texture2D( backBuffer, vUv );
	vec4 top = texture2D( backBuffer, vUv + vec2( 0.0, d.y ) );
	vec4 bottom = texture2D( backBuffer, vUv - vec2( 0.0, d.y ) );
	vec4 left = texture2D( backBuffer, vUv - vec2( d.x, 0.0 ) );
	vec4 right = texture2D( backBuffer, vUv + vec2( d.x, 0.0 ) );

	float dx = 0.02;
	float dt = 1.0;

	vec2 D = vec2( 0.00002, 0.00001 );
	vec2 A = ( top.xy + bottom.xy + left.xy + right.xy - center.xy * 4.0 ) / (dx * dx);
	float B = center.x * center.y * center.y;

	float du = D.x * A.x - B + f * ( 1.0 - center.x ); 
	float dv = D.y * A.y + B - center.y * ( f + k ); 

	float nextU = center.x + du * dt;
	float nextV = center.y + dv * dt;

	float len = smoothstep( 0.499, 1.0, length( vUv - vec2( 0.5, 0.6) ));
	nextU = mix(nextU, 0.5, len);
	nextV = mix(nextV, 0.25, len);

	gl_FragColor = vec4( nextU, nextV, 0.0, 0.0 );

}
uniform sampler2D backBuffer;

uniform vec2 dataSize;

uniform float f;
uniform float k;

varying vec2 vUv;

void main( void ) {

	vec2 d = vec2( 1.0 ) / dataSize;

	vec4 center = texture2D( backBuffer, vUv );
	vec4 top = texture2D( backBuffer, vUv + vec2( 0.0, d.y ) );
	vec4 bottom = texture2D( backBuffer, vUv - vec2( 0.0, d.y ) );
	vec4 left = texture2D( backBuffer, vUv - vec2( d.x, 0.0 ) );
	vec4 right = texture2D( backBuffer, vUv + vec2( d.x, 0.0 ) );

	float dx = 0.01;
	float dt = 2.0;

	vec2 D = vec2( 0.0002, 0.0001 );
	vec2 A = ( top.xy + bottom.xy + left.xy + right.xy - center.xy * 4.0 ) * D;
	float B = center.x * center.y * center.y;

	// float du = A.x - B + ( 1.0 - center.x ) * f; 
	// float dv = A.y + B - ( f + k ) * center.y; 

	float du = A.x;
	float dv = A.y;

	float nextU = center.x + du * dt;
	float nextV = center.y + dv * dt;

	gl_FragColor = vec4( nextU, nextV, 0.0, 0.0 );

}
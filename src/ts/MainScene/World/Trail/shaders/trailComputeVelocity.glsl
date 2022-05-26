uniform float time;
uniform float seed;
uniform float deltaTime;
uniform float oregl;

uniform vec2 dataSize;
uniform sampler2D dataPos;
uniform sampler2D dataVel;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: atan2 = require('./atan2.glsl' )
#pragma glslify: snoise = require('./noise4D.glsl' )
#pragma glslify: random = require('./random.glsl' )

void main() {
    if(gl_FragCoord.x >= 1.0) return;    
    
    vec2 uv = gl_FragCoord.xy / dataSize.xy;
    vec3 pos = texture2D( dataPos, uv ).xyz;
    vec3 vel = texture2D( dataVel, uv ).xyz;
    float idParticle = uv.y * dataSize.x + uv.x;
	
    float scale = 0.06;
	vec3 p = scale * pos.xyz ;
    
    vel.xyz += vec3(
      snoise( vec4( p, 7.225 + time * 0.5 )  ),
      snoise( vec4( p, 3.553 + time * 0.5 )  ),
      snoise( vec4( p, 1.259 + time * 0.5 )  )
    ) * deltaTime * 30.0 * oregl;

	//gravity
	vec3 objPos = vec3( 0.0, -5.0, -5.0 );
    vec3 gpos = pos - objPos;


	vec3 baseVel = vec3( 0.0 );
	baseVel.xz += smoothstep( 11.0, 7.0, length( pos.xz ) + uv.y ) * ( pos.xz );
	baseVel.x += cos( atan2( pos.x, pos.z ) + 0.4) * 0.1 * length( pos.xz );
	baseVel.z -= sin( atan2( pos.x, pos.z ) + 0.4) * 0.1 * length( pos.xz );
    baseVel += -(gpos + vec3( 0.0, (random(uv) - 0.5) * 8.0 - 5.0, 0.0 ) ) * length(gpos) * 0.001;

	vec3 oreglVel = vec3( 0.0 );
    oreglVel += -(gpos) * length(gpos) * 0.007;
    oreglVel += (gpos) * max(0.0,(1.0 - (distance(pos,objPos) - 2.0 )));

	vel += mix( baseVel, oreglVel, oregl );
    vel.xyz *= 0.95 - uv.y * 0.02;
	
    gl_FragColor = vec4( vel.xyz, 1.0 );
}
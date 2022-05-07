uniform float time;
uniform float seed;
uniform float deltaTime;

uniform vec2 dataSize;
uniform sampler2D dataPos;
uniform sampler2D dataVel;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: atan2 = require('./atan2.glsl' )
#pragma glslify: snoise = require('./noise4D.glsl' )

void main() {
    if(gl_FragCoord.x >= 1.0) return;    
    
    vec2 uv = gl_FragCoord.xy / dataSize.xy;
    vec3 pos = texture2D( dataPos, uv ).xyz;
    vec3 vel = texture2D( dataVel, uv ).xyz;
    float idParticle = uv.y * dataSize.x + uv.x;
	
    float scale = 0.07;
	vec3 p = scale * pos.xyz;
    
    vel.xyz += vec3(
      snoise( vec4( p, 7.225 + time )  ),
      snoise( vec4( p, 3.553 + time )  ),
      snoise( vec4( p, 1.259 + time )  )
    ) * 0.9 * deltaTime;

	//gravity
    vec3 gpos = pos;
    vel += -(gpos) * length(gpos) * 0.001;

	vec3 opos = pos;
	vel.xz += smoothstep( 11.0, 7.0, length( opos.xz ) ) * ( opos.xz );

	vel.x += cos( atan2( pos.x, pos.z ) + 0.4) * 0.1 * length( pos.xz );
	vel.z -= sin( atan2( pos.x, pos.z ) + 0.4) * 0.1 * length( pos.xz );

    vel.xyz *= 0.95 - uv.y * 0.02;
	
    gl_FragColor = vec4( vel.xyz, 1.0 );
}
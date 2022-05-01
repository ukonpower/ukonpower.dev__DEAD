attribute vec4 tangent;
attribute float uvx;
attribute float uvy;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vViewPos;
varying vec3 vWorldPos;
varying vec2 vHighPrecisionZW;

uniform float time;

uniform sampler2D dataPos;
uniform float aboutOffset;
uniform vec2 dataSize;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: atan2 = require('./atan2.glsl' )
#pragma glslify: rotate = require('./rotate.glsl' )
#pragma glslify: hsv2rgb = require('./hsv2rgb.glsl' )

/*-------------------------------
	ShadowMap
-------------------------------*/

#include <shadowmap_pars_vertex>

mat3 makeRotationDir( vec3 direction, vec3 up ) {
	vec3 xaxis = normalize( cross( up, direction ) );
	vec3 yaxis = normalize( cross( direction, xaxis ) );

	return mat3(
		xaxis.x, yaxis.x, direction.x,
		xaxis.y, yaxis.y, direction.y,
		xaxis.z, yaxis.z, direction.z
	);

}

void main( void ) {

	/*-------------------------------
		Position
	-------------------------------*/

	vec2 computeUV = vec2(uvx,uvy);
	
    vec2 nUV = computeUV + vec2(1.0 / (dataSize.x - 1.0),0.0);

    vec3 p = position;
    vec3 pos = texture2D( dataPos, computeUV).xyz;
    vec3 nPos = texture2D( dataPos, nUV).xyz;

    vec3 vec = normalize(nPos - pos);
    float rotX = atan2(vec.y,vec.z);

    p.xy *= smoothstep( 0.0, 1.0, 1.0 - uvx );
	p.xy *= ((sin( computeUV.y * TPI ) * 0.5 + 0.5) * 0.7 + 0.3);
	p.xy *= 1.0 + sin( computeUV.x * 10.0 - time * 10.0) * 0.2;

	mat3 rot = makeRotationDir( vec, vec3( 0.0, 1.0, 0.0 ) );
	p *= rot;

	vec4 worldPos = modelMatrix * vec4( p + pos, 1.0 );
	vec4 mvPosition = viewMatrix * worldPos;
	
	gl_Position = projectionMatrix * mvPosition;

	/*-------------------------------
		Normal / Tangent
	-------------------------------*/

	vec3 transformedNormal = normalMatrix * rot * normal;
	vec4 flipedTangent = tangent;
	flipedTangent.w *= -1.0;

	#ifdef FLIP_SIDED
		transformedNormal *= -1.0;
		flipedTangent *= -1.0;
	#endif
	
	vec3 normal = normalize( transformedNormal );
	vec3 tangent = normalize( ( modelViewMatrix * vec4( flipedTangent.xyz, 0.0 ) ).xyz );
	vec3 biTangent = normalize( cross( normal, tangent ) * flipedTangent.w );

	/*-------------------------------
		Shadow
	-------------------------------*/
	
	vec4 shadowWorldPos;
	
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			
			shadowWorldPos = worldPos + vec4( vec4( transformedNormal, 0.0 ) * modelMatrix ) * directionalLightShadows[ i ].shadowNormalBias;
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPos;
			
		}
		#pragma unroll_loop_end
		
	#endif

	/*-------------------------------
		Varying
	-------------------------------*/
	
	vUv = uv;
	vNormal = normal;
	vTangent = tangent;
	vBitangent = biTangent;
	vViewPos = -mvPosition.xyz;
	vWorldPos = worldPos.xyz;
	vHighPrecisionZW = gl_Position.zw;

}
attribute vec4 tangent;
attribute float num;

uniform float time;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vViewPos;
varying vec3 vWorldPos;
varying vec2 vHighPrecisionZW;

/*-------------------------------
	ShadowMap
-------------------------------*/

#include <shadowmap_pars_vertex>
#pragma glslify: import('./constants.glsl' )
#pragma glslify: rotate = require('./rotate.glsl' )

void main( void ) {

	/*-------------------------------
		Position
	-------------------------------*/

	mat2 rotZ = rotate( smoothstep( -1.0, 1.0, sin( time + num * PI ) ) * 10.0 );
	mat2 rotY = rotate( num * TPI + time * 0.1 );

	vec3 pos = position;

	pos.xy *= rotZ;
	pos.xz *= rotY;
	
	vec4 worldPos = modelMatrix * vec4( pos, 1.0 );
	vec4 mvPosition = viewMatrix * worldPos;
	
	gl_Position = projectionMatrix * mvPosition;

	/*-------------------------------
		Normal / Tangent
	-------------------------------*/

	vec3 transformedNormal = normal;
	
	transformedNormal.xy *= rotZ;
	transformedNormal.xz *= rotY;

	transformedNormal = normalMatrix * transformedNormal;
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
attribute vec4 tangent;

uniform sampler2D turingTex;
uniform sampler2D noiseTex;
uniform float time;
uniform float openingVisibility;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vTangent;
varying vec3 vBitangent;
varying vec3 vViewPos;
varying vec3 vWorldPos;
varying vec2 vHighPrecisionZW;

varying float vVisibility;

#pragma glslify: rotate = require('./rotate.glsl' )

/*-------------------------------
	ShadowMap
-------------------------------*/

#include <shadowmap_pars_vertex>

void main( void ) {

	/*-------------------------------
		Position
	-------------------------------*/

	vec3 pos = position;

	float noise = texture2D( noiseTex, uv * 0.7 * 0.1 ).x;
	float resw = smoothstep( 0.0, 0.5, -1.0 + uv.y - noise + openingVisibility * 2.2 );
	vVisibility = step( 0.1, resw );

	if( resw < 0.9 ) {
		float res = (floor( resw * 10.0 ) / 10.0) * 27.0 + noise * 4.0;
		pos.xyz = floor( pos * res ) / res;
	}

	pos *= 1.0 + ( 1.0 - texture2D( turingTex, uv ).x ) * 0.05;

	vec4 worldPos = modelMatrix * vec4( pos, 1.0 );
	vec4 mvPosition = viewMatrix * worldPos;

	gl_Position = projectionMatrix * mvPosition;

	/*-------------------------------
		Normal / Tangent
	-------------------------------*/

	vec3 transformedNormal = normalMatrix * normal;
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
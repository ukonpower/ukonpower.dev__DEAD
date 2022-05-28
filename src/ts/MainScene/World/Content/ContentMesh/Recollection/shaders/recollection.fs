varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vViewPos;
varying vec3 vWorldPos;

uniform samplerCube envMap;
uniform sampler2D backTex;
uniform sampler2D noiseTex;
uniform vec2 winResolution;
uniform float visibility;

#pragma glslify: import('./constants.glsl' )
#pragma glslify: contentFade = require('./contentFade.glsl' )

float fresnel( float dVH ) {

	float f0 = 0.01;
	return f0 + ( 1.0 - f0 ) * pow( 1.0 - dVH, 2.0 );
	
}

float GGX(vec3 normal, vec3 halfDir, float roughness) {
    float roughness2 = roughness * roughness;
    float dotNH = clamp(dot(normal, halfDir), 0.0, 1.0);
    float a = (1.0 - (1.0 - roughness2) * dotNH * dotNH);
    return roughness2 * (1.0 / PI) / (a * a);
}

void main( void ) {

	vec3 emission = vec3( 0.0);

	if( visibility < 1.0 ) {

		contentFade( visibility, noiseTex, vUv, emission );
		
	}

	vec3 pos = -vViewPos;
	vec3 posWorld = vWorldPos;
	vec3 viewDir = normalize( vViewPos );
	vec3 viewDirWorld = normalize( posWorld - cameraPosition );
	vec3 normal = normalize( vNormal );
	vec3 normalWorld = normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );

	vec3 hv = normalize( viewDir + normalize( vec3( 1.0, 0.0, 0.0 ) - pos.xyz ) );
	float dvh = dot( viewDir, normal );

	float f = fresnel( dvh );

	vec3 c = vec3( GGX( normal, hv, 0.2 ) * 0.1 );
	c = mix( c, textureCube( envMap, reflect( viewDirWorld.xyz, normal ) ).xyz, f * 0.2 );

	vec2 uv = gl_FragCoord.xy / winResolution.xy;

	float nf = ( smoothstep( 0.4, 1.2, dvh) );
	c.x += nf * texture2D( backTex, uv - normal.xy * 0.03 ).x * 0.7;
	c.y += nf * texture2D( backTex, uv - normal.xy * 0.04 ).y * 0.9;
	c.z += nf * texture2D( backTex, uv - normal.xy * 0.05 ).z * 0.8;
	c += emission;


	gl_FragColor = vec4( c, 1.0 );

}
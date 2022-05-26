varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vViewPos;
varying vec3 vWorldPos;

uniform samplerCube envMap;
uniform sampler2D backTex;
uniform vec2 winResolution;
uniform float visibility;

#pragma glslify: import('./constants.glsl' )

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

	vec3 pos = -vViewPos;
	vec3 posWorld = vWorldPos;
	vec3 viewDir = normalize( vViewPos );
	vec3 viewDirWorld = normalize( posWorld - cameraPosition );
	vec3 normal = normalize( vNormal );
	vec3 normalWorld = normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );

	/*-------------------------------
		Light
	-------------------------------*/


	vec3 lightPos = vec3( 0.0 );
	vec3 hv = vec3( 0.0 );
	vec3 c = vec3( 0.5 );

	lightPos = vec3( -10.0, 0.0, 2.0 );
	hv = normalize( viewDir + normalize( lightPos - pos.xyz ) );
	c += ( dot( normalWorld, normalize( lightPos ) ) + vec3( GGX( normal, hv, 0.2 ) * 0.1 ) ) * #ff0044;
	
	lightPos = vec3( 10.0, 0.0, 2.0 );
	hv = normalize( viewDir + normalize( lightPos - pos.xyz ) );
	c += ( dot( normalWorld, normalize( lightPos ) ) + vec3( GGX( normal, hv, 0.2 ) * 0.1 ) ) * #4400ff;

	/*-------------------------------
		EnvMap
	-------------------------------*/

	float f = fresnel( dot( viewDir, normal ) );
	c = mix( c, textureCube( envMap, reflect( viewDirWorld.xyz, normal ) ).xyz, f );

	gl_FragColor = vec4( c, visibility );

}
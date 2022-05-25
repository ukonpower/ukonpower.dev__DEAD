varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewNormal;
varying vec3 vViewPos;
varying vec3 vWorldPos;

void main( void ) {

	/*-------------------------------
		Position
	-------------------------------*/

	vec3 pos = position;
	vec4 worldPos = modelMatrix * vec4( pos, 1.0 );
	vec4 mvPosition = viewMatrix * worldPos;
	gl_Position = projectionMatrix * mvPosition;

	/*-------------------------------
		Normal / Tangent
	-------------------------------*/

	vec3 transformedNormal = normalMatrix * normal;
	
	vec3 normal = normalize( transformedNormal );

	/*-------------------------------
		Varying
	-------------------------------*/
	
	vUv = uv;
	vNormal = normal;
	vViewPos = -mvPosition.xyz;
	vWorldPos = worldPos.xyz;
	
}
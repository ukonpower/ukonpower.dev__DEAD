
uniform float time;
uniform float offset;
uniform float total;

varying vec2 vUv;
varying float vPosX;

#pragma glslify: rotate = require('./rotate.glsl' )

void main( void ) {

	vec3 pos = position;


	float offsetX = (offset / total) + time * 0.1 / total;

	offsetX = mod( offsetX, 1.0 ) - 0.5; 

	// pos.x -= offsetX * 4.3;

	pos.z -= 5.0;

	pos.xz *= rotate( offsetX * 0.85  );
	
	pos.z += 5.0;

	vPosX = pos.x;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;

}
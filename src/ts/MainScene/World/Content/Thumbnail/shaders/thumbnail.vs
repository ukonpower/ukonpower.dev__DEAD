
uniform float time;
uniform float offset;
uniform float total;

varying vec2 vUv;
varying float vPosX;

#pragma glslify: rotate = require('./rotate.glsl' )

void main( void ) {

	vec3 pos = position;


	float offsetX = (offset / total) + time * 0.05 / total;

	offsetX = mod( offsetX, 1.0 ) - 0.5; 

	pos.x -= offsetX * 4.3;

	vPosX = pos.x;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;

}
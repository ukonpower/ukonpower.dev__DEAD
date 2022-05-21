
uniform float time;
uniform vec3 offsetPos;

varying vec2 vUv;
varying float vPosX;

#pragma glslify: rotate = require('./rotate.glsl' )

void main( void ) {

	vec3 pos = position;
	vPosX = pos.x + offsetPos.x;

	vec4 mvPosition = modelViewMatrix * vec4( pos, 1.0 );
	gl_Position = projectionMatrix * mvPosition;

	vUv = uv;

}
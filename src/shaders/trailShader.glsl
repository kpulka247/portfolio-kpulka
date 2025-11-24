precision highp float;

uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uMouseVelocity;
uniform sampler2D uTrailTexture;
uniform vec2 uViewSize;
uniform vec2 uViewOffset;
varying vec2 vUv;

const mat2 ROTATION_MATRIX = mat2(0.9553, 0.2955, -0.2955, 0.9553);

float hash(vec2 p) {
    return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}
float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}
float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for(int i = 0; i < 3; i++) {
        v += a * noise(p);
        p = ROTATION_MATRIX * p * 2.0;
        a *= 0.5;
    }
    return v;
}

void main() {
    vec3 currentState = texture2D(uTrailTexture, vUv).rgb;

    bool inBounds = vUv.x > uViewOffset.x && vUv.x < uViewOffset.x + uViewSize.x &&
        vUv.y > uViewOffset.y && vUv.y < uViewOffset.y + uViewSize.y;

    if(inBounds) {
        float dist = length(vUv - uMouse);

        float rawSpeed = length(uMouseVelocity) * 8.0;
        float remappedSpeed = pow(rawSpeed, 0.4);
        float speed = clamp(remappedSpeed, 0.0, 1.0);

        vec2 turbulenceField = vec2(fbm(vUv * 2.5 + uTime * 0.02), fbm(vUv * 2.5 - uTime * 0.05 + 5.0)) - 0.5;
        vec2 backgroundOffset = turbulenceField * 0.002;

        vec2 delta = uMouse - vUv;
        vec2 vortex = vec2(delta.y, -delta.x);
        float vortexStrength = exp(-dist * dist * 160.0) * speed;
        vec2 vortexOffset = vortex * vortexStrength * 0.1;

        vec2 totalOffset = backgroundOffset + vortexOffset;
        currentState = texture2D(uTrailTexture, vUv - totalOffset).rgb;

        const float SLOW_DECAY = 0.998;
        const float FAST_DECAY = 0.984;

        float erosionMask = pow(fbm(vUv * 50.0 + uTime * 0.15), 2.0);
        float decayRate = mix(SLOW_DECAY, FAST_DECAY, step(currentState.r, erosionMask));
        currentState *= decayRate;

        if(speed > 0.01) {
            float newSandPattern = pow(fbm(vUv * 50.0), 2.0);

            vec2 moveDir = normalize(uMouseVelocity);
            vec2 fromMouseToPixel = normalize(vUv - uMouse);
            float directionality = (-dot(fromMouseToPixel, moveDir) + 1.0) * 0.5;

            float nibMask = exp(-dist * dist * 30000.0) * 1.0;
            float coreTrailShape = pow(directionality, 2.0 + dist * 600.0);
            float coreTrailMask = exp(-dist * dist * 600.0) * coreTrailShape * 0.5;
            float spreadTrailShape = pow(directionality, 1.0 + dist * 100.0);
            float spreadTrailMask = exp(-dist * dist * 2000.0) * spreadTrailShape * 0.15;

            float totalMask = nibMask + coreTrailMask + spreadTrailMask;
            currentState += newSandPattern * totalMask * speed * 1.5;
        }
    } else {
        currentState *= 0.98;
    }

    gl_FragColor = vec4(clamp(currentState, 0.0, 1.0), 1.0);
}
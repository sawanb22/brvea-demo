import React, { useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import style from "../styles/common.module.css"

const NeuroNoiseEffect = () => {
    const location = useLocation();
    const canvasRef = useRef(null);
    const devicePixelRatio = Math.min(window.devicePixelRatio, 2);
    let uniforms = {};
    let gl;

    const pointer = {
        x: 0,
        y: 0,
        tX: 0,
        tY: 0,
    };

    useEffect(() => {
        gl = initShader();
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);
        setupEvents();
        render();

        return () => {
            window.removeEventListener("resize", resizeCanvas);
        };
    }, []);

    function initShader() {
        const vsSource = `
      precision mediump float;
      varying vec2 vUv;
      attribute vec2 a_position;
      void main() {
        vUv = .5 * (a_position + 1.);
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

            const fsSource = `
          precision mediump float;
          varying vec2 vUv;
          uniform float u_time;
          uniform float u_ratio;
          uniform vec2 u_pointer_position;
          uniform float u_scroll_progress;

          vec2 rotate(vec2 uv, float th) {
              return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
          }

          float neuro_shape(vec2 uv, float t, float p) {
              vec2 sine_acc = vec2(0.);
              vec2 res = vec2(0.);
              float scale = 8.;
              for (int j = 0; j < 15; j++) {
                  uv = rotate(uv, 1.);
                  sine_acc = rotate(sine_acc, 1.);
                  vec2 layer = uv * scale + float(j) + sine_acc - t;
                  sine_acc += sin(layer);
                  res += (.5 + .5 * cos(layer)) / scale;
                  scale *= (1.2 - .07 * p);
              }
              return res.x + res.y;
          }

          void main() {
              vec2 uv = .5 * vUv;
              uv.x *= u_ratio;

              vec2 pointer = vUv - u_pointer_position;
              pointer.x *= u_ratio;
              float p = clamp(length(pointer), 0., 1.);
              p = .5 * pow(1. - p, 2.);

              float t = .001 * u_time;
              vec3 color = vec3(0.);
              float noise = neuro_shape(uv, t, p);

              noise = 1.2 * pow(noise, 3.);
              noise += pow(noise, 10.);
              noise = max(.0, noise - .5);
              // noise *= (1. - length(vUv - .5));

              float edgeFade = 1. - length(vUv - .5); 
              edgeFade = pow(edgeFade, 2.0); // Sharpen the fade toward edges

                // Updated color blend to move toward light yellow on the edges
              vec3 sandYellow = vec3(0.96, 0.87, 0.70); // Sand yellow core
              vec3 lightYellowEdge = vec3(1.0, 0.94, 0.71); // Light yellow for edges

                // Blend between the sand yellow and light yellow edge
             color = mix(lightYellowEdge, sandYellow, edgeFade);

            color = color * noise;

              gl_FragColor = vec4(color, noise);
          }
        `;
//         const fsSource = `
//   precision mediump float;
//   varying vec2 vUv;
//   uniform float u_time;
//   uniform float u_ratio;
//   uniform vec2 u_pointer_position;
//   uniform float u_scroll_progress;

//   vec2 rotate(vec2 uv, float th) {
//       return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
//   }

//   float neuro_shape(vec2 uv, float t, float p) {
//       vec2 sine_acc = vec2(0.);
//       vec2 res = vec2(0.);
//       float scale = 8.;
//       for (int j = 0; j < 15; j++) {
//           uv = rotate(uv, 1.);
//           sine_acc = rotate(sine_acc, 1.);
//           vec2 layer = uv * scale + float(j) + sine_acc - t;
//           sine_acc += sin(layer);
//           res += (.5 + .5 * cos(layer)) / scale;
//           scale *= (1.2 - .07 * p);
//       }
//       return res.x + res.y;
//   }

//   void main() {
//       vec2 uv = .5 * vUv;
//       uv.x *= u_ratio;

//       vec2 pointer = vUv - u_pointer_position;
//       pointer.x *= u_ratio;
//       float p = clamp(length(pointer), 0., 1.);
//       p = .5 * pow(1. - p, 2.);

//       float t = .001 * u_time;
//       vec3 color = vec3(0.);
//       float noise = neuro_shape(uv, t, p);

//       noise = 1.2 * pow(noise, 3.);
//       noise += pow(noise, 10.);
//       noise = max(.0, noise - .5);
//       noise *= (1. - length(vUv - .5));

//       // Updated base colors
//       vec3 baseColor1 = vec3(.74, .88, .13); // #ff8c00
//       vec3 baseColor2 = vec3(1, 1, 1); // #f9ecb7

//       // Mix colors based on noise
//       color = mix(baseColor1, baseColor2, noise);
//       color = color * noise;

//       gl_FragColor = vec4(color, noise);
//   }
// `;


        const canvasEl = canvasRef.current;
        const gl = canvasEl.getContext("webgl") || canvasEl.getContext("experimental-webgl");

        if (!gl) {
            alert("WebGL is not supported by your browser.");
            return null;
        }

        const vertexShader = createShader(gl, vsSource, gl.VERTEX_SHADER);
        const fragmentShader = createShader(gl, fsSource, gl.FRAGMENT_SHADER);
        const shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);

        // Ensure the shader program is valid
        if (!shaderProgram) {
            console.error("Shader program failed to initialize.");
            return null;
        }

        uniforms = getUniforms(gl, shaderProgram);

        const vertices = new Float32Array([-1., -1., 1., -1., -1., 1., 1., 1.]);
        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        gl.useProgram(shaderProgram);
        const positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
        gl.enableVertexAttribArray(positionLocation);
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        return gl;
    }

    function createShader(gl, sourceCode, type) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, sourceCode);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function createShaderProgram(gl, vertexShader, fragmentShader) {
        const program = gl.createProgram();
        gl.attachShader(program, vertexShader);
        gl.attachShader(program, fragmentShader);
        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
            return null;
        }
        return program;
    }

    function getUniforms(gl, program) {
        const uniforms = {};
        const uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformCount; i++) {
            const uniformName = gl.getActiveUniform(program, i).name;
            uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
        }
        return uniforms;
    }

    function render() {
        const currentTime = performance.now();
        pointer.x += (pointer.tX - pointer.x) * 0.5;
        pointer.y += (pointer.tY - pointer.y) * 0.5;

        gl.uniform1f(uniforms.u_time, currentTime);
        gl.uniform2f(uniforms.u_pointer_position, pointer.x / window.innerWidth, 1 - pointer.y / window.innerHeight);
        gl.uniform1f(uniforms.u_scroll_progress, window.pageYOffset / (2 * window.innerHeight));

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    }

    function resizeCanvas() {
        const canvasEl = canvasRef.current;
        canvasEl.width = window.innerWidth * devicePixelRatio;
        canvasEl.height = window.innerHeight * devicePixelRatio;
        gl.uniform1f(uniforms.u_ratio, canvasEl.width / canvasEl.height);
        gl.viewport(0, 0, canvasEl.width, canvasEl.height);
    }

    function setupEvents() {
        window.addEventListener("pointermove", e => updateMousePosition(e.clientX, e.clientY));
        window.addEventListener("touchmove", e => updateMousePosition(e.targetTouches[0].clientX, e.targetTouches[0].clientY));
        window.addEventListener("click", e => updateMousePosition(e.clientX, e.clientY));
    }

    function updateMousePosition(eX, eY) {
        pointer.tX = eX;
        pointer.tY = eY;
    }

    return <div className={`${style.neuroEffect} ${location.pathname=="/"?style.neuroEffect_home:style.neuroEffect_other}`} >
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>;
};

export default NeuroNoiseEffect;

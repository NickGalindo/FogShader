const vertex_shader = `
#ifdef GL_ES
precision mediump float;
#endif

attribute vec4 aPosition;
attribute vec2 aTexCoord;

uniform mat4 uModelViewMatrix;
uniform mat4 uProjectionMatrix;

varying vec2 vTexCoord;
varying float vFogDepth;

void main(void) {
  gl_Position = uProjectionMatrix * uModelViewMatrix * aPosition;
  vTexCoord = aTexCoord;
  vFogDepth = -(uModelViewMatrix * aPosition).z;
}
`;

const fragment_shader = `
#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vTexCoord;
varying float vFogDepth;

uniform sampler2D uTexture;
uniform vec4 uFogColor;
uniform float uFogNear;
uniform float uFogFar;

void main(void){
  vec4 textureColor = texture2D(uTexture, vTexCoord);
  float fogAmount = smoothstep(uFogNear, uFogFar, vFogDepth/8000.0);
  gl_FragColor = mix(textureColor, uFogColor, fogAmount); 
}
`;

class TexturedBox{
  constructor(x, y, z, rotx, roty, rotz) {
    this.pos_x = x;
    this.pos_y = y;
    this.pos_z = z;
    this.angle_x = rotx;
    this.angle_y = roty;
    this.angle_z = rotz;
  }

  draw() {
    push();
    translate(this.pos_x, this.pos_y, this.pos_z);

    rotateX(this.angle_x);
    rotateY(this.angle_y);
    rotateZ(this.angle_z);

    noStroke();
    box(90);

    pop();

    this.angle_x += 0.01;
    this.angle_y += 0.02;
    this.angle_z += 0.03;
  }
}

let canvas;
let texture;
let textured_boxes = [];
let slider_near, slider_near_label;
let slider_far, slider_far_label;
let fog = {
  r: 204,
  g: 230,
  b: 255
};
let fog_shader;

function setup(){
  createCanvas(800, 600, WEBGL);

  texture = loadImage("f-texture.png");
  fog_shader = createShader(vertex_shader, fragment_shader);

  let x = -300, y = 0, z = 0, rot = 0.0;
  for(let i = 0; i < 40; i++){
    textured_boxes.push(new TexturedBox(x, y, z, rot, rot, rot));
    x += 100, z -= 200, rot += 0.06;
    console.log(textured_boxes);
    console.log("HMMMMM");
  }

  slider_far = createSlider(0, 1000, 1000).size(200, AUTO);
  slider_far_label = createDiv('Fog Far');
  slider_near = createSlider(0, 1000, 0).size(200, AUTO);
  slider_near_label = createDiv('Fog Near');

  windowResized();
}

function draw(){
  orbitControl();
  background(fog.r, fog.g, fog.b);

  shader(fog_shader);
  fog_shader.setUniform("uFogNear", slider_near.value()/1000);
  fog_shader.setUniform("uFogFar", slider_far.value()/1000);
  fog_shader.setUniform("uFogColor", [fog.r/255.0, fog.g/255.0, fog.b/255.0, 1.0]);

  for(let b of textured_boxes) {
    fog_shader.setUniform("uTexture", texture);
    b.draw();
  }
}

function windowResized(){
  _renderer.position((windowWidth-width)/2, (windowHeight-height)/2);

  slider_far.position((width-slider_far.width)/2+_renderer.x, height+45+_renderer.y);
  slider_far_label.position((width-slider_far.width)/2+_renderer.x-65, height+45+_renderer.y+5);
  slider_near.position((width-slider_near.width)/2+_renderer.x, height+15+_renderer.y);
  slider_near_label.position((width-slider_near.width)/2+_renderer.x-65, height+15+_renderer.y+5);
}

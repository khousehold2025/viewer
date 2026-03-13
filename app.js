const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let scene;
let camera;
let modelMeshes = [];

function createScene(){

scene = new BABYLON.Scene(engine);

camera = new BABYLON.ArcRotateCamera(
"camera",
Math.PI/2,
Math.PI/2.4,
5,
BABYLON.Vector3.Zero(),
scene
);

camera.attachControl(canvas,true);

camera.lowerRadiusLimit = 0.5;
camera.upperRadiusLimit = 10;
camera.wheelPrecision = 50;

new BABYLON.HemisphericLight(
"light",
new BABYLON.Vector3(0,1,0),
scene
);

}

createScene();

engine.runRenderLoop(function(){
scene.render();
});

window.addEventListener("resize", function(){
engine.resize();
});


/* -------------------------
배경 이미지
--------------------------*/

document.getElementById("bgInput").addEventListener("change", function(e){

const file = e.target.files[0];

if(!file){
return;
}

const reader = new FileReader();

reader.onload = function(evt){

document.body.style.backgroundImage = "url(" + evt.target.result + ")";

};

reader.readAsDataURL(file);

});


/* -------------------------
GLB 로드
--------------------------*/

document.getElementById("modelInput").addEventListener("change", async function(e){

const file = e.target.files[0];

if(!file){
return;
}

scene.meshes.forEach(function(m){

if(m.name !== "__root__"){
m.dispose();
}

});

const url = URL.createObjectURL(file);

await BABYLON.SceneLoader.AppendAsync("", url, scene);

modelMeshes = scene.meshes;

camera.zoomOn(scene.meshes);

});


/* -------------------------
컬러 변경
--------------------------*/

function applyColor(hex){

const color = BABYLON.Color3.FromHexString(hex);

scene.meshes.forEach(function(mesh){

if(!mesh.material){
return;
}

if(mesh.material.albedoColor){
mesh.material.albedoColor = color;
}

if(mesh.material.diffuseColor){
mesh.material.diffuseColor = color;
}

});

}


const swatches = document.querySelectorAll(".swatch");

swatches.forEach(function(s){

s.addEventListener("click", function(){

swatches.forEach(function(b){
b.classList.remove("active");
});

this.classList.add("active");

applyColor(this.dataset.color);

});

});

const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const scene = new BABYLON.Scene(engine);

const camera = new BABYLON.ArcRotateCamera(
"camera",
Math.PI/2,
Math.PI/2.4,
5,
BABYLON.Vector3.Zero(),
scene
);

camera.attachControl(canvas,true);

const light = new BABYLON.HemisphericLight(
"light",
new BABYLON.Vector3(0,1,0),
scene
);

engine.runRenderLoop(function(){
scene.render();
});

window.addEventListener("resize", function(){
engine.resize();
});



/* 배경 이미지 */

document.getElementById("bgInput").addEventListener("change",function(e){

const file = e.target.files[0];
if(!file) return;

const reader = new FileReader();

reader.onload = function(evt){

document.body.style.backgroundImage = "url("+evt.target.result+")";
document.body.style.backgroundSize = "cover";

};

reader.readAsDataURL(file);

});



/* GLB 로드 */

document.getElementById("modelInput").addEventListener("change",function(e){

const file = e.target.files[0];
if(!file) return;

const url = URL.createObjectURL(file);

BABYLON.SceneLoader.Append("", url, scene, function(){

camera.zoomOn(scene.meshes);

});

});



/* 컬러 변경 */

function setColor(color){

scene.meshes.forEach(function(mesh){

if(mesh.material && mesh.material.albedoColor){

if(color==="red") mesh.material.albedoColor = new BABYLON.Color3(1,0,0);
if(color==="blue") mesh.material.albedoColor = new BABYLON.Color3(0,0,1);
if(color==="gray") mesh.material.albedoColor = new BABYLON.Color3(0.5,0.5,0.5);

}

});

}

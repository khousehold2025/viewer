const canvas=document.getElementById("renderCanvas");
const engine=new BABYLON.Engine(canvas,true);

let scene;
let camera;

let modelRoot=null;
let modelMeshes=[];

let sizeLabel;
let gizmoManager;

const createScene=function(){

scene=new BABYLON.Scene(engine);
scene.clearColor=new BABYLON.Color4(0,0,0,0);

camera=new BABYLON.ArcRotateCamera(
"camera",
Math.PI/2,
Math.PI/2.5,
5,
BABYLON.Vector3.Zero(),
scene
);

camera.attachControl(canvas,true);
camera.lowerRadiusLimit=0.5;
camera.upperRadiusLimit=6;
camera.wheelPrecision=50;

new BABYLON.HemisphericLight(
"light",
new BABYLON.Vector3(0,1,0),
scene
);

const advancedTexture=
BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

sizeLabel=new BABYLON.GUI.TextBlock();
sizeLabel.color="white";
sizeLabel.fontSize=20;
sizeLabel.top="-45%";

advancedTexture.addControl(sizeLabel);

gizmoManager=new BABYLON.GizmoManager(scene);
gizmoManager.scaleGizmoEnabled=true;

return scene;

};

createScene();

engine.runRenderLoop(()=>{

if(modelRoot){

const bounding=modelRoot.getHierarchyBoundingVectors();
const size=bounding.max.subtract(bounding.min);

sizeLabel.text=
`가로: ${(size.x*100).toFixed(1)} cm   `+
`세로: ${(size.z*100).toFixed(1)} cm   `+
`높이: ${(size.y*100).toFixed(1)} cm`;

}

scene.render();

});

window.addEventListener("resize",()=>engine.resize());


// GLB 로드 (안정 버전)

document.getElementById("modelInput").addEventListener("change",async(event)=>{

const file=event.target.files[0];
if(!file) return;

if(modelMeshes.length>0){

modelMeshes.forEach(m=>m.dispose());
modelMeshes=[];
modelRoot=null;

}

const url=URL.createObjectURL(file);

const result=await BABYLON.SceneLoader.ImportMeshAsync("", url, "", scene);

modelMeshes=result.meshes;

modelRoot=new BABYLON.TransformNode("modelRoot",scene);

modelMeshes.forEach(mesh=>{
if(mesh instanceof BABYLON.Mesh){
mesh.setParent(modelRoot);
}
});

camera.zoomOn(modelMeshes,true);
gizmoManager.attachToNode(modelRoot);

});


// 배경 이미지

document.getElementById("bgInput").addEventListener("change",(event)=>{

const file=event.target.files[0];
if(!file) return;

const reader=new FileReader();

reader.onload=(e)=>{
document.body.style.backgroundImage=`url('${e.target.result}')`;
};

reader.readAsDataURL(file);

});


// 색상 적용

function applyColor(hex){

if(!modelMeshes.length) return;

const color=BABYLON.Color3.FromHexString(hex);

modelMeshes.forEach(mesh=>{

if(!mesh.material) return;

if(mesh.material.albedoColor)
mesh.material.albedoColor=color;

if(mesh.material.diffuseColor)
mesh.material.diffuseColor=color;

});

}


// 스와치

const swatches=document.querySelectorAll(".swatch");

swatches.forEach(swatch=>{

swatch.addEventListener("click",function(){

swatches.forEach(s=>s.classList.remove("active"));
this.classList.add("active");

applyColor(this.dataset.color);

});

});

const canvas = document.getElementById("renderCanvas");

const engine = new BABYLON.Engine(canvas,true);

let scene;
let camera;

let modelRoot=null;
let modelMeshes=[];

let sizeLabel;

let gizmoManager;


// 씬 생성

const createScene=function(){

scene=new BABYLON.Scene(engine);

// 🔥 배경 보이게 (중요)
scene.clearColor=new BABYLON.Color4(0,0,0,0);


// 카메라

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
//camera.upperRadiusLimit=6;
  //좀더 멀리 줌아웃 15
camera.upperRadiusLimit=25;
camera.wheelPrecision=50;


// 조명

new BABYLON.HemisphericLight(
"light",
new BABYLON.Vector3(0,1,0),
scene
);


// GUI

const advancedTexture=
BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

sizeLabel=new BABYLON.GUI.TextBlock();

sizeLabel.color="white";
sizeLabel.fontSize=20;

sizeLabel.top="-45%";

advancedTexture.addControl(sizeLabel);


// Gizmo

gizmoManager=new BABYLON.GizmoManager(scene);

gizmoManager.scaleGizmoEnabled=true;

return scene;

};

createScene();


// 렌더 루프

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


// =============================
// 🔥 공통 모델 로드 함수 (추가)
// =============================

async function loadModel(source){

// 기존 모델 제거
if(modelMeshes.length>0){

modelMeshes.forEach(m=>m.dispose());

modelMeshes=[];
modelRoot=null;

}

let result;

// 파일 업로드인지 URL인지 구분
if(source instanceof File){

result = await BABYLON.SceneLoader.ImportMeshAsync(
"",
"",
source,
scene
);

}else{

result = await BABYLON.SceneLoader.ImportMeshAsync(
"",
"",
source,
scene
);

}

modelMeshes=result.meshes;


// 부모 Transform

modelRoot=new BABYLON.TransformNode("modelRoot",scene);

modelMeshes.forEach(mesh=>{

if(mesh instanceof BABYLON.Mesh){
mesh.setParent(modelRoot);
}

});


// 카메라 프레이밍

camera.zoomOn(modelMeshes,true);


// gizmo 연결

gizmoManager.attachToNode(modelRoot);

}



// =============================
// GLB 업로드 (기존 유지 + 수정)
// =============================

document.getElementById("modelInput").addEventListener("change",async(event)=>{

const file=event.target.files[0];

if(!file)return;

await loadModel(file);

});


// =============================
// 🔥 models 폴더 선택 (추가)
// =============================

document.getElementById("modelSelect").addEventListener("change",function(){

if(!this.value)return;

const url="models/"+this.value;

loadModel(url);

});


// =============================
// 배경 이미지
// =============================

document.getElementById("bgInput").addEventListener("change",(event)=>{

const file=event.target.files[0];

if(!file)return;

const reader=new FileReader();

reader.onload=(e)=>{

document.body.style.backgroundImage=`url('${e.target.result}')`;

};

reader.readAsDataURL(file);

});


// =============================
// 컬러 변경
// =============================

document.getElementById("colorSelect").addEventListener("change",function(){

if(!modelMeshes.length)return;

const colorMap={

red:new BABYLON.Color3(1,0,0),

blue:new BABYLON.Color3(0,0,1),

gray:new BABYLON.Color3(0.5,0.5,0.5),

black:new BABYLON.Color3(0.1,0.1,0.1)

};

const selected=colorMap[this.value];

modelMeshes.forEach(mesh=>{

if(!mesh.material)return;

if(mesh.material.albedoColor)
mesh.material.albedoColor=selected;

if(mesh.material.diffuseColor)
mesh.material.diffuseColor=selected;

});

});

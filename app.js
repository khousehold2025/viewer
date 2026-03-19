const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas,true);

let scene;
let camera;

let modelRoot=null;
let modelMeshes=[];

let objects = [];          // 🔥 추가 (여러 모델 관리)
let selectedMesh = null;   // 🔥 추가

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
//gizmoManager=new BABYLON.GizmoManager(scene);

const boundingBoxGizmo = new BABYLON.BoundingBoxGizmo(
BABYLON.Color3.White(),
scene
);

boundingBoxGizmo.scaleBoxSize = 0.02;
boundingBoxGizmo.rotationSphereSize = 0.03;  

gizmoManager.scaleGizmoEnabled=true;
gizmoManager.positionGizmoEnabled=true;

gizmoManager.attachToMesh(null);


// =============================
// 🔥 클릭 선택 추가
// =============================
scene.onPointerObservable.add((pointerInfo)=>{

if(pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN){

const pick = scene.pick(scene.pointerX, scene.pointerY);

if(pick.hit && pick.pickedMesh){

let picked = pick.pickedMesh;

// root까지 올라가기
while(picked.parent && picked.parent instanceof BABYLON.TransformNode){
picked = picked.parent;
}

selectedMesh = picked;
gizmoManager.attachToMesh(selectedMesh);

}else{

selectedMesh = null;
gizmoManager.attachToMesh(null);

}

}

});

return scene;

};

createScene();


// 렌더 루프
engine.runRenderLoop(()=>{

if(selectedMesh){

const bounding=selectedMesh.getHierarchyBoundingVectors();

const size=bounding.max.subtract(bounding.min);

sizeLabel.text=
`가로: ${(size.x*100).toFixed(1)} cm   `+
`세로: ${(size.z*100).toFixed(1)} cm   `+
`높이: ${(size.y*100).toFixed(1)} cm`;

}else{
sizeLabel.text="";
}

scene.render();

});

window.addEventListener("resize",()=>engine.resize());


// =============================
// 🔥 모델 로드 (기존 유지 + 추가만 수정)
// =============================
async function loadModel(source){

let result;

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

// 🔥 root 생성 (개별 관리)
const root=new BABYLON.TransformNode("modelRoot",scene);

result.meshes.forEach(mesh=>{
if(mesh instanceof BABYLON.Mesh){
mesh.setParent(root);
}
});

// 위치 초기화
root.position=new BABYLON.Vector3(0,0,0);

// 목록에 추가
objects.push(root);

// 마지막 추가된 것 선택
selectedMesh = root;
gizmoManager.attachToMesh(selectedMesh);

// 카메라 프레이밍
camera.zoomOn(result.meshes,true);

}


// =============================
// GLB 업로드
// =============================
document.getElementById("modelInput").addEventListener("change",async(event)=>{

const file=event.target.files[0];
if(!file)return;

await loadModel(file);

});


// =============================
// models 폴더 선택
// =============================
document.getElementById("modelSelect").addEventListener("change",function(){

if(!this.value)return;

const url="models/"+this.value;

loadModel(url);

});


// =============================
// 🔥 선택 삭제 (추가)
// =============================
document.getElementById("deleteBtn").addEventListener("click",()=>{

if(!selectedMesh) return;

selectedMesh.dispose();

objects = objects.filter(o=>o !== selectedMesh);

selectedMesh = null;

gizmoManager.attachToMesh(null);

});


// =============================
// 🔥 📸 화면 저장 (추가)
// =============================
document.getElementById("captureBtn").addEventListener("click",()=>{

BABYLON.Tools.CreateScreenshotUsingRenderTarget(
engine,
camera,
{ width:1920, height:1080 },
function(data){
const link=document.createElement("a");
link.href=data;
link.download="scene.png";
link.click();
}
);

});


// =============================
// 배경 이미지 (그대로 유지)
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
// 컬러 변경 (선택된 것만)
// =============================
document.getElementById("colorSelect").addEventListener("change",function(){

if(!selectedMesh) return;

const colorMap={
red:new BABYLON.Color3(1,0,0),
blue:new BABYLON.Color3(0,0,1),
gray:new BABYLON.Color3(0.5,0.5,0.5),
black:new BABYLON.Color3(0.1,0.1,0.1)
};

const selected=colorMap[this.value];

selectedMesh.getChildMeshes().forEach(mesh=>{

if(!mesh.material)return;

if(mesh.material.albedoColor)
mesh.material.albedoColor=selected;

if(mesh.material.diffuseColor)
mesh.material.diffuseColor=selected;

});

});

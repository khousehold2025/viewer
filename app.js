const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let scene, camera;
let objects = [];
let selectedMesh = null;
let gizmoManager;
let sizeLabel;

const createScene = async function () {

scene = new BABYLON.Scene(engine);

// 배경 투명
scene.clearColor = new BABYLON.Color4(0,0,0,0);

// 카메라
camera = new BABYLON.ArcRotateCamera(
"camera",
-Math.PI/2,
Math.PI/2.3,
8,
new BABYLON.Vector3(0,1,0),
scene
);

camera.attachControl(canvas,true);
camera.lowerRadiusLimit = 0.5;
camera.upperRadiusLimit = 25;
camera.wheelPrecision = 50;


// 조명
new BABYLON.HemisphericLight(
"light",
new BABYLON.Vector3(0,1,0),
scene
);


// 바닥
const ground = BABYLON.MeshBuilder.CreateGround(
"ground",
{width:20, height:20},
scene
);


// GUI (사이즈 표시)
const advancedTexture =
BABYLON.GUI.AdvancedDynamicTexture.CreateFullscreenUI("UI");

sizeLabel = new BABYLON.GUI.TextBlock();
sizeLabel.color = "white";
sizeLabel.fontSize = 20;
sizeLabel.top = "-45%";

advancedTexture.addControl(sizeLabel);


// Gizmo
gizmoManager = new BABYLON.GizmoManager(scene);
gizmoManager.positionGizmoEnabled = true;
gizmoManager.scaleGizmoEnabled = true;
gizmoManager.attachToMesh(null);


// 클릭 선택
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


// 씬 시작
createScene().then(scene=>{
engine.runRenderLoop(()=>{
scene.render();
});
});

window.addEventListener("resize", ()=>engine.resize());


// =============================
// 모델 추가 (여러 개)
// =============================

document.getElementById("modelSelect").addEventListener("change", async function(){

if(!this.value) return;

const result = await BABYLON.SceneLoader.ImportMeshAsync(
"",
"./models/",
this.value,
scene
);

// root 생성
const root = new BABYLON.TransformNode("root", scene);

// 메시 묶기
result.meshes.forEach(m=>{
if(m !== result.meshes[0]){
m.parent = root;
}
});

root.position = new BABYLON.Vector3(0,0,0);

objects.push(root);

});


// =============================
// 삭제
// =============================

document.getElementById("deleteBtn").addEventListener("click", ()=>{

if(!selectedMesh) return;

selectedMesh.dispose();

objects = objects.filter(o=>o !== selectedMesh);

selectedMesh = null;

gizmoManager.attachToMesh(null);

});


// =============================
// 📸 이미지 캡처
// =============================

document.getElementById("captureBtn").addEventListener("click", ()=>{

BABYLON.Tools.CreateScreenshotUsingRenderTarget(
engine,
camera,
{ width: 1920, height: 1080 },
function(data){
const link = document.createElement("a");
link.href = data;
link.download = "scene.png";
link.click();
}
);

});


// =============================
// 배경 이미지 변경
// =============================

document.getElementById("bgInput").addEventListener("change",(event)=>{

const file = event.target.files[0];
if(!file) return;

const reader = new FileReader();

reader.onload = (e)=>{
document.body.style.backgroundImage = `url('${e.target.result}')`;
};

reader.readAsDataURL(file);

});


// =============================
// 컬러 변경 (선택된 모델만)
// =============================

document.getElementById("colorSelect").addEventListener("change",function(){

if(!selectedMesh) return;

const colorMap = {
red:new BABYLON.Color3(1,0,0),
blue:new BABYLON.Color3(0,0,1),
gray:new BABYLON.Color3(0.5,0.5,0.5),
black:new BABYLON.Color3(0.1,0.1,0.1)
};

const selected = colorMap[this.value];

selectedMesh.getChildMeshes().forEach(mesh=>{

if(!mesh.material) return;

if(mesh.material.albedoColor)
mesh.material.albedoColor = selected;

if(mesh.material.diffuseColor)
mesh.material.diffuseColor = selected;

});

});


// =============================
// 사이즈 표시 (선택된 것 기준)
// =============================

engine.runRenderLoop(()=>{

if(selectedMesh){

const bounding = selectedMesh.getHierarchyBoundingVectors();

const size = bounding.max.subtract(bounding.min);

sizeLabel.text =
`가로: ${(size.x*100).toFixed(1)} cm   `+
`세로: ${(size.z*100).toFixed(1)} cm   `+
`높이: ${(size.y*100).toFixed(1)} cm`;

}else{
sizeLabel.text = "";
}

scene.render();

});

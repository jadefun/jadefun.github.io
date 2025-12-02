import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';

var myCanvas = document.getElementById("canvas");
myCanvas.width = window.innerWidth;
myCanvas.height = window.innerHeight;
var renderer = new THREE.WebGLRenderer({
   antialias: true,
   canvas: myCanvas,
});

var aspectRatio = myCanvas.width / myCanvas.height

const UP = new THREE.Vector3(0, 1, 0);
const DOWN = new THREE.Vector3(0, -1, 0);

const FORWARD = new THREE.Vector3(0, 0, 1);
const BACK = new THREE.Vector3(0, 0, -1);

const RIGHT = new THREE.Vector3(1, 0, 0);
const LEFT = new THREE.Vector3(-1, 0, 0);

const worldVectors = [UP, DOWN, RIGHT, LEFT, FORWARD, BACK];

//const renderer = new THREE.WebGLRenderer({antialias: true});
//renderer.setSize(window.innerWidth, window.innerHeight);
//document.body.appendChild(renderer.domElement);

const envTextureLoader = new THREE.CubeTextureLoader();
envTextureLoader.setPath('textures/env/home/');

const envCube = envTextureLoader.load([
	'right.png', 'left.png', 'top.png', 
    'bottom.png', 'front.png', 'back.png'
]);

const textureLoader = new THREE.TextureLoader()

const homeText = textureLoader.load('textures/cube/home.png'); 
homeText.magFilter = THREE.NearestFilter
homeText.format = THREE.RGBAFormat

const topText = textureLoader.load('textures/cube/top.png'); 
topText.magFilter = THREE.NearestFilter
topText.format = THREE.RGBAFormat

const leftText = textureLoader.load('textures/cube/left.png'); 
leftText.magFilter = THREE.NearestFilter
leftText.format = THREE.RGBAFormat

const rightText = textureLoader.load('textures/cube/right.png'); 
rightText.magFilter = THREE.NearestFilter
rightText.format = THREE.RGBAFormat

const bottomText = textureLoader.load('textures/cube/bottom.png'); 
bottomText.magFilter = THREE.NearestFilter
bottomText.format = THREE.RGBAFormat

const homeRough = textureLoader.load('textures/cube/homeRough.png');
homeRough.magFilter = THREE.NearestFilter
homeRough.format = THREE.RGBAFormat

const emptyText = textureLoader.load('textures/cube/empty.png'); 
emptyText.magFilter = THREE.NearestFilter
emptyText.format = THREE.RGBAFormat

const emptyRough = textureLoader.load('textures/cube/emptyRough.png');
emptyRough.magFilter = THREE.NearestFilter
emptyRough.format = THREE.RGBAFormat

const pmremGenerator = new THREE.PMREMGenerator(renderer);
const scene = new THREE.Scene();
scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.04).texture;
//scene.environment = pmremGenerator.fromCubemap(envCube).texture
//scene.background = envCube
const objloader = new OBJLoader();
objloader.load(
    'models/cube.obj',
    function(object) {
        object.name = "jadecube"
        object.traverse((mesh) => {
            mesh.material = cubeMat;
        });
        scene.add(object)
    },
    function(error) {
        console.log(error);
    }
);
const fov = 45
const camera = new THREE.PerspectiveCamera(fov, window.innerWidth / window.innerHeight, 0.1, 1000);
const a_light = new THREE.AmbientLight(0x404040);
const d_light = [
    new THREE.DirectionalLight(0xffffff, 1),
    new THREE.DirectionalLight(0xffffff, 0.5),
    new THREE.DirectionalLight(0xffffff, 0.2)

];

//const geometry = new THREE.BoxGeometry(2, 2, 2);
const cubeMat = new THREE.MeshStandardMaterial({
    map: homeText,
    //color: 0xFFFFFF,
    side: THREE.DoubleSide, 
    transparent: true, 
    opacity: 1,
    roughness: 0.1,
    metalness: 0.7,
    roughnessMap: homeRough,
    metalnessMap: homeRough,
    envMap: envCube,
    envMapIntensity: 5
});
var cube = null//new THREE.Mesh(geometry, material);
var cubeCSS = document.getElementById("cubeCSS");
var cubeSides = document.getElementsByClassName("side")
var target = new THREE.Object3D
scene.add(a_light);

for (let i = 0; i < d_light.length; i++) {
    scene.add(d_light[i]);
    d_light[i].target = target
}
d_light[0].position.x = 2;
d_light[0].position.y = 3.5;
d_light[0].position.z = 4.5;

d_light[1].position.x = -3;
d_light[1].position.y = 0;
d_light[1].position.z = 4.5;

d_light[2].position.x = 3;
d_light[2].position.y = 2;
d_light[2].position.z = -4;

camera.position.z = 7.5;

var start = 0

var rotating = false
var rotVelX = 0
var rotVelY = 0

const string = String()
var perspectiveVal = Math.pow(myCanvas.width/2 * myCanvas.width/2 + myCanvas.height/2 * myCanvas.height/2, 0.5) / Math.tan((fov * 0.5) * Math.PI / 180)
console.log(perspectiveVal)
var targetScaleX = 2.25 * aspectRatio
var targetScaleY = 2.25

const period = 0.00075

function animate() {
    var delta = Date.now() - start;
    if (cube == null) {
        var jadecube = scene.getObjectByName("jadecube")
        cube = scene.getObjectByName("jadecube")
    } else {
        cubeCSS.style.transform = string.concat("perspective(", perspectiveVal, "px) translateY(", -cube.position.y * (window.innerHeight / 6), "px) rotateX(", -cube.rotation.x,"rad)", 
            "rotateY(", cube.rotation.y,"rad)",
             "rotateZ(", -cube.rotation.z,"rad)"
        )

        cubeMat.envMapRotation.y = Math.sin((Date.now() * period * 0.5) + 0.5 * Math.PI) * 0.15;
        cubeMat.envMapRotation.x = Math.sin((Date.now() + 200) * period * 0.5) * 0.15;

        //current_value = start_value + (end_value - start_value) * a
        if (!rotating) {
            rotateCube(cube, getClosestWorldVector(cube))
            switch(getClosestWorldVector(cube)) {
                case(UP):
                case(DOWN):
                    cube.scale.x = cube.scale.x + (targetScaleX - cube.scale.x) * 0.2
                    cube.scale.y = cube.scale.y + (0.5 - cube.scale.y) * 0.2
                    cube.scale.z = cube.scale.z + (targetScaleY - cube.scale.z) * 0.2

                    cubeMat.map = emptyText
                    cubeMat.roughnessMap = emptyRough
                    cubeMat.metalnessMap = emptyRough
                    break
                case(LEFT):
                case(RIGHT):
                    cube.scale.x = cube.scale.x + (0.5 - cube.scale.x) * 0.2
                    cube.scale.y = cube.scale.y + (targetScaleY - cube.scale.y) * 0.2
                    cube.scale.z = cube.scale.z + (targetScaleX - cube.scale.z) * 0.2

                    cubeMat.map = emptyText
                    cubeMat.roughnessMap = emptyRough
                    cubeMat.metalnessMap = emptyRough
                    break
                case (FORWARD):
                    cubeSway(cube)
                    cube.scale.x = cube.scale.x + (1 - cube.scale.x) * 0.2
                    cube.scale.y = cube.scale.y + (1 - cube.scale.y) * 0.2
                    cube.scale.z = cube.scale.z + (1 - cube.scale.z) * 0.2

                    if (cubeMat.map == emptyText) {
                        cubeMat.map = homeText
                    }
                    cubeMat.roughnessMap = homeRough
                    cubeMat.metalnessMap = homeRough
                    break
            }
            switch(getClosestWorldVector(cube)) {
                case(FORWARD):
                setClosestSide(4, cube.scale.x, cube.scale.y)
                break
                case(UP):
                setClosestSide(1, cube.scale.x, cube.scale.z)
                break
                case(DOWN):
                setClosestSide(0, cube.scale.x, cube.scale.z)
                break
                case(LEFT):
                setClosestSide(3, cube.scale.z, cube.scale.y)
                break
                case(RIGHT):
                setClosestSide(2, cube.scale.z, cube.scale.y)
                break
            }
        }
        
        if (keys["ArrowUp"] || keys["w"]) {
            //rotVelX = 0.23 + (Math.random() * 0.02)
            rotUp()
            //rotateCube(cube, DOWN)
            keys["ArrowUp"] = false
            keys["w"] = false
            rotating = true
        } else if (keys["ArrowDown"] || keys["s"]) {
            //rotVelX = -0.23 + (Math.random() * 0.02)
            rotDown()
            //rotateCube(cube, UP)
            keys["ArrowDown"] = false
            keys["s"] = false
            rotating = true
        } else if (keys["ArrowLeft"] || keys["a"]) {
            //rotVelY = 0.23
            rotLeft()
            keys["ArrowLeft"] = false
            keys["a"] = false
            rotating = true
        } else if (keys["ArrowRight"] || keys["d"]) {
            //rotVelY = -0.23
            rotRight()
            keys["ArrowRight"] = false
            keys["d"] = false
            rotating = true
        } else {
            rotating = false
        }

        //var forward = new THREE.Vector3()
        //cube.getWorldDirection(forward)
        //console.log(forward.dot(UP))

        //cube.rotation.x += rotVelX
        cube.rotateOnWorldAxis(RIGHT, rotVelX)
        rotVelX *= 0.92

        //cube.rotation.z = 0
        cube.rotateOnWorldAxis(UP, rotVelY)
        rotVelY *= 0.92

        renderer.render(scene, camera);
    }
    start = Date.now()
}
renderer.setAnimationLoop(animate);

function rotateCube(cube, targetVector) {
    var forward = new THREE.Vector3()
    cube.getWorldDirection(forward)
    target.lookAt(targetVector)
    cube.quaternion.slerp(target.quaternion, 0.1)
}

function cubeSway(cube) {
    //Position
    cube.position.y = Math.sin(Date.now() * period) * 0.20;
    //X
    cube.rotateOnWorldAxis(RIGHT, Math.sin((Date.now() + 1000) * period) * 0.015);
    //Y
    cube.rotateOnWorldAxis(UP, Math.sin((Date.now() * period) + 0.5 * Math.PI) * 0.015);
    //Z
    cube.rotateOnWorldAxis(FORWARD, -Math.sin(Date.now() * period) * 0.008);
}

function getClosestWorldVector(object) {
    var forward = new THREE.Vector3()
    var closestVector;
    var maxDot = -1;
    object.getWorldDirection(forward)
    for (let i = 0; i < worldVectors.length - 1; i++) {
        if (forward.dot(worldVectors[i]) > maxDot) {
            maxDot = forward.dot(worldVectors[i])
            closestVector = worldVectors[i]
        }
    }
    return closestVector
}

function setClosestSide(side, scaleX, scaleY) {
    for (let i = 0; i < cubeSides.length; i++) {
        if (i == side) {
            cubeSides[i].style.visibility = "visible"
            cubeSides[i].style.width = string.concat(scaleX * (window.innerHeight / 3.75), "px")
            cubeSides[i].style.height = string.concat(scaleY * (window.innerHeight / 3.75), "px")
        } else {
            cubeSides[i].style.visibility = "hidden"
            cubeSides[i].style.width = "0px"
            cubeSides[i].style.height = "0px"
        }
    }
}

var topButton = document.getElementById('topButton');
var leftButton = document.getElementById('leftButton');
var rightButton = document.getElementById('rightButton');
var bottomButton = document.getElementById('bottomButton');

var topBackButton = document.getElementById('topBackButton');
var leftBackButton = document.getElementById('leftBackButton');
var rightBackButton = document.getElementById('rightBackButton');
var bottomBackButton = document.getElementById('bottomBackButton');

topButton['onclick'] = rotUp;
leftButton['onclick'] = rotLeft;
rightButton['onclick'] = rotRight;
bottomButton['onclick'] = rotDown;

topBackButton['onclick'] = rotDown;
leftBackButton['onclick'] = rotRight;
rightBackButton['onclick'] = rotLeft;
bottomBackButton['onclick'] = rotUp;

topButton['onmouseover'] = function () { if (getClosestWorldVector(cube) == FORWARD) cubeMat.map = topText};
topButton['onmouseout'] = function () {if (getClosestWorldVector(cube) == FORWARD) cubeMat.map = homeText};

leftButton['onmouseover'] = function () { if (getClosestWorldVector(cube) == FORWARD) cubeMat.map = leftText};
leftButton['onmouseout'] = function () {if (getClosestWorldVector(cube) == FORWARD) cubeMat.map = homeText};

rightButton['onmouseover'] = function () { if (getClosestWorldVector(cube) == FORWARD) cubeMat.map = rightText};
rightButton['onmouseout'] = function () {if (getClosestWorldVector(cube) == FORWARD) cubeMat.map = homeText};

bottomButton['onmouseover'] = function () { if (getClosestWorldVector(cube) == FORWARD) cubeMat.map = bottomText};
bottomButton['onmouseout'] = function () {if (getClosestWorldVector(cube) == FORWARD) cubeMat.map = homeText};

function rotUp() {
    rotVelX = 0.23 + (Math.random() * 0.02)
}

function rotLeft() {
    rotVelY = 0.23 + (Math.random() * 0.02)
}

function rotRight() {
    rotVelY = -(0.23 + (Math.random() * 0.02))
}

function rotDown() {
    rotVelX = -(0.23 + (Math.random() * 0.02))
}

const delta = 6;
let startX;
let startY;


myCanvas.addEventListener('mousedown', function (event) {
    startX = event.pageX;
    startY = event.pageY;
});

myCanvas.addEventListener('mousemove', function (event) {
    const diffX = Math.abs(event.pageX - startX);
    const diffY = Math.abs(event.pageY - startY);

    if (diffX < delta && diffY < delta) {
        //click
    } else if (event.buttons == 1) {
        rotating = true
        rotVelX = (event.movementY / window.innerHeight) * Math.PI * 2;
        rotVelY = (event.movementX / window.innerWidth) * Math.PI * 2;
    }
});

myCanvas.addEventListener('mouseup', function (event) {
    rotating = false
});

myCanvas.addEventListener('mouseleave', function (event) {
    rotating = false
});

var keys = []

window.addEventListener('keydown', function (event) {
    if (!event.repeat) {
        keys[event.key] = true;
    } else {
        keys[event.key] = false;
    }
    
});

window.addEventListener('keyup', function (event) {
    keys[event.key] = false;
});

window.addEventListener('resize', function (event) {
    myCanvas.width = window.innerWidth
    myCanvas.height = window.innerHeight
    aspectRatio = myCanvas.width / myCanvas.height
    targetScaleX = 2 * aspectRatio
    targetScaleY = 2
    camera.updateProjectionMatrix();
    camera.aspect = aspectRatio
    renderer.setSize(myCanvas.width, myCanvas.height)
});
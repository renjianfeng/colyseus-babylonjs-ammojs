import "./index.css";

import * as BABYLON from "babylonjs";
import Keycode from "keycode.js";

import { client } from "./game/network";
import { AmmoJSPlugin } from 'babylonjs';

// Re-using server-side types for networking
// This is optional, but highly recommended
import { StateHandler } from "../../server/src/rooms/StateHandler";

main()

async function main(){
    await window["Ammo"]()

// import { PressedKeys } from "../../server/src/entities/Player";

const canvas = document.getElementById('game') as HTMLCanvasElement;
const engine = new BABYLON.Engine(canvas, true);

// This creates a basic Babylon Scene object (non-mesh)
var scene = new BABYLON.Scene(engine);
scene.enablePhysics(new BABYLON.Vector3(0, -10, 0), new AmmoJSPlugin(true, Ammo));


// This creates and positions a free camera (non-mesh)
var camera = new BABYLON.FollowCamera("camera1", new BABYLON.Vector3(0, 5, -10), scene);

// This targets the camera to scene origin
camera.setTarget(BABYLON.Vector3.Zero());

// This attaches the camera to the canvas
camera.attachControl(true);

// This creates a light, aiming 0,1,0 - to the sky (non-mesh)
var light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);

// Default intensity is 1. Let's dim the light a small amount
light.intensity = 0.7;

// Our built-in 'ground' shape. Params: name, width, depth, subdivs, scene
var ground = BABYLON.Mesh.CreateGround("ground1", 160, 160, 2, scene);
ground.position.y=-5
ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 0, friction: 0.5, restitution: 0.7 }, scene);

var box = BABYLON.Mesh.CreateBox("box", 2, scene);
box.position.y = 1;
box.physicsImpostor = new BABYLON.PhysicsImpostor(box, BABYLON.PhysicsImpostor.BoxImpostor, { mass: 1, restitution: 0.9 }, scene);
box.material = new BABYLON.StandardMaterial("s-mat", scene);
box.material["diffuseColor"] = new BABYLON.Color3(0, 0, 1);
box.material["emissiveTexture"] = new BABYLON.Texture("./src/grass.png", scene);
// Attach default camera mouse navigation
// camera.attachControl(canvas);

// Colyseus / Join Room

let sessionId

let isUpdateBox=false;


client.joinOrCreate<StateHandler>("game").then(room => {
    const playerViews: {[id: string]: BABYLON.Mesh} = {};

    room.state.players.onAdd = function(player, key) {
        // Our built-in 'sphere' shape. Params: name, subdivs, size, scene
        playerViews[key] = BABYLON.Mesh.CreateSphere("sphere1", 16, 2, scene);

        player.position.onChange = () => {
           
            if(key != room.sessionId){
   
                if( Math.abs(playerViews[key].position.x)<0.2&&Math.abs(playerViews[key].position.y)<0.5&&Math.abs(playerViews[key].position.x)<0.2){
                    playerViews[key].position=new BABYLON.Vector3(player.position.x, player.position.y, player.position.z)
                }else{
                    playerViews[key].physicsImpostor.setLinearVelocity(
                        new BABYLON.Vector3((player.position.x-playerViews[key].position.x)*10,
                        (player.position.y-playerViews[key].position.y)*10,
                        (player.position.z-playerViews[key].position.z)*10))
                     //   box.rotationQuaternion=BABYLON.Quaternion.Slerp(box.rotationQuaternion,new BABYLON.Quaternion(message.quaternion.x, message.quaternion.y, message.quaternion.z,message.quaternion.w),0.4)

                    //  playerViews[key].physicsImpostor.setAngularVelocity(
                    //     new BABYLON.Quaternion((player.quaternion.x- playerViews[key].rotationQuaternion.x)*5,
                    //     (player.quaternion.y- playerViews[key].rotationQuaternion.y)*5,
                    //     (player.quaternion.z- playerViews[key].rotationQuaternion.z)*5,
                    //     (player.quaternion.w- playerViews[key].rotationQuaternion.w)*5)
                    //     )
                        playerViews[key].rotationQuaternion=BABYLON.Quaternion.Slerp(playerViews[key].rotationQuaternion,new BABYLON.Quaternion(player.quaternion.x, player.quaternion.y, player.quaternion.z,player.quaternion.w),0.4)
                }
                
            }
        };

        // Set camera to follow current player
        if (key === room.sessionId) {
            sessionId=key
            playerViews[key].position=new BABYLON.Vector3(4*Math.random(),0,3*Math.random());
            playerViews[key].physicsImpostor = new BABYLON.PhysicsImpostor(playerViews[key], BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0.9 }, scene);
            playerViews[key].physicsImpostor.physicsBody.setActivationState(4)
            playerViews[key].material = new BABYLON.StandardMaterial("s-mat", scene);
            playerViews[key].material["diffuseColor"] = new BABYLON.Color3(1, 0, 0);
            playerViews[key].material["emissiveTexture"] = new BABYLON.Texture("./src/grass.png", scene);
            box.physicsImpostor.registerOnPhysicsCollide( playerViews[sessionId].physicsImpostor, function(main, collided) {
                room.send('boxUpdate', {
                    targetId:sessionId,
                    position:{x: box.position.x,y: box.position.y,z:box.position.z},
                    quaternion:{x:box.rotationQuaternion.x,y:box.rotationQuaternion.y,z:box.rotationQuaternion.z,w:box.rotationQuaternion.w}
                });
            });
        }else{
            playerViews[key].position=new BABYLON.Vector3(0,0,0);
            playerViews[key].physicsImpostor = new BABYLON.PhysicsImpostor(playerViews[key], BABYLON.PhysicsImpostor.SphereImpostor, { mass: 1, restitution: 0 }, scene);
            playerViews[key].physicsImpostor.physicsBody.setActivationState(4)
            playerViews[key].material = new BABYLON.StandardMaterial("s-mat", scene);
            playerViews[key].material["emissiveTexture"] = new BABYLON.Texture("./src/grass.png", scene);
            playerViews[key].material["diffuseColor"] = new BABYLON.Color3(0, 1, 0);
        }
    };

    


    room.onMessage("boxUpdate", (message) => {
        console.log("message received from server");
        console.log(message);
        if(message.targetId==null||message.targetId==sessionId){
            isUpdateBox=true
            box.material["diffuseColor"] = new BABYLON.Color3(1, 0, 0);
        }else{
            isUpdateBox=false
            box.material["diffuseColor"] = new BABYLON.Color3(0, 1, 0);
            box.position= BABYLON.Vector3.Lerp(box.position,new BABYLON.Vector3(message.position.x, message.position.y, message.position.z),  0.5)
            box.rotationQuaternion=BABYLON.Quaternion.Slerp(box.rotationQuaternion,new BABYLON.Quaternion(message.quaternion.x, message.quaternion.y, message.quaternion.z,message.quaternion.w),0.4)
        }
    });

    room.state.players.onRemove = function(player, key) {
        scene.removeMesh(playerViews[key]);
        delete playerViews[key];
    };

    room.onStateChange((state) => {
        console.log("New room state:", state.toJSON());
    });

    // Keyboard listeners
     const keyboard = { x: 0, y: 0 };
    window.addEventListener("keydown", function(e) {
        if (e.which === Keycode.LEFT) {
            keyboard.x = -10;
        } else if (e.which === Keycode.RIGHT) {
            keyboard.x = 10;
        } else if (e.which === Keycode.UP) {
            keyboard.y = 10;
        } else if (e.which === Keycode.DOWN) {
            keyboard.y = -10;
        }
        playerViews[sessionId].physicsImpostor.setLinearVelocity(new BABYLON.Vector3(keyboard.x, 0, keyboard.y))
    });

    window.addEventListener("keyup", function(e) {
        if (e.which === Keycode.LEFT) {
            keyboard.x = 0;
        } else if (e.which === Keycode.RIGHT) {
            keyboard.x = 0;
        } else if (e.which === Keycode.UP) {
            keyboard.y = 0;
        } else if (e.which === Keycode.DOWN) {
            keyboard.y = 0;
        }

        playerViews[sessionId].physicsImpostor.setLinearVelocity(new BABYLON.Vector3(0, 0, 0))
       
    });

    engine.runRenderLoop(function() {
        if(room&&playerViews[sessionId]){
           // camera.setTarget(playerViews[sessionId].position);
            room.send('playData', {
                position:{x: playerViews[sessionId].position.x,y: playerViews[sessionId].position.y,z: playerViews[sessionId].position.z},
                quaternion:{
                    x:playerViews[sessionId].rotationQuaternion.x,
                    y:playerViews[sessionId].rotationQuaternion.y,
                    z:playerViews[sessionId].rotationQuaternion.z,
                    w:playerViews[sessionId].rotationQuaternion.w}
            });
            if(isUpdateBox){
                room.send('boxUpdate', {
                    targetId:sessionId,
                    position:{x: box.position.x,y: box.position.y,z:box.position.z},
                    quaternion:{x:box.rotationQuaternion.x,y:box.rotationQuaternion.y,z:box.rotationQuaternion.z,w:box.rotationQuaternion.w}
                });
            }
        }
    });

    // Resize the engine on window resize
    window.addEventListener('resize', function() {
        engine.resize();
    });
});

// Scene render loop
engine.runRenderLoop(function() {
    scene.render();
});
}



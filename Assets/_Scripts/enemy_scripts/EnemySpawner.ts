import WorldCameraFinderProvider from "SpectaclesInteractionKit.lspkg/Providers/CameraProvider/WorldCameraFinderProvider";
import {Lerp} from "./Lerp";
import { SpellMovement } from "_Scripts/SpellMovement";
import { PlayerHealth } from "_Scripts/Player/PlayerHealth";

@component
export class EnemySpawner extends BaseScriptComponent {

    timer : number= 0.0;
    spawnInterval : number = 3.0;
    @input
    spawnParent : SceneObject;  
    @input
    enemyPrefab : ObjectPrefab;
    public currentEnemy : SceneObject;
 
    @input 
    manAudio:AudioComponent

    private mCamera = WorldCameraFinderProvider.getInstance();
    onAwake() {
        print("EnemySpawner onAwake")
        this.spawnParent = this.getSceneObject();
        
    }

    startSpawning() {
        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
    }

    onUpdate()
    {
        if (!this.enemyPrefab || this.spawnInterval <= 0) {
            return;
        }

        var deltaTime = getDeltaTime();
        this.timer += deltaTime;

        if (this.timer >= this.spawnInterval) {
            print("spawn!")
            this.spawnNewInstance();
            this.timer -= this.spawnInterval;
        }
    }  

    private spawnNewInstance() 
    {   
        this.currentEnemy = this.enemyPrefab.instantiate(this.spawnParent);
        //this.currentEnemy.name = 'Pepe' + Math.random();
        this.currentEnemy.enabled = true
        
        var pos = this.getRandomSpawnPosition(200)

        this.currentEnemy.getTransform().setWorldPosition(pos)
        print("enemy-pos: "+ this.currentEnemy.getTransform())
        // get rotation to make the enemy face the player
        // look dir
        let dir = this.getTransform().getWorldPosition().sub(this.currentEnemy.getTransform().getWorldPosition())
        // angle
        let rotation = quat.rotationFromTo(vec3.left(), dir)
        this.currentEnemy.getTransform().setWorldRotation(rotation)
        this.currentEnemy.getTransform().setWorldScale(vec3.one().uniformScale(10))
        const lerp = this.currentEnemy.createComponent(Lerp.getTypeName())
        
        lerp.Init()
        
        // add collisions
        let body = this.currentEnemy.createComponent('Physics.BodyComponent')
        body.shape = Shape.createBoxShape();
        body.mass = 0
        this.currentEnemy.getComponent('Physics.ColliderComponent').onCollisionEnter.add((e) =>
        {
            var collision = e.collision;
            print("OTHER COLLIDER NAME: " + collision.collider.sceneObject.name)
            print(this.currentEnemy.name)

            if (collision.collider.sceneObject.name.includes("Player"))
            {
                // collide with player
                print("COLLISION: player and pepe")
                collision.collider.sceneObject.getComponent(PlayerHealth.getTypeName()).takeDamage()
                // make noise
                //this.manAudio.play(1);

            }
            else if (e.collision.collider.sceneObject.name.includes("Spell"))
            {
                // collide with spells
                // doesnt work 
                print("COLLISION: spell and pepe")

                print(this.currentEnemy.name)
                //this.currentEnemy.enabled = false
                //this.currentEnemy.sceneObject.destroy();  
                this.currentEnemy.enabled = false            
            }
        })
        /*
        if (this.currentEnemy.getComponent(Lerp.getTypeName()) != null )
        {
            //this.currentEnemy.getComponent(Lerp.getTypeName()).init(this.getRandomSpawnPosition(2.5)) // TODOO: need pass position
            print("New instance spawned from prefab!");
        }*/}   
         private getRandomSpawnPosition(radius: number): vec3
    {
        
            var angle = Math.random() * (2 * Math.PI * 0.33 - 1) + Math.PI * 0.33 ; // 30 degrees each side
            var forward = this.mCamera.getTransform().forward
            var point = forward.uniformScale(-radius).add(this.mCamera.getWorldPosition())
            //var desiredPosition = quat.angleAxis(angle, vec3.up()).multiplyVec3(point)

        return point;
    }

}

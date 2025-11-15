@component
export class SpellMovement extends BaseScriptComponent {

    @input
    speed: number = 10;
    onAwake(){
        this.createEvent("UpdateEvent").bind(this.onUpdate.bind(this));
    }

    onUpdate()
    {
       var transform = this.sceneObject.getTransform();
       var pos = transform.getWorldPosition();
       pos.z -= this.speed * getDeltaTime();
       transform.setWorldPosition(pos);
    }
}

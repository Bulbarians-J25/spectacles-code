import {EnemySpawner}  from "_Scripts/enemy_scripts/EnemySpawner";

@component
export class PlayerHealth extends BaseScriptComponent {
    health: number = 3;
    @input
    public enemySpawner: EnemySpawner

    @input infoText: Text;

    @input startImage: Image

    @input deathImage: Image

    death()
    {
        this.enemySpawner.enabled = false

        this.startImage = this.deathImage
        this.infoText.text = "YOU LOST! :("


        
    }
    public takeDamage()
    {
        if(--this.health <= 0)
            this.death()        
    }
}
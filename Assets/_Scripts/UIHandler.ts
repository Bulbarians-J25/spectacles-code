
import { RectangleButton } from '../_Packages/SpectaclesUIKit.lspkg/Scripts/Components/Button/RectangleButton';
import {GestureHandler} from "./GestureHandler";


@component
export class UIHandler extends BaseScriptComponent {

    @input
    public startButton: RectangleButton;

    @input
    public startText: Text;

    @input
    spellModel: SceneObject;

    @input
    gestureGPTScript: GestureHandler;
    
    onAwake() {  


        // attach events
        this.startButton.onTriggerUp.add(() => {
            print('Start fully triggered!');
            this.spellModel = this.gestureGPTScript.getSpellObject("Water")
        });
  
    }

    startGame() {

    }



}

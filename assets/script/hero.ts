import { _decorator, Component, Node, PhysicsSystem2D, Contact2DType, Collider2D, IPhysics2DContact, RigidBody, RigidBody2D, EPhysics2DDrawFlags, log} from 'cc';
const { ccclass, property } = _decorator;

@ccclass('hero')
export class hero extends Component {

    public isMoving:boolean=false

    start() {
        
    }

    onLoad(){
        this.isMoving=false
    }

    

    update(deltaTime: number) {
        
    }
}



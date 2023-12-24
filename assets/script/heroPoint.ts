import { _decorator, Component, Node, PhysicsSystem2D, Contact2DType, Collider2D, IPhysics2DContact, RigidBody, RigidBody2D, EPhysics2DDrawFlags, log, Vec3, tween} from 'cc';
import { block } from './block';
const { ccclass, property } = _decorator;

@ccclass('hero')
export class hero extends Component {


    start() {
        
    }

    onLoad(){
        //更改项目设置2D物理系统为内置
        //注册所有碰撞体的回调函数
        let colliders = this.node.getComponents(Collider2D);
        colliders.forEach(collider => {
            collider.on(Contact2DType.BEGIN_CONTACT, this.onBeginContact, this);
            collider.on(Contact2DType.END_CONTACT, this.onEndContact, this);
            collider.on(Contact2DType.PRE_SOLVE, this.onPreSolve, this);
            collider.on(Contact2DType.POST_SOLVE, this.onPostSolve, this);
        });
        
    }

    // 只在两个碰撞体开始接触时被调用一次
    onBeginContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {
        let Block=otherCollider.node.parent.getComponent(block)
        if(Block) {
            if(Block.score==0){  //判断得分
                if(otherCollider.tag==10&&selfCollider.tag==1000) {  //hero中心点和块的中心点碰撞
                    Block.score=2
                    Block.collide=true
                    window.gameSubject.addScore(2)
                } else if (otherCollider.tag==11&&selfCollider.tag==1000) {  //hero中心点和块碰撞
                    Block.score=1
                    Block.collide=true
                    window.gameSubject.addScore(1)
                } 
            } 

            if(window.gameSubject.blockGetScore==-1) {
                if(otherCollider.tag==10&&selfCollider.tag==1000) {  
                    window.gameSubject.blockGetScore=2
                } else if (otherCollider.tag==11&&selfCollider.tag==1000) {  
                    window.gameSubject.blockGetScore=1
                } else if (otherCollider.tag==11&&selfCollider.tag==1001) {  //hero和块碰撞
                    window.gameSubject.blockGetScore=0
                    let pos_blockPoint=Block.pos_pointWorld
                    let pos_hero=window.gameSubject.hero.getPosition()
                    let pos_intersect=Vec3.subtract(new Vec3(),pos_blockPoint,pos_hero)
                    if(pos_intersect.x>0) {  //hero在块上白点左边
                        tween(window.gameSubject.hero)
                            .to(0.3,{angle: window.gameSubject.hero.angle+30})
                            .then(tween().call(()=>{
                                window.gameSubject.nodeOver.active=true
                            }))
                            .start()
                    } else {  //hero在块上白点右边
                        tween(window.gameSubject.hero)
                            .to(0.3,{angle: window.gameSubject.hero.angle-30})
                            .then(tween().call(()=>{
                                window.gameSubject.nodeOver.active=true
                            }))
                            .start()
                    }
                    window.gameSubject.gameType=2
                }
            }
        }
    }

    // 只在两个碰撞体结束接触时被调用一次
    onEndContact (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

    }

    // 每次将要处理碰撞体接触逻辑时被调用
    onPreSolve (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

    }

    // 每次处理完碰撞体接触逻辑时被调用
    onPostSolve (selfCollider: Collider2D, otherCollider: Collider2D, contact: IPhysics2DContact | null) {

    }

    update(deltaTime: number) {
        
    }
}



import { _decorator, Component, Node, Vec3 ,log, tween, game, UITransform, Animation } from 'cc';
const { ccclass, property } = _decorator;
import { Game } from './game';

@ccclass('block')
export class block extends Component {

    private pos_pointParent:Vec3
    private arrChildren:Node[]=[]
    public collide:boolean=false
    public pos_pointWorld:Vec3
    public score:number
    public blockType:number

    start() {

    }

    onLoad(){
        this.arrChildren=this.node.children
        this.score=0
    }

    init(pos_point,blockType,isFirst){
        this.score=0
        this.collide=false
        this.blockType=blockType
        this.pos_pointParent=this.arrChildren[blockType].getChildByName('point').getPosition()
        let pos_node=new Vec3(pos_point.x-this.pos_pointParent.x,pos_point.y-this.pos_pointParent.y)
        this.node.setPosition(pos_node.x,pos_node.y+100)
        if(isFirst){
            this.node.setPosition(pos_node)
        } else {
            tween(this.node)
            .to(0.3,{position:new Vec3(pos_node.x,pos_node.y-10)})
            .then(tween().to(0.05,{position:new Vec3(pos_node.x,pos_node.y+10)}))
            .then(tween().to(0.05,{position:new Vec3(pos_node.x,pos_node.y-3)}))
            .then(tween().to(0.03,{position:new Vec3(pos_node.x,pos_node.y)}))
            .then(tween().call(()=>window.gameSubject.moveDis()))
            .start()
        }
        this.pos_pointWorld=pos_point
        this.displayBlock()
    }

    touchBegin(dt){  //蓄力动作
        let scaleY=this.node.scale.y
        let scaleX=this.node.scale.x
        scaleY-=dt/6
        if(scaleY<=0.8) {
            scaleY=0.8
        }
        this.node.setScale(1,scaleY)
        
        scaleX+=dt/10
        if(scaleX>=1.2){
            scaleX=1.2
        }
        window.gameSubject.hero.setScale(scaleX,scaleY)

        if(scaleY>0.8) {
            let hero_pos=window.gameSubject.hero.getPosition()
            let blockHeight=this.arrChildren[this.blockType].getChildByName('block').getComponent(UITransform).height
            window.gameSubject.hero.setPosition(hero_pos.x,hero_pos.y-dt/8*blockHeight)
        }
    }

    touchEnd(){
        window.gameSubject.hero.setScale(1,1)
        let scaleY=1-this.node.scale.y
        tween(this.node)
            .to(scaleY/5,{scale:new Vec3(1+scaleY/2,1)})
            .then(tween().to(scaleY/8,{scale:new Vec3(1-scaleY/5,1)}))
            .then(tween().to(scaleY/10,{scale:new Vec3(1,1)}))
            .start()
    }

    displayBlock(){
        let chiledren=this.node.children
        for(let i=0;i<chiledren.length;i++){
            if(i==this.blockType){
                chiledren[i].active=true
            } else {
                chiledren[i].active=false
            }
        }
    }

    setPointPos(){
        let pos_node=this.node.getPosition()
        this.pos_pointWorld=new Vec3(pos_node.x+this.pos_pointParent.x,pos_node.y+this.pos_pointParent.y)
    }

    playAnim(){
        const animationComponent = this.arrChildren[this.blockType].getChildByName('block').getComponent(Animation);
        if(animationComponent){
            animationComponent.play();
        }
    }

    update(deltaTime: number) {
        
    }
}



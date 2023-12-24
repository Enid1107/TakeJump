import { _decorator, Component, instantiate, log, Node, Prefab, sp, Sprite ,UITransform ,input, Input, EventTouch, tween, Vec3, Vec2, Tween, TweenSystem, NodePool, random, Quat, UI, director, RigidBody, PhysicsSystem2D, Contact2DType, Collider2D, IPhysics2DContact, RigidBody2D, math, Label, sys, UIOpacity, VideoPlayer} from 'cc';
import { item } from './item';
import { block } from './block';
import { hero } from './hero';
const { ccclass, property } = _decorator;



@ccclass('Game')
export class Game extends Component {

    @property(Node) 
    nodeRankings: Node;

    @property(Node)
    itemParent: Node;

    @property(Prefab)
    pre_item: Prefab;

    @property(Node)
    nodePlay: Node;

    @property(Node)
    nodeReady: Node;

    @property(Prefab)
    pre_block:Prefab

    @property(Node)
    hero:Node

    @property(Node)
    heroPoint:Node

    @property(Node)
    nodeOver:Node

    @property(Label)
    score:Label

    @property(Label)
    finalScore:Label

    @property(Label)
    bestScore:Label

    @property(Label)
    specialScore:Label

    @property(Node)
    specialAperture:Node

    @property(VideoPlayer)
    videoPlayer:VideoPlayer 

    private blockPool=new NodePool;
    private isMoving:boolean=false; // 是否正在移动
    private isTouchBegin:boolean=false;
    private timeTouch:number=0
    private isTouchStart:boolean=true
    private currentScore:number=0
    private doubleScore:number=1
    public isGetScore:number=-1
    public gameType:number=0;  //0:ready 1:play 2:over

    start() {
        
    }

    onLoad(){
        window.gameSubject=this
        this.nodeRankings.active=false  //最开始不显示排行榜
        this.nodePlay.active=false
        this.addItem(20)
        this.registerTouch()
        this.gameType=0
        this.doubleScore=1
        this.hero.active=false
        this.nodeOver.active=false
        let specialScoreUI=this.specialScore.node.getComponent(UIOpacity)
        specialScoreUI.opacity=0
        let specialApertureUI=this.specialAperture.getComponent(UIOpacity)
        specialApertureUI.opacity=0
    }

    addScore(num){
        if(this.callBackGetScore){
            this.unschedule(this.callBackGetScore)
        }
        if(num==2){
            this.doubleScore*=2
            num=this.doubleScore
            let maxIndex=this.hero.getSiblingIndex()
            this.specialAperture.setSiblingIndex(maxIndex-1)
            this.specialAperture.setPosition(this.hero.getPosition().x,this.hero.getPosition().y+20)
            let specialApertureUI=this.specialAperture.getComponent(UIOpacity)
            specialApertureUI.opacity=255
            tween(this.specialAperture)
                .to(0.5,{scale: new Vec3(3,3)})
                .then(tween().to(0.5,{scale: new Vec3(1,1)}))
                .start()
            tween(specialApertureUI)
                .to(0.5,{opacity: 0})
                .start()
        } else if(num==1){
            this.doubleScore=1
        }

        this.specialScore.node.setPosition(this.hero.getPosition().x,this.hero.getPosition().y+100)
        this.specialScore.string="+"+num.toString()
        let specialScoreUI=this.specialScore.node.getComponent(UIOpacity)
        specialScoreUI.opacity=255
        tween(this.specialScore.node)
            .by(1,{position: new Vec3(0,100)})
            .start()
        tween(specialScoreUI)
            .to(1,{opacity: 0})
            .start()

        this.currentScore+=num
        this.score.string=this.currentScore.toString()
        this.finalScore.string=this.currentScore.toString()
    }

    //动画块的动作
    specialBolck(){
        let children=this.node.children
        let cnt=0
        for(let i=children.length-1;i>=0;i--){
            let Block=children[i].getComponent(block)
            if(Block) {
                cnt++
                if(cnt==2&&Block.blockType>2) {
                    this.scheduleOnce(function(){
                        this.callBackGetScore(children[i].getComponent(block))
                    },5)
                }
            }
        }
    }

    callBackGetScore(node){
        if(this.gameType!=1) return
        this.addScore(10)
        node.playAnim()
    }
    
    judDis(){
        if(this.isMoving) return
        this.isMoving=true
        let arr_pos:Vec3[]=[]
        let children=this.node.children
        for(let i=children.length-1;i>=0;i--){
            let Block=children[i].getComponent(block)
            if(Block){
                arr_pos.push(Block.pos_pointWorld)
            }
        }
        let pos_vec=Vec3.subtract(new Vec3(),arr_pos[0],arr_pos[1]).normalize()
        let disMul=Math.random()/2+1;
        let pos_end=new Vec3(arr_pos[0].x+pos_vec.x*(Math.random()<0.5?1:-1)*disMul*300,arr_pos[0].y+pos_vec.y*disMul*300)
        let numBlock=Math.floor(Math.random()*4)
        let middleBlock=this.createBlock(pos_end,numBlock,false)
        let blockIndex=middleBlock.getSiblingIndex()
        this.hero.setSiblingIndex(blockIndex+1)
        log("arr="+arr_pos)
    }

    moveDis(){
        let arr_pos:Vec3[]=[]
        let children=this.node.children
        for(let i=children.length-1;i>=0;i--){
            let Block=children[i].getComponent(block)
            if(Block){
                arr_pos.push(Block.pos_pointWorld)
            }
        }
        let pos_move=new Vec3(-(arr_pos[0].x+arr_pos[1].x)/2,-(arr_pos[0].y-arr_pos[1].y))
        children=this.node.children
        log("move="+pos_move)
        for(let i=children.length-1;i>=0;i--){
            let Block=children[i].getComponent(block)
            if(Block){
                if(Block.pos_pointWorld.y<=-900) {
                    this.putBlockToPool(children[i])
                    continue
                }
                tween(children[i])
                    .by(0.5,{position:new Vec3(pos_move.x,pos_move.y)})
                    .then(tween().call(()=>{
                        Block.setPointPos();
                        this.isMoving=false;
                    }))
                    .start()
            }
        }
        tween(this.hero)
            .by(0.5,{position:new Vec3(pos_move.x,pos_move.y)})
            .start()
        
        tween(this.specialScore.node)
            .by(0.5,{position:new Vec3(pos_move.x,pos_move.y)})
            .start()

        this.specialBolck()
        log(children.length)
    }

    createBlock(pos_point,blockType,isFirst){
        let Block;
        if(this.blockPool.size()>0) {
            Block=this.blockPool.get()
        } else {
            Block=instantiate(this.pre_block)
        }
        Block.parent=this.node  //确保 block 被添加到场景中
        let blockIndex = Block.getSiblingIndex();
        log("顺序："+blockIndex)
        let getPos=Block.getComponent(block)
        getPos.init(pos_point,blockType,isFirst)
        return Block
    }

    putBlockToPool(block){
        this.blockPool.put(block)
    }

    registerTouch(){
        input.on(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.on(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.on(Input.EventType.TOUCH_END, this.onTouchEnd, this);
    }

    destroyTouch(){
        input.off(Input.EventType.TOUCH_START, this.onTouchStart, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchMove, this);
        input.off(Input.EventType.TOUCH_MOVE, this.onTouchEnd, this);
    }

    onTouchStart(event: EventTouch){
        if(this.gameType!=1) return
        if(this.isMoving) return
        if(this.hero.getComponent(hero).isMoving) return
        this.isTouchBegin=true
        this.timeTouch=0
        this.heroPoint.active=false
        this.isTouchStart=true
        this.isGetScore=-1
        
    }

    onTouchMove(event: EventTouch){
        if(this.gameType!=1) return
    }

    onTouchEnd(event: EventTouch){
        if(this.isTouchStart==false) return
        if(this.gameType!=1) return
        if(this.isMoving) return
        if(this.hero.getComponent(hero).isMoving) return
        this.isTouchBegin=false
        this.isTouchStart=false

        let pos_blockEnd=new Vec3(0,0)
        let num=0
        let children=this.node.children
        for(let i=children.length-1;i>=0;i--){
            let Block=children[i].getComponent(block)
            if(Block){
                num++;
                if(num==2){
                    Block.touchEnd()
                } else if(num==1){
                    pos_blockEnd=Block.pos_pointWorld
                }
            }
        }

        this.hero.getComponent(hero).isMoving=true
        let heroUI=this.hero.getComponent(UITransform)
        let pos_hero=this.hero.getPosition()
        let pos_vec=Vec3.subtract(new Vec3(),pos_blockEnd,pos_hero).normalize()
        let timeDir=this.timeTouch*8
        let endPos=new Vec3(pos_hero.x+pos_vec.x*timeDir,pos_hero.y+pos_vec.y*timeDir+heroUI.height/2)
        let height=timeDir/8

        if(pos_vec.x>0){
            this.jumpTo(pos_hero,endPos,height,0.4,-360)
        } else {
            this.jumpTo(pos_hero,endPos,height,0.4,360)
        }
    }

    jumpTo(startPos, endPos, height, duration,endAngle){
        let heroUI=this.hero.getComponent(UITransform)
        heroUI.anchorY=0.5
        this.hero.setPosition(startPos.x,startPos.y+heroUI.height/2)
        this.hero.angle=0

        let peakPos=new Vec3(
            (startPos.x+endPos.x)/2,
            Math.max(startPos.y,endPos.y)+height,
        );

        tween(this.hero)
            .parallel(
                tween().to(duration/2,{position: peakPos},{easing:'linear'})
                        .to(duration/2,{position: endPos},{easing:'linear'}),
                tween().to(duration,{angle: endAngle})
            )
            .call(()=>{
                heroUI.anchorY=0
                this.hero.setPosition(endPos.x,endPos.y-heroUI.height/2)
                this.heroPoint.active=true
                this.scheduleOnce(function(){
                    if(this.isGetScore==-1){
                        log("踩空")
                        this.heroPoint.active=false

                        let childrenBlocks=this.node.children.filter(child=>child.name ==='block');
                        let pos_hero=this.hero.getPosition()
                        let Block1=childrenBlocks[childrenBlocks.length-1]
                        let Block2=childrenBlocks[childrenBlocks.length-2]
                        let pos_point1=Block1.getComponent(block).pos_pointWorld
                        let pos_point2=Block2.getComponent(block).pos_pointWorld
                        if(pos_hero.x<pos_point1.x&&pos_hero.x>pos_point2.x){
                            this.hero.setSiblingIndex(Block1.getSiblingIndex()+1)
                            Block2.setSiblingIndex(this.hero.getSiblingIndex()+1)
                        } else if (pos_hero.x>pos_point1.x&&pos_hero.x>pos_point2.x){
                            this.hero.setSiblingIndex(Block1.getSiblingIndex()-1)
                            Block2.setSiblingIndex(this.hero.getSiblingIndex()-1)
                        } else if (pos_hero.x<pos_point1.x&&pos_hero.x<pos_point2.x){
                            this.hero.setSiblingIndex(Block1.getSiblingIndex()-1)
                            Block2.setSiblingIndex(this.hero.getSiblingIndex()-1)
                        }

                        let maxIndex=this.getMaxIndex()
                        this.nodeOver.setSiblingIndex(maxIndex+1)

                        tween(this.hero)
                            .by(0.3,{position: new Vec3(0,-70)})
                            .then(tween().call(()=>{
                                this.nodeOver.active=true
                            }))
                            .start()
                        this.getBestScore()
                        this.gameType=2
                    } else if(this.isGetScore==0){
                        log("滑倒")
                        let maxIndex=this.getMaxIndex()
                        this.nodeOver.setSiblingIndex(maxIndex+1)
                        this.nodeOver.active=true
                        this.getBestScore()
                        this.gameType=2
                    } else {
                        this.judgeCreatBlock()
                    }
                    this.hero.getComponent(hero).isMoving=false
                },0.2)
            })
            .start()
    }

    getBestScore(){
        let bestScr=JSON.parse(sys.localStorage.getItem('bestScore'));
        if(bestScr==null||bestScr<this.currentScore) {
            bestScr=this.currentScore
            sys.localStorage.setItem('bestScore',JSON.stringify(bestScr))
        } 
        this.bestScore.string="历史最高分："+bestScr.toString()
    }

    getMaxIndex() {
        let maxIndex=0;
        let children=this.node.children
        for(let i=0;i<children.length-1;i++){
            maxIndex=Math.max(maxIndex,children[i].getSiblingIndex())
        }
        return maxIndex
    }

    judgeCreatBlock(){
        let children=this.node.children
        for(let i=children.length-1;i>=0;i--){
            let Block=children[i].getComponent(block)
            if(Block){
                if(Block.collide){
                    this.judDis()
                }
                return
            }
        }
    }
        
    addItem(num){
        let Item=instantiate(this.pre_item)
        let itemUI=Item.getComponent(UITransform);
        let itemH=itemUI.height
        let itemPaUI=this.itemParent.getComponent(UITransform);
        itemPaUI.height=itemH*num
        for(let i=0;i<num;i++){
            let Item=instantiate(this.pre_item)
            Item.parent=this.itemParent
            let ctx=Item.getComponent(item)
            ctx.init(i+1,'name_'+i,100+i+1)
            let yPos=-48-i*itemH;
            Item.setPosition(0,yPos)
        }
    }
 
    //设置游戏结束排行榜
    setOverRankings(){
  
    }

    clickBtn(sender,str){
        if(str=="begin") {
            log("点击了开始按钮")
            this.gameType=1
            this.nodePlay.active=true
            this.nodeReady.active=false
            this.hero.active=true
            this.heroPoint.active=false
            this.hero.angle=0
            this.currentScore=0
            this.score.string="0"

            let block1=this.createBlock(new Vec3(-140,-140),0,true)
            let block2=this.createBlock(new Vec3(110,32),1,true)
            let blockIndex=Math.max(block1.getSiblingIndex(), block2.getSiblingIndex());
            this.hero.setSiblingIndex(blockIndex+1)
            this.addHeroAction(new Vec3(-140,-140))
        } else if (str=="rankings") {
            log("点击了排行榜按钮")
            this.nodeRankings.active=true
        } else if (str=="close") {
            log("点击了排行榜关闭按钮")
            this.nodeRankings.active=false
        } else if (str=="replay") {
            log("点击了再玩一次按钮")
            this.cleanAllBlock()
            this.nodeOver.active=false
            this.gameType=1
            this.heroPoint.active=false
            this.hero.angle=0
            this.currentScore=0
            this.score.string="0"

            let block1=this.createBlock(new Vec3(-140,-140),0,true)
            let block2=this.createBlock(new Vec3(110,32),1,true)
            let blockIndex=Math.max(block1.getSiblingIndex(), block2.getSiblingIndex());
            this.hero.setSiblingIndex(blockIndex+1)
            this.addHeroAction(new Vec3(-140,-140))
        } else if (str=="overRankings") {  //游戏结束查看排行榜
            log("点击了游戏结束查看排行榜按钮")
            let maxIndex=this.getMaxIndex()
            this.nodeRankings.setSiblingIndex(maxIndex+1)
            this.nodeRankings.active=true
        }
    }

    addHeroAction(pos){  //添加游戏开始时hero下落动作
        this.hero.getComponent(hero).isMoving=true
        this.hero.setPosition(pos.x,pos.y+200)
        tween(this.hero)
            .then(tween().to(0.2,{position: new Vec3(pos.x,pos.y-10)}))
            .then(tween().to(0.08,{position: new Vec3(pos.x,pos.y+50)}))
            .then(tween().to(0.07,{position: new Vec3(pos.x,pos.y-5)}))
            .then(tween().to(0.06,{position: new Vec3(pos.x,pos.y+10)}))
            .then(tween().to(0.03,{position: new Vec3(pos.x,pos.y)}))
            .start()

        this.hero.getComponent(hero).isMoving=false
    }

    cleanAllBlock(){
        let children=this.node.children
        for(let i=children.length-1;i>=0;i--){
            let Block=children[i].getComponent(block)
            if(Block){
                this.putBlockToPool(children[i])
            }
        }
    }




    update(deltaTime: number) {
        if(this.isTouchBegin){
            this.timeTouch++
            if(this.timeTouch>=400){
                this.timeTouch=400
            }
            let num=0
            let children=this.node.children
            for(let i=children.length-1;i>=0;i--){
                let Block=children[i].getComponent(block)
                if(Block){
                    num++;
                    if(num==2){
                        Block.touchBegin(deltaTime)
                    }
                }
            }
        }
    }

    onDestroy(){
        this.destroyTouch()
        this.blockPool.clear()
    }
}



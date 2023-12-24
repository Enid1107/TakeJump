import { _decorator, Component, Label, Node, Sprite, SpriteAtlas, SpriteFrame } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('item')
export class item extends Component {

    @property(Label)
    lab_num:Label

    @property(Label)
    lab_name:Label

    @property(Label)
    lab_score:Label

    @property(Sprite)
    sp_avatar:Sprite

    @property(SpriteFrame)
    spf_bg:SpriteFrame

    @property(SpriteAtlas)
    spa_avatar:SpriteAtlas

    start() {

    }

    onLoad(){

    }

    init(num,name,score){
        this.lab_num.string=num
        this.lab_name.string=name
        this.lab_score.string=score
        if(num%2) this.node.getComponent(Sprite).spriteFrame=this.spf_bg
        this.sp_avatar.spriteFrame=this.spa_avatar.getSpriteFrame('tou_'+(num-1))
    }

    update(deltaTime: number) {
        
    }
}



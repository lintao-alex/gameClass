/**
 * Created by lintao_alex on 2017/9/22.
 */
namespace game{
    export abstract class ActionNode implements IClear{
        readonly onStartCall:BackCallArgsList;
        readonly onEndCall:BackCallArgsList;
        readonly onSelfEndCall:BackCallArgsList;
        private _prev:ActionNode;
        private readonly _nextList:ActionNode[];
        private _nextEndCnt:number=0;
        private _phase:ActionPhaseEnum;
        public autoRecycle:boolean=false;

        //be override
        protected abstract onStart():void;

        protected abstract pauseSelf(value:boolean);

        public constructor(){
            this._nextList = [];
            this.onStartCall = new BackCallArgsList();
            this.onEndCall = new BackCallArgsList();
            this.onSelfEndCall = new BackCallArgsList();
            this._phase = ActionPhaseEnum.SLEEP;
        }

        public start(){
            if(this._phase==ActionPhaseEnum.PROCESS){
                throw new Error('[Battle]ActionNode start twice')
            }
            this._phase = ActionPhaseEnum.PROCESS;
            this.onStartCall.invoke();
            this.onStart();
        }

        public setPaused(value:boolean){
            if(this._phase==ActionPhaseEnum.PROCESS){
                this.pauseSelf(value);
            }else if(this._phase==ActionPhaseEnum.CHILD_PROCESS){
                for(var i = this._nextList.length - 1; i >= 0; i--){
                    this._nextList[i].setPaused(value);
                }
            }
        }

        public appendNode(node:ActionNode){
            this._nextList.push(node);
            node._prev = this;
        }

        //call by sub class
        protected selfEnd(){
            this.revertOnSelfEnd();
            this.onSelfEndCall.invoke();
            this._nextEndCnt = this._nextList.length;
            if(this._nextEndCnt>0){
                this._phase = ActionPhaseEnum.CHILD_PROCESS;
                for(let node of this._nextList){
                    this.startChild(node);
                }
            }else{
                this.selfTreeEnd();
            }
        }

        protected startChild(node:ActionNode){
            node.start();
        }

        private selfTreeEnd(){
            this._phase = ActionPhaseEnum.END;
            if(this._prev){
                this._prev.notifyByNext();
            }
            this.onEndCall.invoke();
            if(this.autoRecycle){
                ObjectPool.recycleObj(this);
            }
        }

        private notifyByNext(){
            if(--this._nextEndCnt==0){
                this.selfTreeEnd();
            }
        }

        //战斗因外力中断时的一些复原共享对象的操作
        protected revertOnBreak(){}
        //正常播完后的一些复原其享对象的操作
        protected revertOnSelfEnd(){}

        public clear(){
            if(this._phase == ActionPhaseEnum.PROCESS){
                this.revertOnBreak();
            }
            this.autoRecycle = false;
            this._phase = ActionPhaseEnum.SLEEP;
            this.onStartCall.clear();
            this.onEndCall.clear();
            this.onSelfEndCall.clear();
            this._nextEndCnt = 0;
            this._prev = null;
            for(var i = this._nextList.length - 1; i >= 0; i--){
                ObjectPool.recycleObj(this._nextList[i]);
            }
            this._nextList.length = 0;
        }

        public walkTree(doFuc:(ActionNode)=>void){
            doFuc(this);
            let list = this._nextList;
            for(var i = list.length - 1; i >= 0; i--){
                list[i].walkTree(doFuc);
            }
        }

        public get prevNode(){
            return this._prev;
        }

        public static concat(...nodes:ActionNode[]){
            for(var i=1,len=nodes.length; i<len; i++){
                let preNode = nodes[i-1]
                preNode.appendNode(nodes[i]);
            }
        }

    }

    export enum ActionPhaseEnum{
        SLEEP=0,
        PROCESS,
        CHILD_PROCESS,
        END
    }
}
/**
 * Created by lintao_alex on 2017/10/19.
 */
namespace game{
    export class ActionNodeContainer extends ActionNode{
        private readonly _nodeList:ActionNode[];
        private _endCnt:number;

        public constructor(){
            super();
            this._nodeList = [];
        }

        onStart(){
            let list = this._nodeList;
            this._endCnt = list.length;
            if(this._endCnt==0){
                this.selfEnd();
            }else{
                for(let node of list){
                    node.onEndCall.addCall(this.oneNodeEnd, this)
                    node.start();
                }
            }
        }

        private oneNodeEnd(){
            this._endCnt--;
            if(this._endCnt==0){
                this.selfEnd();
            }
        }

        pauseSelf(){
            let list = this._nodeList;
            for(var i = list.length - 1; i >= 0; i--){
                list[i].setPaused(true);
            }
        }

        public insertNode(node:ActionNode){
            this._nodeList.push(node);
        }

        clear(){
            let list = this._nodeList;
            for(var i = list.length - 1; i >= 0; i--){
                ObjectPool.recycleObj(list[i])
            }
            list.length = 0;
            super.clear();
        }

        public walkTree(doFuc:(ActionNode)=>void){
            let list = this._nodeList;
            for(var i = list.length - 1; i >= 0; i--){
                list[i].walkTree(doFuc);
            }
            super.walkTree(doFuc);
        }
    }
}
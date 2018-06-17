/**
 * Created by lintao_alex on 2017/11/14.
 */
namespace game{
    export class FreeNode extends BattleNode{
        protected onStart(){}
        public doEnd(){
            this.selfEnd();
        }
    }
}
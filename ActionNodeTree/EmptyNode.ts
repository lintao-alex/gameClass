/**
 * Created by lintao_alex on 2017/10/24.
 */
namespace game{
    export class EmptyNode extends BattleNode{
        onStart(){
            this.selfEnd();
        }
    }
}
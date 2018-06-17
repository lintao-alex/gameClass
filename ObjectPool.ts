namespace game{
    export class ObjectPool{
        private static _poolMap = new Map<Function, any>();

        public static getObj<T>(objClass:new() => T):T{
            return this.getPool(objClass).getObj()
        }

        public static recycleObj(obj:any){
            if(obj) this.getPool(obj.constructor).recycleObj(obj)
        }

        private static getPool<T>(objClass:new() => T):InnerObjectPool<T>{
            if(this._poolMap.has(objClass)){
                return this._poolMap.get(objClass)
            }
            else{
                let pool = new InnerObjectPool(objClass);
                this._poolMap.set(objClass, pool);
                return pool;
            }
        }
    }

    class InnerObjectPool<T>{
        private _objList:T[];
        private _objClass:any;

        public constructor(objClass:new()=>T){
            this._objClass = objClass;
            this._objList = [];
        }

        public getObj():T{
            let out = this._objList.pop();
            if(!out){
                out = new this._objClass();
            }
            return out;
        }

        public recycleObj(obj:T){
            if(this._objList.indexOf(obj)>=0) return;
            let clearFuc = obj['clear'] as Function;
            if(clearFuc!=null){
                clearFuc.call(obj);
            }
            this._objList.push(obj);
        }
    }

    export interface IClear
    {
        clear();
    }

}
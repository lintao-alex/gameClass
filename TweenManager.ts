/**
 * Created by lintao_alex on 2017/8/11.
 */


namespace game {
    import Tween = egret.Tween;
    import DisplayObject = egret.DisplayObject;
    import BlurFilter = egret.BlurFilter;
    import Filter = egret.Filter;
    import ColorMatrixFilter = egret.ColorMatrixFilter;

    export class TweenManager implements IClear{
        private readonly _tweenList:MyTween[];
        private readonly _filterMap:Map<DisplayObject, Array<Filter>>;

        private _isPaused:boolean;
        private _timeScale:number;

        public constructor() {
            this._tweenList = [];
            this._filterMap = new Map<DisplayObject, Array<Filter>>();
            this._timeScale = 1;
        }

        set timeScale(value:number){
            if(this._timeScale==value){
                return;
            }
            this._timeScale = value;
            for( var i = this._tweenList.length - 1; i >= 0; i-- ) {
                var tween = this._tweenList[ i ];
                tween.timeScale = value;
            }
        }
        get timeScale():number{
            return this._timeScale;
        }

        public get(target: any, props?: {
            loop?: boolean;
            onChange?: Function;
            onChangeObj?: any;
        }, pluginData?: any, override?: boolean):Tween{
            if(this._isPaused){
                if(!props){
                    props = {}
                }
                props['paused'] = true;
            }
            if(override){
                Tween.removeTweens(target);
            }
            let out = new MyTween(target, props, pluginData);
            this._tweenList.push(out);
            out.timeScale = this._timeScale;
            return out;
        }

        public blurTo(target:DisplayObject, blur:IBlurTween, duration:number, ease?:Function, remove:boolean=true, loop:boolean=false):Tween{
            let filter:BlurFilter = new BlurFilter(0, 0);
            return this.filterTo(target, filter, blur, duration, ease, loop, remove)
        }

        public colorTo(target:DisplayObject, matrix:number[], duration:number, ease?:Function, remove:boolean=true, loop:boolean=false):Tween{
            let changeMatrix = FilterUtils.orgMatrix.concat();
            let filter:ColorMatrixFilter = new ColorMatrixFilter(changeMatrix);
            let filterList = this.getAppendFilter(target, filter);
            target.filters = filterList;
            let filterMap = this._filterMap;
            let out = this.get(changeMatrix, {loop:loop, onChangeObj:target, onChange:()=>{
                if(filterMap.has(target)){
                    filter.matrix = changeMatrix;
                    target.filters = filterList;
                }
            }}).to(matrix, duration, ease);
            if(remove){
                out.call(this.revertFilters, this, [target]);
            }
            return out;
        }

        public filterTo(target:DisplayObject, filter:Filter, props:any, duration:number, ease?:Function, remove:boolean=true, loop:boolean=false):Tween{
            let filterList = this.getAppendFilter(target, filter);
            target.filters = filterList;
            let filterMap = this._filterMap;
            let out = this.get(filter, {loop:loop, onChangeObj:target, onChange:()=>{
                if(filterMap.has(target)){
                    target.filters = filterList;
                }
            }}).to(props, duration, ease);
            if(!loop && remove){
                out.call(this.revertFilters, this, [target]);
            }
            return out;
        }

        private getAppendFilter(target:DisplayObject, filter:Filter){
            let filterList = target.filters;
            if(!filterList){
                this._filterMap.set(target, null);
                filterList = [filter]
            }else{
                this._filterMap.set(target, filterList.concat());
                filterList.push(filter);
            }
            return filterList;
        }

        public revertFilters(target:DisplayObject){
            if(this._filterMap.has(target)){
                target.filters = this._filterMap.get(target);
                this._filterMap.delete(target);
            }else{
                target.filters = null;
            }
        }

        public setPaused(value:boolean){
            if(this._isPaused==value){
                return;
            }
            this._isPaused = value;
            for( var i = this._tweenList.length - 1; i >= 0; i-- ) {
                var tween = this._tweenList[ i ];
                tween.setPaused(value);
            }
        }

        public clear(){
            this.setPaused(true);
            this._tweenList.length = 0;
            this._isPaused=false;
            this._timeScale = 1;
            this._filterMap.forEach((filters,target)=>{
                target.filters = filters;
            })
            this._filterMap.clear();
        }
    }

    export interface IBlurTween{
        blurX?:number;
        blurY?:number;
    }

    export class MyTween extends Tween{
        public timeScale:number=1;
        public $tick(delta:number):void{
            super.$tick(delta * this.timeScale);
        }
    }

}
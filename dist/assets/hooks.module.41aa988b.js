/*! *****************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */var G=function(e,t){return G=Object.setPrototypeOf||{__proto__:[]}instanceof Array&&function(n,r){n.__proto__=r}||function(n,r){for(var i in r)r.hasOwnProperty(i)&&(n[i]=r[i])},G(e,t)};function Ae(e,t){G(e,t);function n(){this.constructor=e}e.prototype=t===null?Object.create(t):(n.prototype=t.prototype,new n)}var q=function(){return q=Object.assign||function(t){for(var n,r=1,i=arguments.length;r<i;r++){n=arguments[r];for(var _ in n)Object.prototype.hasOwnProperty.call(n,_)&&(t[_]=n[_])}return t},q.apply(this,arguments)};function Ue(e,t){var n={};for(var r in e)Object.prototype.hasOwnProperty.call(e,r)&&t.indexOf(r)<0&&(n[r]=e[r]);if(e!=null&&typeof Object.getOwnPropertySymbols=="function")for(var i=0,r=Object.getOwnPropertySymbols(e);i<r.length;i++)t.indexOf(r[i])<0&&Object.prototype.propertyIsEnumerable.call(e,r[i])&&(n[r[i]]=e[r[i]]);return n}function Ie(e,t,n,r){var i=arguments.length,_=i<3?t:r===null?r=Object.getOwnPropertyDescriptor(t,n):r,u;if(typeof Reflect=="object"&&typeof Reflect.decorate=="function")_=Reflect.decorate(e,t,n,r);else for(var c=e.length-1;c>=0;c--)(u=e[c])&&(_=(i<3?u(_):i>3?u(t,n,_):u(t,n))||_);return i>3&&_&&Object.defineProperty(t,n,_),_}function Ve(e,t){return function(n,r){t(n,r,e)}}function Me(e,t){if(typeof Reflect=="object"&&typeof Reflect.metadata=="function")return Reflect.metadata(e,t)}function Re(e,t,n,r){function i(_){return _ instanceof n?_:new n(function(u){u(_)})}return new(n||(n=Promise))(function(_,u){function c(o){try{l(r.next(o))}catch(d){u(d)}}function s(o){try{l(r.throw(o))}catch(d){u(d)}}function l(o){o.done?_(o.value):i(o.value).then(c,s)}l((r=r.apply(e,t||[])).next())})}function We(e,t){var n={label:0,sent:function(){if(_[0]&1)throw _[1];return _[1]},trys:[],ops:[]},r,i,_,u;return u={next:c(0),throw:c(1),return:c(2)},typeof Symbol=="function"&&(u[Symbol.iterator]=function(){return this}),u;function c(l){return function(o){return s([l,o])}}function s(l){if(r)throw new TypeError("Generator is already executing.");for(;n;)try{if(r=1,i&&(_=l[0]&2?i.return:l[0]?i.throw||((_=i.return)&&_.call(i),0):i.next)&&!(_=_.call(i,l[1])).done)return _;switch(i=0,_&&(l=[l[0]&2,_.value]),l[0]){case 0:case 1:_=l;break;case 4:return n.label++,{value:l[1],done:!1};case 5:n.label++,i=l[1],l=[0];continue;case 7:l=n.ops.pop(),n.trys.pop();continue;default:if(_=n.trys,!(_=_.length>0&&_[_.length-1])&&(l[0]===6||l[0]===2)){n=0;continue}if(l[0]===3&&(!_||l[1]>_[0]&&l[1]<_[3])){n.label=l[1];break}if(l[0]===6&&n.label<_[1]){n.label=_[1],_=l;break}if(_&&n.label<_[2]){n.label=_[2],n.ops.push(l);break}_[2]&&n.ops.pop(),n.trys.pop();continue}l=t.call(e,n)}catch(o){l=[6,o],i=0}finally{r=_=0}if(l[0]&5)throw l[1];return{value:l[0]?l[1]:void 0,done:!0}}}function Le(e,t,n,r){r===void 0&&(r=n),e[r]=t[n]}function Be(e,t){for(var n in e)n!=="default"&&!t.hasOwnProperty(n)&&(t[n]=e[n])}function z(e){var t=typeof Symbol=="function"&&Symbol.iterator,n=t&&e[t],r=0;if(n)return n.call(e);if(e&&typeof e.length=="number")return{next:function(){return e&&r>=e.length&&(e=void 0),{value:e&&e[r++],done:!e}}};throw new TypeError(t?"Object is not iterable.":"Symbol.iterator is not defined.")}function pe(e,t){var n=typeof Symbol=="function"&&e[Symbol.iterator];if(!n)return e;var r=n.call(e),i,_=[],u;try{for(;(t===void 0||t-- >0)&&!(i=r.next()).done;)_.push(i.value)}catch(c){u={error:c}}finally{try{i&&!i.done&&(n=r.return)&&n.call(r)}finally{if(u)throw u.error}}return _}function Ge(){for(var e=[],t=0;t<arguments.length;t++)e=e.concat(pe(arguments[t]));return e}function qe(){for(var e=0,t=0,n=arguments.length;t<n;t++)e+=arguments[t].length;for(var r=Array(e),i=0,t=0;t<n;t++)for(var _=arguments[t],u=0,c=_.length;u<c;u++,i++)r[i]=_[u];return r}function H(e){return this instanceof H?(this.v=e,this):new H(e)}function ze(e,t,n){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var r=n.apply(e,t||[]),i,_=[];return i={},u("next"),u("throw"),u("return"),i[Symbol.asyncIterator]=function(){return this},i;function u(a){r[a]&&(i[a]=function(f){return new Promise(function(h,k){_.push([a,f,h,k])>1||c(a,f)})})}function c(a,f){try{s(r[a](f))}catch(h){d(_[0][3],h)}}function s(a){a.value instanceof H?Promise.resolve(a.value.v).then(l,o):d(_[0][2],a)}function l(a){c("next",a)}function o(a){c("throw",a)}function d(a,f){a(f),_.shift(),_.length&&c(_[0][0],_[0][1])}}function Je(e){var t,n;return t={},r("next"),r("throw",function(i){throw i}),r("return"),t[Symbol.iterator]=function(){return this},t;function r(i,_){t[i]=e[i]?function(u){return(n=!n)?{value:H(e[i](u)),done:i==="return"}:_?_(u):u}:_}}function Ke(e){if(!Symbol.asyncIterator)throw new TypeError("Symbol.asyncIterator is not defined.");var t=e[Symbol.asyncIterator],n;return t?t.call(e):(e=typeof z=="function"?z(e):e[Symbol.iterator](),n={},r("next"),r("throw"),r("return"),n[Symbol.asyncIterator]=function(){return this},n);function r(_){n[_]=e[_]&&function(u){return new Promise(function(c,s){u=e[_](u),i(c,s,u.done,u.value)})}}function i(_,u,c,s){Promise.resolve(s).then(function(l){_({value:l,done:c})},u)}}function Qe(e,t){return Object.defineProperty?Object.defineProperty(e,"raw",{value:t}):e.raw=t,e}function Xe(e){if(e&&e.__esModule)return e;var t={};if(e!=null)for(var n in e)Object.hasOwnProperty.call(e,n)&&(t[n]=e[n]);return t.default=e,t}function Ye(e){return e&&e.__esModule?e:{default:e}}function Ze(e,t){if(!t.has(e))throw new TypeError("attempted to get private field on non-instance");return t.get(e)}function et(e,t,n){if(!t.has(e))throw new TypeError("attempted to set private field on non-instance");return t.set(e,n),n}var mt=Object.freeze(Object.defineProperty({__proto__:null,__extends:Ae,get __assign(){return q},__rest:Ue,__decorate:Ie,__param:Ve,__metadata:Me,__awaiter:Re,__generator:We,__createBinding:Le,__exportStar:Be,__values:z,__read:pe,__spread:Ge,__spreadArrays:qe,__await:H,__asyncGenerator:ze,__asyncDelegator:Je,__asyncValues:Ke,__makeTemplateObject:Qe,__importStar:Xe,__importDefault:Ye,__classPrivateFieldGet:Ze,__classPrivateFieldSet:et},Symbol.toStringTag,{value:"Module"})),j,p,he,de,x,ne,ye,J,ve,V={},me=[],tt=/acit|ex(?:s|g|n|p|$)|rph|grid|ows|mnc|ntw|ine[ch]|zoo|^ord|itera/i,W=Array.isArray;function w(e,t){for(var n in t)e[n]=t[n];return e}function be(e){var t=e.parentNode;t&&t.removeChild(e)}function K(e,t,n){var r,i,_,u={};for(_ in t)_=="key"?r=t[_]:_=="ref"?i=t[_]:u[_]=t[_];if(arguments.length>2&&(u.children=arguments.length>3?j.call(arguments,2):n),typeof e=="function"&&e.defaultProps!=null)for(_ in e.defaultProps)u[_]===void 0&&(u[_]=e.defaultProps[_]);return E(e,u,r,i,null)}function E(e,t,n,r,i){var _={type:e,props:t,key:n,ref:r,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,__h:null,constructor:void 0,__v:i??++he};return i==null&&p.vnode!=null&&p.vnode(_),_}function nt(){return{current:null}}function D(e){return e.children}function C(e,t){this.props=e,this.context=t}function T(e,t){if(t==null)return e.__?T(e.__,e.__.__k.indexOf(e)+1):null;for(var n;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null)return n.__e;return typeof e.type=="function"?T(e):null}function ge(e){var t,n;if((e=e.__)!=null&&e.__c!=null){for(e.__e=e.__c.base=null,t=0;t<e.__k.length;t++)if((n=e.__k[t])!=null&&n.__e!=null){e.__e=e.__c.base=n.__e;break}return ge(e)}}function Q(e){(!e.__d&&(e.__d=!0)&&x.push(e)&&!M.__r++||ne!==p.debounceRendering)&&((ne=p.debounceRendering)||ye)(M)}function M(){var e,t,n,r,i,_,u,c;for(x.sort(J);e=x.shift();)e.__d&&(t=x.length,r=void 0,i=void 0,u=(_=(n=e).__v).__e,(c=n.__P)&&(r=[],(i=w({},_)).__v=_.__v+1,Y(c,_,i,n.__n,c.ownerSVGElement!==void 0,_.__h!=null?[u]:null,r,u??T(_),_.__h),Oe(r,_),_.__e!=u&&ge(_)),x.length>t&&x.sort(J));M.__r=0}function we(e,t,n,r,i,_,u,c,s,l){var o,d,a,f,h,k,v,m=r&&r.__k||me,g=m.length;for(n.__k=[],o=0;o<t.length;o++)if((f=n.__k[o]=(f=t[o])==null||typeof f=="boolean"||typeof f=="function"?null:typeof f=="string"||typeof f=="number"||typeof f=="bigint"?E(null,f,null,null,f):W(f)?E(D,{children:f},null,null,null):f.__b>0?E(f.type,f.props,f.key,f.ref?f.ref:null,f.__v):f)!=null){if(f.__=n,f.__b=n.__b+1,(a=m[o])===null||a&&f.key==a.key&&f.type===a.type)m[o]=void 0;else for(d=0;d<g;d++){if((a=m[d])&&f.key==a.key&&f.type===a.type){m[d]=void 0;break}a=null}Y(e,f,a=a||V,i,_,u,c,s,l),h=f.__e,(d=f.ref)&&a.ref!=d&&(v||(v=[]),a.ref&&v.push(a.ref,null,f),v.push(d,f.__c||h,f)),h!=null?(k==null&&(k=h),typeof f.type=="function"&&f.__k===a.__k?f.__d=s=Se(f,s,e):s=xe(e,f,a,m,h,s),typeof n.type=="function"&&(n.__d=s)):s&&a.__e==s&&s.parentNode!=e&&(s=T(a))}for(n.__e=k,o=g;o--;)m[o]!=null&&(typeof n.type=="function"&&m[o].__e!=null&&m[o].__e==n.__d&&(n.__d=Pe(r).nextSibling),Ee(m[o],m[o]));if(v)for(o=0;o<v.length;o++)$e(v[o],v[++o],v[++o])}function Se(e,t,n){for(var r,i=e.__k,_=0;i&&_<i.length;_++)(r=i[_])&&(r.__=e,t=typeof r.type=="function"?Se(r,t,n):xe(n,r,r,i,r.__e,t));return t}function ke(e,t){return t=t||[],e==null||typeof e=="boolean"||(W(e)?e.some(function(n){ke(n,t)}):t.push(e)),t}function xe(e,t,n,r,i,_){var u,c,s;if(t.__d!==void 0)u=t.__d,t.__d=void 0;else if(n==null||i!=_||i.parentNode==null)e:if(_==null||_.parentNode!==e)e.appendChild(i),u=null;else{for(c=_,s=0;(c=c.nextSibling)&&s<r.length;s+=1)if(c==i)break e;e.insertBefore(i,_),u=_}return u!==void 0?u:i.nextSibling}function Pe(e){var t,n,r;if(e.type==null||typeof e.type=="string")return e.__e;if(e.__k){for(t=e.__k.length-1;t>=0;t--)if((n=e.__k[t])&&(r=Pe(n)))return r}return null}function _t(e,t,n,r,i){var _;for(_ in n)_==="children"||_==="key"||_ in t||R(e,_,null,n[_],r);for(_ in t)i&&typeof t[_]!="function"||_==="children"||_==="key"||_==="value"||_==="checked"||n[_]===t[_]||R(e,_,t[_],n[_],r)}function _e(e,t,n){t[0]==="-"?e.setProperty(t,n??""):e[t]=n==null?"":typeof n!="number"||tt.test(t)?n:n+"px"}function R(e,t,n,r,i){var _;e:if(t==="style")if(typeof n=="string")e.style.cssText=n;else{if(typeof r=="string"&&(e.style.cssText=r=""),r)for(t in r)n&&t in n||_e(e.style,t,"");if(n)for(t in n)r&&n[t]===r[t]||_e(e.style,t,n[t])}else if(t[0]==="o"&&t[1]==="n")_=t!==(t=t.replace(/Capture$/,"")),t=t.toLowerCase()in e?t.toLowerCase().slice(2):t.slice(2),e.l||(e.l={}),e.l[t+_]=n,n?r||e.addEventListener(t,_?oe:re,_):e.removeEventListener(t,_?oe:re,_);else if(t!=="dangerouslySetInnerHTML"){if(i)t=t.replace(/xlink(H|:h)/,"h").replace(/sName$/,"s");else if(t!=="width"&&t!=="height"&&t!=="href"&&t!=="list"&&t!=="form"&&t!=="tabIndex"&&t!=="download"&&t!=="rowSpan"&&t!=="colSpan"&&t in e)try{e[t]=n??"";break e}catch{}typeof n=="function"||(n==null||n===!1&&t[4]!=="-"?e.removeAttribute(t):e.setAttribute(t,n))}}function re(e){return this.l[e.type+!1](p.event?p.event(e):e)}function oe(e){return this.l[e.type+!0](p.event?p.event(e):e)}function Y(e,t,n,r,i,_,u,c,s){var l,o,d,a,f,h,k,v,m,g,N,$,te,F,L,b=t.type;if(t.constructor!==void 0)return null;n.__h!=null&&(s=n.__h,c=t.__e=n.__e,t.__h=null,_=[c]),(l=p.__b)&&l(t);try{e:if(typeof b=="function"){if(v=t.props,m=(l=b.contextType)&&r[l.__c],g=l?m?m.props.value:l.__:r,n.__c?k=(o=t.__c=n.__c).__=o.__E:("prototype"in b&&b.prototype.render?t.__c=o=new b(v,g):(t.__c=o=new C(v,g),o.constructor=b,o.render=ot),m&&m.sub(o),o.props=v,o.state||(o.state={}),o.context=g,o.__n=r,d=o.__d=!0,o.__h=[],o._sb=[]),o.__s==null&&(o.__s=o.state),b.getDerivedStateFromProps!=null&&(o.__s==o.state&&(o.__s=w({},o.__s)),w(o.__s,b.getDerivedStateFromProps(v,o.__s))),a=o.props,f=o.state,o.__v=t,d)b.getDerivedStateFromProps==null&&o.componentWillMount!=null&&o.componentWillMount(),o.componentDidMount!=null&&o.__h.push(o.componentDidMount);else{if(b.getDerivedStateFromProps==null&&v!==a&&o.componentWillReceiveProps!=null&&o.componentWillReceiveProps(v,g),!o.__e&&o.shouldComponentUpdate!=null&&o.shouldComponentUpdate(v,o.__s,g)===!1||t.__v===n.__v){for(t.__v!==n.__v&&(o.props=v,o.state=o.__s,o.__d=!1),o.__e=!1,t.__e=n.__e,t.__k=n.__k,t.__k.forEach(function(A){A&&(A.__=t)}),N=0;N<o._sb.length;N++)o.__h.push(o._sb[N]);o._sb=[],o.__h.length&&u.push(o);break e}o.componentWillUpdate!=null&&o.componentWillUpdate(v,o.__s,g),o.componentDidUpdate!=null&&o.__h.push(function(){o.componentDidUpdate(a,f,h)})}if(o.context=g,o.props=v,o.__P=e,$=p.__r,te=0,"prototype"in b&&b.prototype.render){for(o.state=o.__s,o.__d=!1,$&&$(t),l=o.render(o.props,o.state,o.context),F=0;F<o._sb.length;F++)o.__h.push(o._sb[F]);o._sb=[]}else do o.__d=!1,$&&$(t),l=o.render(o.props,o.state,o.context),o.state=o.__s;while(o.__d&&++te<25);o.state=o.__s,o.getChildContext!=null&&(r=w(w({},r),o.getChildContext())),d||o.getSnapshotBeforeUpdate==null||(h=o.getSnapshotBeforeUpdate(a,f)),we(e,W(L=l!=null&&l.type===D&&l.key==null?l.props.children:l)?L:[L],t,n,r,i,_,u,c,s),o.base=t.__e,t.__h=null,o.__h.length&&u.push(o),k&&(o.__E=o.__=null),o.__e=!1}else _==null&&t.__v===n.__v?(t.__k=n.__k,t.__e=n.__e):t.__e=rt(n.__e,t,n,r,i,_,u,s);(l=p.diffed)&&l(t)}catch(A){t.__v=null,(s||_!=null)&&(t.__e=c,t.__h=!!s,_[_.indexOf(c)]=null),p.__e(A,t,n)}}function Oe(e,t){p.__c&&p.__c(t,e),e.some(function(n){try{e=n.__h,n.__h=[],e.some(function(r){r.call(n)})}catch(r){p.__e(r,n.__v)}})}function rt(e,t,n,r,i,_,u,c){var s,l,o,d=n.props,a=t.props,f=t.type,h=0;if(f==="svg"&&(i=!0),_!=null){for(;h<_.length;h++)if((s=_[h])&&"setAttribute"in s==!!f&&(f?s.localName===f:s.nodeType===3)){e=s,_[h]=null;break}}if(e==null){if(f===null)return document.createTextNode(a);e=i?document.createElementNS("http://www.w3.org/2000/svg",f):document.createElement(f,a.is&&a),_=null,c=!1}if(f===null)d===a||c&&e.data===a||(e.data=a);else{if(_=_&&j.call(e.childNodes),l=(d=n.props||V).dangerouslySetInnerHTML,o=a.dangerouslySetInnerHTML,!c){if(_!=null)for(d={},h=0;h<e.attributes.length;h++)d[e.attributes[h].name]=e.attributes[h].value;(o||l)&&(o&&(l&&o.__html==l.__html||o.__html===e.innerHTML)||(e.innerHTML=o&&o.__html||""))}if(_t(e,a,d,i,c),o)t.__k=[];else if(we(e,W(h=t.props.children)?h:[h],t,n,r,i&&f!=="foreignObject",_,u,_?_[0]:n.__k&&T(n,0),c),_!=null)for(h=_.length;h--;)_[h]!=null&&be(_[h]);c||("value"in a&&(h=a.value)!==void 0&&(h!==e.value||f==="progress"&&!h||f==="option"&&h!==d.value)&&R(e,"value",h,d.value,!1),"checked"in a&&(h=a.checked)!==void 0&&h!==e.checked&&R(e,"checked",h,d.checked,!1))}return e}function $e(e,t,n){try{typeof e=="function"?e(t):e.current=t}catch(r){p.__e(r,n)}}function Ee(e,t,n){var r,i;if(p.unmount&&p.unmount(e),(r=e.ref)&&(r.current&&r.current!==e.__e||$e(r,null,t)),(r=e.__c)!=null){if(r.componentWillUnmount)try{r.componentWillUnmount()}catch(_){p.__e(_,t)}r.base=r.__P=null,e.__c=void 0}if(r=e.__k)for(i=0;i<r.length;i++)r[i]&&Ee(r[i],t,n||typeof e.type!="function");n||e.__e==null||be(e.__e),e.__=e.__e=e.__d=void 0}function ot(e,t,n){return this.constructor(e,n)}function Ce(e,t,n){var r,i,_;p.__&&p.__(e,t),i=(r=typeof n=="function")?null:n&&n.__k||t.__k,_=[],Y(t,e=(!r&&n||t).__k=K(D,null,[e]),i||V,V,t.ownerSVGElement!==void 0,!r&&n?[n]:i?null:t.firstChild?j.call(t.childNodes):null,_,!r&&n?n:i?i.__e:t.firstChild,r),Oe(_,e)}function He(e,t){Ce(e,t,He)}function it(e,t,n){var r,i,_,u,c=w({},e.props);for(_ in e.type&&e.type.defaultProps&&(u=e.type.defaultProps),t)_=="key"?r=t[_]:_=="ref"?i=t[_]:c[_]=t[_]===void 0&&u!==void 0?u[_]:t[_];return arguments.length>2&&(c.children=arguments.length>3?j.call(arguments,2):n),E(e.type,c,r||e.key,i||e.ref,null)}function ut(e,t){var n={__c:t="__cC"+ve++,__:e,Consumer:function(r,i){return r.children(i)},Provider:function(r){var i,_;return this.getChildContext||(i=[],(_={})[t]=this,this.getChildContext=function(){return _},this.shouldComponentUpdate=function(u){this.props.value!==u.value&&i.some(function(c){c.__e=!0,Q(c)})},this.sub=function(u){i.push(u);var c=u.componentWillUnmount;u.componentWillUnmount=function(){i.splice(i.indexOf(u),1),c&&c.call(u)}}),r.children}};return n.Provider.__=n.Consumer.contextType=n}j=me.slice,p={__e:function(e,t,n,r){for(var i,_,u;t=t.__;)if((i=t.__c)&&!i.__)try{if((_=i.constructor)&&_.getDerivedStateFromError!=null&&(i.setState(_.getDerivedStateFromError(e)),u=i.__d),i.componentDidCatch!=null&&(i.componentDidCatch(e,r||{}),u=i.__d),u)return i.__E=i}catch(c){e=c}throw e}},he=0,de=function(e){return e!=null&&e.constructor===void 0},C.prototype.setState=function(e,t){var n;n=this.__s!=null&&this.__s!==this.state?this.__s:this.__s=w({},this.state),typeof e=="function"&&(e=e(w({},n),this.props)),e&&w(n,e),e!=null&&this.__v&&(t&&this._sb.push(t),Q(this))},C.prototype.forceUpdate=function(e){this.__v&&(this.__e=!0,e&&this.__h.push(e),Q(this))},C.prototype.render=D,x=[],ye=typeof Promise=="function"?Promise.prototype.then.bind(Promise.resolve()):setTimeout,J=function(e,t){return e.__v.__b-t.__v.__b},M.__r=0,ve=0;var bt=Object.freeze(Object.defineProperty({__proto__:null,Component:C,Fragment:D,cloneElement:it,createContext:ut,createElement:K,createRef:nt,h:K,hydrate:He,get isValidElement(){return de},get options(){return p},render:Ce,toChildArray:ke},Symbol.toStringTag,{value:"Module"})),S,y,B,ie,O=0,Te=[],U=[],ue=p.__b,le=p.__r,ce=p.diffed,ae=p.__c,fe=p.unmount;function P(e,t){p.__h&&p.__h(y,e,O||t),O=0;var n=y.__H||(y.__H={__:[],__h:[]});return e>=n.__.length&&n.__.push({__V:U}),n.__[e]}function je(e){return O=1,De(Fe,e)}function De(e,t,n){var r=P(S++,2);if(r.t=e,!r.__c&&(r.__=[n?n(t):Fe(void 0,t),function(c){var s=r.__N?r.__N[0]:r.__[0],l=r.t(s,c);s!==l&&(r.__N=[l,r.__[1]],r.__c.setState({}))}],r.__c=y,!y.u)){var i=function(c,s,l){if(!r.__c.__H)return!0;var o=r.__c.__H.__.filter(function(a){return a.__c});if(o.every(function(a){return!a.__N}))return!_||_.call(this,c,s,l);var d=!1;return o.forEach(function(a){if(a.__N){var f=a.__[0];a.__=a.__N,a.__N=void 0,f!==a.__[0]&&(d=!0)}}),!(!d&&r.__c.props===c)&&(!_||_.call(this,c,s,l))};y.u=!0;var _=y.shouldComponentUpdate,u=y.componentWillUpdate;y.componentWillUpdate=function(c,s,l){if(this.__e){var o=_;_=void 0,i(c,s,l),_=o}u&&u.call(this,c,s,l)},y.shouldComponentUpdate=i}return r.__N||r.__}function lt(e,t){var n=P(S++,3);!p.__s&&ee(n.__H,t)&&(n.__=e,n.i=t,y.__H.__h.push(n))}function Ne(e,t){var n=P(S++,4);!p.__s&&ee(n.__H,t)&&(n.__=e,n.i=t,y.__h.push(n))}function ct(e){return O=5,Z(function(){return{current:e}},[])}function at(e,t,n){O=6,Ne(function(){return typeof e=="function"?(e(t()),function(){return e(null)}):e?(e.current=t(),function(){return e.current=null}):void 0},n==null?n:n.concat(e))}function Z(e,t){var n=P(S++,7);return ee(n.__H,t)?(n.__V=e(),n.i=t,n.__h=e,n.__V):n.__}function ft(e,t){return O=8,Z(function(){return e},t)}function st(e){var t=y.context[e.__c],n=P(S++,9);return n.c=e,t?(n.__==null&&(n.__=!0,t.sub(y)),t.props.value):e.__}function pt(e,t){p.useDebugValue&&p.useDebugValue(t?t(e):e)}function ht(e){var t=P(S++,10),n=je();return t.__=e,y.componentDidCatch||(y.componentDidCatch=function(r,i){t.__&&t.__(r,i),n[1](r)}),[n[0],function(){n[1](void 0)}]}function dt(){var e=P(S++,11);if(!e.__){for(var t=y.__v;t!==null&&!t.__m&&t.__!==null;)t=t.__;var n=t.__m||(t.__m=[0,0]);e.__="P"+n[0]+"-"+n[1]++}return e.__}function yt(){for(var e;e=Te.shift();)if(e.__P&&e.__H)try{e.__H.__h.forEach(I),e.__H.__h.forEach(X),e.__H.__h=[]}catch(t){e.__H.__h=[],p.__e(t,e.__v)}}p.__b=function(e){y=null,ue&&ue(e)},p.__r=function(e){le&&le(e),S=0;var t=(y=e.__c).__H;t&&(B===y?(t.__h=[],y.__h=[],t.__.forEach(function(n){n.__N&&(n.__=n.__N),n.__V=U,n.__N=n.i=void 0})):(t.__h.forEach(I),t.__h.forEach(X),t.__h=[],S=0)),B=y},p.diffed=function(e){ce&&ce(e);var t=e.__c;t&&t.__H&&(t.__H.__h.length&&(Te.push(t)!==1&&ie===p.requestAnimationFrame||((ie=p.requestAnimationFrame)||vt)(yt)),t.__H.__.forEach(function(n){n.i&&(n.__H=n.i),n.__V!==U&&(n.__=n.__V),n.i=void 0,n.__V=U})),B=y=null},p.__c=function(e,t){t.some(function(n){try{n.__h.forEach(I),n.__h=n.__h.filter(function(r){return!r.__||X(r)})}catch(r){t.some(function(i){i.__h&&(i.__h=[])}),t=[],p.__e(r,n.__v)}}),ae&&ae(e,t)},p.unmount=function(e){fe&&fe(e);var t,n=e.__c;n&&n.__H&&(n.__H.__.forEach(function(r){try{I(r)}catch(i){t=i}}),n.__H=void 0,t&&p.__e(t,n.__v))};var se=typeof requestAnimationFrame=="function";function vt(e){var t,n=function(){clearTimeout(r),se&&cancelAnimationFrame(t),setTimeout(e)},r=setTimeout(n,100);se&&(t=requestAnimationFrame(n))}function I(e){var t=y,n=e.__c;typeof n=="function"&&(e.__c=void 0,n()),y=t}function X(e){var t=y;e.__c=e.__(),y=t}function ee(e,t){return!e||e.length!==t.length||t.some(function(n,r){return n!==e[r]})}function Fe(e,t){return typeof t=="function"?t(e):t}var gt=Object.freeze(Object.defineProperty({__proto__:null,useCallback:ft,useContext:st,useDebugValue:pt,useEffect:lt,useErrorBoundary:ht,useId:dt,useImperativeHandle:at,useLayoutEffect:Ne,useMemo:Z,useReducer:De,useRef:ct,useState:je},Symbol.toStringTag,{value:"Module"}));export{at as A,Ce as D,He as E,it as F,ut as G,ht as P,ke as S,ft as T,dt as V,ct as _,Ne as a,C as b,Z as c,nt as d,bt as e,Ae as f,gt as g,je as h,D as k,p as l,lt as p,st as q,De as s,mt as t,pt as x,K as y};
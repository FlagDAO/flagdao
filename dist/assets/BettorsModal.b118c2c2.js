import{r as l,K as d,f as t,j as e,M as v,h as g,i as f}from"./index.815b74d5.js";const E=({bettors_plg:p,flag_id:o})=>{const[h,n]=l.exports.useState(!1),[c,m]=l.exports.useState();function u(){n(!0)}function i(){n(!1)}const{data:s,isError:w,isLoading:k,refetch:A,isFetching:B,error:M}=d({address:g,abi:f,functionName:"getBettors",args:[o]}),{data:a,isError:C,isLoading:j,refetch:O,isFetching:L,error:S}=d({address:g,abi:f,functionName:"getBettorsPledgement",args:[o]}),x=(r,b)=>r.map((y,N)=>({addr:y,val:b[N]}));return l.exports.useEffect(()=>{Array.isArray(s)&&Array.isArray(a)&&s&&a&&m(x(s,a))},[s,a]),console.log("getBettors bettors",c),t("div",{className:"relative inline-block",children:[e("button",{onClick:u,onMouseMove:i,className:"text-sm pt-1 pr-1 ml-4 underline",children:"Bettors: "})," ",t("span",{className:"text-lg font-bold text-lime-700",children:["$",p.toString()]}),e(v,{isOpen:h,className:"flex items-center justify-center w-full h-full",overlayClassName:"fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center",children:t("div",{className:"bg-slate-50 rounded-lg shadow-lg w-2/5 py-10 px-10 relative",children:[e("h4",{className:"text-2xl mb-4 text-center font-black",children:"Bettors: "}),e("button",{onClick:i,className:"absolute top-2 left-2 bg-gradient-to-r from-red-200 via-red-300 to-yellow-200 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-red-100 dark:focus:ring-red-400 rounded-lg text-white font-bold py-1 px-2",children:"X"}),e("div",{className:"relative overflow-x-auto",children:t("table",{className:"w-full text-sm text-left text-gray-500 dark:text-gray-400",children:[e("thead",{className:"text-xs text-gray-900 uppercase dark:text-gray-400",children:t("tr",{children:[e("th",{scope:"col",className:"px-6 py-3",children:"Address"}),e("th",{scope:"col",className:"px-6 py-3",children:"Bettor's Pledgement"})]})}),e("tbody",{children:c?.map(r=>t("tr",{className:"bg-white dark:bg-gray-800",children:[t("th",{scope:"row",className:"px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white",children:[r.addr.slice(0,5),"......",r.addr.slice(-5)]}),t("td",{className:"px-6 py-4",children:["$",r.val.toString()]})]}))})]})})]})})]})};export{E as default};
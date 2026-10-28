"use strict";

// Campus Care V2: fully local demo. No network, backend, persistent storage or real repair request.
const equipmentCatalog = [
  {id:"water",name:"飲水機",icon:'<rect x="9" y="4" width="22" height="32" rx="4"/><path d="M13 16h14M16 10h8M17 23h6M20 23v4M20 30v3"/>',issues:["無法出水","水溫異常","漏水／積水","其他問題"],tips:["確認操作面板是否顯示缺水、保養或暫停使用。","如只有單一出水口異常，可觀察其他出水選項是否正常；請勿拆開面板。"],caution:"若有漏水或地面濕滑，先遠離積水，並通知管理人員。",hint:"例如：二樓飲水機的冷水按鍵沒有反應，面板仍有亮燈。"},
  {id:"air",name:"空調",icon:'<rect x="4" y="9" width="32" height="19" rx="4"/><path d="M9 20h22M11 15h6M10 32c-2 2-2 3 0 4M20 32c-2 2-2 3 0 4M30 32c-2 2-2 3 0 4"/>',issues:["無法啟動","冷房不足","漏水／異音","其他問題"],tips:["查看遙控器是否有電，並確認已選擇冷氣模式及合理溫度。","確認門窗是否關妥；若仍異常，記錄錯誤代碼或異音。"],caution:"請勿自行拆機、清洗電路或接觸漏水處的電器。",hint:"例如：開機後約10分鐘仍不冷，螢幕顯示E1。"},
  {id:"projector",name:"投影機",icon:'<rect x="4" y="11" width="32" height="21" rx="4"/><circle cx="25" cy="21" r="6"/><circle cx="25" cy="21" r="2"/><path d="M10 18h5M10 24h5M10 32v4M30 32v4"/>',issues:["無法開機","無訊號","畫面異常","其他問題"],tips:["確認投影機與電腦已開啟，並檢查訊號來源（Source/Input）是否選對。","確認可見的訊號線有妥善連接；如出現高溫警示，先停止使用。"],caution:"請勿拆開投影機，也不要觸碰高溫燈泡與散熱孔。",hint:"例如：使用HDMI連接筆電後顯示無訊號。"},
  {id:"wifi",name:"網路／Wi-Fi",icon:'<path d="M4 15a25 25 0 0 1 32 0M10 22a16 16 0 0 1 20 0M16 29a7 7 0 0 1 8 0"/><circle cx="20" cy="35" r="2" fill="currentColor" stroke="none"/>',issues:["無法連線","速度過慢","經常斷線","其他問題"],tips:["確認裝置已開啟Wi-Fi，並選對校園網路名稱。","試著在另一個位置或另一台裝置確認是否也無法連線。"],caution:"請勿重設、拔插或修改公共網路設備。",hint:"例如：三樓教室內多台裝置無法連上校園Wi-Fi。"},
  {id:"light",name:"照明",icon:'<path d="M12 27c-3-3-5-6-5-10a13 13 0 0 1 26 0c0 4-2 7-5 10M13 28h14M14 33h12M17 37h6M20 3v-2"/><path d="M13 27v-4M27 27v-4"/>',issues:["燈具不亮","持續閃爍","開關異常","其他問題"],tips:["確認牆面一般開關是否已開啟。","觀察是單盞燈或整個區域都異常，並記錄位置。"],caution:"請勿爬高、拆燈具、觸碰裸露電線或自行維修電路。",hint:"例如：靠窗第二排燈具會持續閃爍。"},
  {id:"furniture",name:"桌椅",icon:'<path d="M5 14h30v7H5zM9 21v15M31 21v15M12 9h16v5"/>',issues:["鬆動／搖晃","破損／裂痕","無法調整","其他問題"],tips:["確認桌椅是否有明顯鬆動、裂痕或銳利邊緣。","先避免繼續使用，並描述是哪一張桌椅或座位。"],caution:"如結構不穩或有尖銳破損，請停止使用，避免受傷。",hint:"例如：教室後排第3張椅子的椅腳明顯鬆動。"},
  {id:"restroom",name:"廁所",icon:'<path d="M9 5h22v12H9zM12 17v6a8 8 0 0 0 16 0v-6M10 32h20M12 9h16"/>',issues:["堵塞不通","漏水／積水","設備損壞","其他問題"],tips:["確認是單一設備或整個區域異常，並記錄廁所位置。","若馬桶堵塞，請先停止沖水，避免溢流。"],caution:"請勿自行混用化學疏通劑；遇到大量漏水或滑倒風險請先通知管理人員。",hint:"例如：一樓男廁第二間洗手台持續漏水。"},
  {id:"door",name:"門窗",icon:'<rect x="9" y="4" width="22" height="32" rx="2"/><path d="M20 4v32M14 18h2M25 18h2"/>',issues:["無法開關","門鎖異常","玻璃破損","其他問題"],tips:["觀察門窗附近是否有異物阻擋，輕微排除可見障礙。","確認是把手、門鎖、窗軌或玻璃哪個部位異常。"],caution:"門窗卡住時不要用力推拉；玻璃破損時請遠離碎片。",hint:"例如：三樓走廊東側窗戶無法正常關閉。"}
];

const $ = id => document.getElementById(id);
const form = $("reportForm");
const equipGrid = $("equipmentGrid");
const problemGrid = $("problemGrid");
const progressTrack = $("progressTrack");
const errors = {equipment:$("equipmentError"),building:$("buildingError"),floor:$("floorError"),problem:$("problemError")};
let chosenEquipment = null;
let chosenProblem = "";
let chosenUrgency = "一般";
let photos = [];
let photoSerial = 0;
let reportText = "";
const maxPhotos = 3;
const maxBytes = 5 * 1024 * 1024;

function showError(key,message){
  const el = errors[key];
  el.textContent = message;
  el.hidden = !message;
  if(key==="building"||key==="floor") $(key).setAttribute("aria-invalid",String(Boolean(message)));
}
function clearErrors(){Object.keys(errors).forEach(key=>showError(key,""));}
function updateProgress(){
  const complete = Number(Boolean(chosenEquipment))+Number(Boolean(chosenProblem))+Number(Boolean($("building").value))+Number(Boolean($("floor").value));
  $("progressCount").textContent = `${complete} / 4`;
  progressTrack.setAttribute("aria-valuenow",String(complete*25));
  $("progressFill").style.width = `${complete*25}%`;
}
function makeEquipmentCards(){
  equipGrid.replaceChildren();
  equipmentCatalog.forEach(item=>{
    const button=document.createElement("button");
    button.type="button";
    button.className="equipment-card";
    button.dataset.equipment=item.id;
    button.setAttribute("aria-pressed","false");
    button.innerHTML=`<span class="card-check" aria-hidden="true">✓</span><svg viewBox="0 0 40 40" aria-hidden="true">${item.icon}</svg><span class="item-name">${item.name}</span>`;
    button.addEventListener("click",()=>chooseEquipment(item.id));
    equipGrid.append(button);
  });
}
function chooseEquipment(id){
  const item=equipmentCatalog.find(x=>x.id===id);
  if(!item)return;
  if(chosenEquipment?.id!==id){chosenProblem="";renderProblems(item);}
  chosenEquipment=item;
  equipGrid.querySelectorAll(".equipment-card").forEach(btn=>btn.setAttribute("aria-pressed",String(btn.dataset.equipment===id)));
  $("description").placeholder=item.hint;
  $("guideShell").hidden=false;
  $("guideList").replaceChildren(...item.tips.map(text=>{const li=document.createElement("li");li.textContent=text;return li;}));
  $("guideCaution").textContent=item.caution;
  $("guideToggle").setAttribute("aria-expanded","false");
  $("guideContent").hidden=true;
  showError("equipment","");showError("problem","");updateProgress();
}
function renderProblems(item){
  problemGrid.replaceChildren();
  item.issues.forEach(issue=>{
    const button=document.createElement("button");button.type="button";button.className="problem-choice";button.setAttribute("aria-pressed","false");
    const dot=document.createElement("span");dot.className="radio-dot";dot.setAttribute("aria-hidden","true");
    const text=document.createElement("span");text.textContent=issue;
    button.append(dot,text);
    button.addEventListener("click",()=>{chosenProblem=issue;problemGrid.querySelectorAll(".problem-choice").forEach(x=>x.setAttribute("aria-pressed",String(x===button)));showError("problem","");updateProgress();});
    problemGrid.append(button);
  });
}
function setUrgency(value){
  chosenUrgency=value;
  document.querySelectorAll("[data-urgency]").forEach(btn=>{
    const selected=btn.dataset.urgency===value;
    btn.setAttribute("aria-pressed",String(selected));btn.classList.toggle("selected",selected);
  });
  $("safetyWarning").hidden=value!=="有安全疑慮";
}
function describePhotoChange(message){$("photoStatus").textContent=message;}
function addPhotos(files){
  const incoming=Array.from(files);
  if(!incoming.length)return;
  let ignored=[];let added=0;
  incoming.forEach(file=>{
    if(photos.length>=maxPhotos){ignored.push("最多只能選3張照片");return;}
    if(!file.type.startsWith("image/")){ignored.push("僅接受圖片檔案");return;}
    if(file.size>maxBytes){ignored.push("照片單張不能超過5MB");return;}
    const url=URL.createObjectURL(file);
    photos.push({id:++photoSerial,file,url});added++;
  });
  renderPhotoPreviews();
  const errors=Array.from(new Set(ignored));
  describePhotoChange([added?`已加入${added}張照片。`:"",...errors].filter(Boolean).join(" "));
  $("photos").value="";
}
function renderPhotoPreviews(){
  const container=$("photoPreview");container.replaceChildren();container.hidden=photos.length===0;
  photos.forEach(photo=>{
    const item=document.createElement("div");item.className="photo-thumb";
    const img=document.createElement("img");img.src=photo.url;img.alt=`照片預覽：${photo.file.name}`;
    const remove=document.createElement("button");remove.type="button";remove.className="photo-remove";remove.textContent="×";remove.setAttribute("aria-label",`移除照片${photo.file.name}`);
    remove.addEventListener("click",()=>{URL.revokeObjectURL(photo.url);photos=photos.filter(x=>x.id!==photo.id);renderPhotoPreviews();describePhotoChange(`剩餘${photos.length}張照片。`);});
    item.append(img,remove);container.append(item);
  });
}
function jumpTo(el){el.scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",block:"start"});}
function checkForm(){
  clearErrors();
  if(!chosenEquipment){showError("equipment","請選擇要報修的設備。");jumpTo($("equipmentSection"));equipGrid.querySelector("button")?.focus({preventScroll:true});return false;}
  if(!$("building").value){showError("building","請選擇建築或區域。");jumpTo($("locationSection"));$("building").focus({preventScroll:true});return false;}
  if(!$("floor").value){showError("floor","請選擇樓層。");jumpTo($("locationSection"));$("floor").focus({preventScroll:true});return false;}
  if(!chosenProblem){showError("problem","請選擇故障類型。");jumpTo($("problemSection"));problemGrid.querySelector("button")?.focus({preventScroll:true});return false;}
  return true;
}
function fillReceipt(){
  const rows=[
    ["設備",chosenEquipment.name],
    ["建築／區域",$("building").value],
    ["樓層",$("floor").value],
    ["詳細位置",$("landmark").value.trim()||"未填寫"],
    ["故障類型",chosenProblem],
    ["影響程度",chosenUrgency],
    ["補充說明",$("description").value.trim()||"未填寫"],
    ["照片",`${photos.length}張（僅本機預覽，未上傳）`]
  ];
  const dl=$("receiptDetails");dl.replaceChildren();
  rows.forEach(([label,value])=>{
    const row=document.createElement("div");if(label==="補充說明"||label==="詳細位置")row.classList.add("detail-long");
    const dt=document.createElement("dt");dt.textContent=label;
    const dd=document.createElement("dd");dd.textContent=value;
    row.append(dt,dd);dl.append(row);
  });
  const now=new Date().toLocaleString("zh-TW",{year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",hour12:false});
  reportText=["【校園設備報修摘要（展示版）】",`填寫時間：${now}`,...rows.map(([key,value])=>`${key}：${value}`),"\n提醒：本摘要由純前端展示頁產生，尚未送交校方或維修單位，圖片未附加。"].join("\n");
  $("photoReminder").hidden=photos.length===0;
}
async function copySummary(){
  let ok=false;
  try{if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(reportText);ok=true;}}catch{}
  if(!ok){
    try{const text=document.createElement("textarea");text.value=reportText;text.setAttribute("readonly","");text.style.cssText="position:fixed;left:-9999px;top:0";document.body.append(text);text.select();ok=document.execCommand("copy");text.remove();}catch{}
  }
  $("copyStatus").textContent=ok?"已複製文字摘要，可貼到維修通報管道。":"無法自動複製，請手動選取摘要內容。";
}
function resetForm(){
  photos.forEach(x=>URL.revokeObjectURL(x.url));photos=[];renderPhotoPreviews();describePhotoChange("");
  form.reset();chosenEquipment=null;chosenProblem="";reportText="";setUrgency("一般");clearErrors();
  equipGrid.querySelectorAll(".equipment-card").forEach(x=>x.setAttribute("aria-pressed","false"));
  problemGrid.replaceChildren();const hint=document.createElement("div");hint.className="problem-placeholder";hint.textContent="請先在上方選擇設備";problemGrid.append(hint);
  $("guideShell").hidden=true;$("guideContent").hidden=true;$("guideToggle").setAttribute("aria-expanded","false");
  $("description").placeholder="例如：設備偶爾會發生異音，重新操作後仍無改善……";
  $("descriptionCount").textContent="0 / 240";
  $("copyStatus").textContent="";
  $("successView").hidden=true;$("formView").hidden=false;updateProgress();jumpTo($("workPanel"));
  equipGrid.querySelector("button")?.focus({preventScroll:true});
}

makeEquipmentCards();
["building","floor"].forEach(key=>$(key).addEventListener("change",()=>{showError(key,"");updateProgress();}));
$("description").addEventListener("input",()=>{$("descriptionCount").textContent=`${$("description").value.length} / 240`;});
$("guideToggle").addEventListener("click",()=>{const open=$("guideToggle").getAttribute("aria-expanded")==="true";$("guideToggle").setAttribute("aria-expanded",String(!open));$("guideContent").hidden=open;});
document.querySelectorAll("[data-urgency]").forEach(btn=>btn.addEventListener("click",()=>setUrgency(btn.dataset.urgency)));
$("photos").addEventListener("change",event=>addPhotos(event.target.files));
const drop=$("photoDrop");
drop.addEventListener("dragover",event=>{event.preventDefault();drop.classList.add("drag-active");});
drop.addEventListener("dragleave",()=>drop.classList.remove("drag-active"));
drop.addEventListener("drop",event=>{event.preventDefault();drop.classList.remove("drag-active");addPhotos(event.dataTransfer.files);});
form.addEventListener("submit",event=>{
  event.preventDefault();
  if(!checkForm())return;
  fillReceipt();$("formView").hidden=true;$("successView").hidden=false;jumpTo($("workPanel"));$("successTitle").focus({preventScroll:true});
});
$("copyButton").addEventListener("click",copySummary);
$("resetButton").addEventListener("click",resetForm);
updateProgress();
const months=["JAN","FEV","MAR","ABR","MAI","JUN","JUL","AGO","SET","OUT","NOV","DEZ"];

let data={};
let showFiveYears=false;
const pin="7979";

/* ================= PIN ================= */
function confirmPin(){
  if(document.getElementById("pinInput").value===pin){
    document.getElementById("pinLock").style.display="none";
    document.getElementById("mainApp").classList.remove("hidden");
    document.getElementById("monthsContainer").classList.remove("hidden");
    document.getElementById("footerControls").classList.remove("hidden");
    generateMonths();
  }
}

/* ================= TEMA ================= */
function toggleTheme(){
  document.body.classList.toggle("light");
  localStorage.setItem("theme",
    document.body.classList.contains("light")?"light":"dark");
}

/* ================= MODAL ================= */
function openModal(){ modal.classList.remove("hidden"); }
function closeModal(){ modal.classList.add("hidden"); }

/* ================= VISIBILIDADE ================= */
function handleType(){
  const t=expenseType.value;
  expenseCard.classList.toggle("hidden",t!=="parcelado");
  expenseInstallments.classList.toggle("hidden",t!=="parcelado");
}
function handlePayer(){
  otherPayer.classList.toggle("hidden",expensePayer.value!=="Outro");
}

/* ================= SALVAR ================= */
function saveExpense(){
  const value=parseFloat(expenseValue.value);
  if(isNaN(value)) return alert("Valor inválido");

  const type=expenseType.value;
  const payer=expensePayer.value==="Outro"?otherPayer.value:expensePayer.value;
  const card=expenseCard.value==="Outro"?otherCard.value:expenseCard.value;
  const month=expenseMonth.value;
  const year=2026;

  if(type==="parcelado"){
    const installments=parseInt(expenseInstallments.value)||1;
    const base=months.indexOf(month);
    const part=value/installments;

    for(let i=0;i<installments;i++){
      const m=months[(base+i)%12];
      const y=year+Math.floor((base+i)/12);
      const key=`${m}-${y}`;
      if(!data[key]) data[key]=[];
      data[key].push({value:part,type,payer,card});
    }
  }
  else if(type==="recorrente"){
    for(let i=0;i<12;i++){
      const d=new Date(year,months.indexOf(month)+i,1);
      const key=`${months[d.getMonth()]}-${d.getFullYear()}`;
      if(!data[key]) data[key]=[];
      data[key].push({value,type,payer,card});
    }
  }
  else{
    const key=`${month}-${year}`;
    if(!data[key]) data[key]=[];
    data[key].push({value,type,payer,card});
  }

  persist();
  generateMonths();
  closeModal();
}

/* ================= TOGGLE DETALHES ================= */
function toggleDetails(id, btn){
  const el = document.getElementById(id);
  if(!el) return;

  if(el.classList.contains("hidden")){
    el.classList.remove("hidden");
    btn.innerText = "[-]";
  } else {
    el.classList.add("hidden");
    btn.innerText = "[+]";
  }
}

/* ================= GERAR MESES ================= */
function generateMonths(){
  const container=document.getElementById("monthsContainer");
  container.innerHTML="";
  const startYear=2026;
  const years=showFiveYears?10:1;

  for(let y=0;y<years;y++){
    for(let m=0;m<12;m++){

      const year=startYear+y-(showFiveYears?5:0);
      const key=`${months[m]}-${year}`;
      if(!data[key]) data[key]=[];

      const vista = data[key].filter(e=>e.type==="vista");
      const parcelado = data[key].filter(e=>e.type==="parcelado");
      const recorrente = data[key].filter(e=>e.type==="recorrente");

      const sum = arr => arr.reduce((s,e)=>s+e.value,0);

      const totalVista = sum(vista);
      const totalParcelado = sum(parcelado);
      const totalRecorrente = sum(recorrente);
      const total = totalVista + totalParcelado + totalRecorrente;

      const meu = data[key]
        .filter(e=>e.payer==="Carlos França" || e.type==="recorrente")
        .reduce((s,e)=>s+e.value,0);

      const saldo=(parseFloat(totalIncome.value)||0)-meu;

      const idVista=`vista-${key}`;
      const idParcelado=`parcelado-${key}`;
      const idRecorrente=`recorrente-${key}`;

      const card=document.createElement("div");
      card.className="month-card";

      card.innerHTML=`
        <h3>${months[m]} ${year.toString().slice(2)}</h3>

        <div><strong>Total:</strong> R$ ${total.toFixed(2)}</div>

        <hr style="opacity:0.08;margin:12px 0">

        ${renderCategory("À Vista", totalVista, vista, idVista, key)}
        ${renderCategory("Parcelado", totalParcelado, parcelado, idParcelado, key)}
        ${renderCategory("Recorrente", totalRecorrente, recorrente, idRecorrente, key)}

        <hr style="opacity:0.08;margin:12px 0">

        <div><strong>Meu Valor:</strong> R$ ${meu.toFixed(2)}</div>
        <div><strong>Saldo Atual:</strong> R$ ${saldo.toFixed(2)}</div>

        <div style="margin-top:15px">
          <button class="btn-minimal" onclick="clearMonth('${key}')">
            Limpar mês
          </button>
        </div>
      `;

      container.appendChild(card);
    }
  }

  updateTop();
}

/* ================= RENDER CATEGORY ================= */
function renderCategory(title,total,items,id,key){

  const detailsHTML = items.map((e,i)=>`
    <div style="
      margin:6px 0;
      padding:4px 0;
      border-bottom:1px solid rgba(255,255,255,0.06);
      font-size:12px;
      opacity:0.75;
    ">
      R$ ${e.value.toFixed(2)} • ${e.card||""} ${e.card?"•":""} ${e.payer}
      <span 
        onclick="deleteExpense('${key}',${data[key].indexOf(e)})"
        style="cursor:pointer;color:#ff4d4d;margin-left:6px;font-size:12px">
        🗑
      </span>
    </div>
  `).join("");

  return `
    <div style="
      display:flex;
      justify-content:space-between;
      align-items:center;
      margin-top:12px;
    ">
      <strong>${title}</strong>
      <div style="display:flex;align-items:center;gap:6px;">
        <span>R$ ${total.toFixed(2)}</span>
        <span 
          onclick="toggleDetails('${id}',this)"
          style="
            cursor:pointer;
            color:#d4af37;
            font-weight:bold;
          "
        >
          [+]
        </span>
      </div>
    </div>

    <div id="${id}" class="hidden">
      ${detailsHTML}
    </div>
  `;
}

/* ================= TOPO ================= */
function updateTop(){
  const key="MAR-2026";
  const total=(data[key]||[]).reduce((s,e)=>s+e.value,0);
  currentExpense.innerText=`R$ ${total.toFixed(2)}`;
  balance.innerText=`R$ ${((parseFloat(totalIncome.value)||0)-total).toFixed(2)}`;
}

/* ================= CONTROLES ================= */
function toggleFiveYears(){
  showFiveYears=!showFiveYears;
  generateMonths();
}

function clearMonth(key){
  if(confirm("Limpar mês?")){
    delete data[key];
    persist();
    generateMonths();
  }
}

function exportData(){
  const blob=new Blob([JSON.stringify(data)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="capital79.json";
  a.click();
}

function triggerImport(){
  document.getElementById("hiddenImport").click();
}

function importData(e){
  const file=e.target.files[0];
  const reader=new FileReader();
  reader.onload=()=>{
    data=JSON.parse(reader.result);
    persist();
    generateMonths();
  };
  reader.readAsText(file);
}

function persist(){
  localStorage.setItem("financeData",JSON.stringify(data));
  localStorage.setItem("income",totalIncome.value);
}

/* ================= INIT ================= */
(function init(){
  const d=localStorage.getItem("financeData");
  if(d) data=JSON.parse(d);

  const inc=localStorage.getItem("income");
  if(inc) totalIncome.value=inc;

  if(localStorage.getItem("theme")==="light")
    document.body.classList.add("light");
})();

/* ================= PDF GRÁFICO ANUAL ================= */

async function generateAnnualPDF(){

  const { jsPDF } = window.jspdf;

  const years = [...new Set(
    Object.keys(data).map(k => k.split("-")[1])
  )];

  if(years.length === 0){
    alert("Sem dados para gerar gráfico.");
    return;
  }

  for(const year of years){

    const doc = new jsPDF("landscape");

    const canvas = document.createElement("canvas");
    canvas.width = 1000;
    canvas.height = 400;
    const ctx = canvas.getContext("2d");

    const totals = months.map(m => {
      const key = `${m}-${year}`;
      return (data[key]||[])
        .reduce((s,e)=>s+e.value,0);
    });

    new Chart(ctx,{
      type:"bar",
      data:{
        labels:months,
        datasets:[{
          label:`Despesas ${year}`,
          data:totals,
          backgroundColor:"#d4af37"
        }]
      },
      options:{
        responsive:false,
        plugins:{
          legend:{display:false}
        },
        scales:{
          y:{
            ticks:{color:"#000"}
          }
        }
      }
    });

    await new Promise(r=>setTimeout(r,500));

    const img = canvas.toDataURL("image/png");

    doc.setFontSize(18);
    doc.text(`CAPITAL 79 - Relatório Financeiro ${year}`, 14, 20);
    doc.addImage(img,"PNG",15,30,260,100);

    doc.save(`Capital79_${year}.pdf`);
  }
}

function exportData(){
  const blob=new Blob([JSON.stringify(data)],{type:"application/json"});
  const a=document.createElement("a");
  a.href=URL.createObjectURL(blob);
  a.download="capital79.json";
  a.click();
}

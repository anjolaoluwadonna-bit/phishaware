const progress = { phish:false, quiz:false, risk:false, analyzer:false };

function updateProgress(){
  const done = Object.values(progress).filter(Boolean).length;
  const pct = Math.round(done / Object.keys(progress).length * 100);
  document.getElementById("progressBar").style.width = pct + "%";
  document.getElementById("progressText").textContent = pct === 100 ? "🏆 PhishAware Training Complete!" : `Training progress: ${pct}%`;
  Object.keys(progress).forEach(k => {
    if(progress[k]) document.getElementById("badge-"+k)?.classList.add("unlocked");
  });
}

function judgeEmail(isPhish){
  const el = document.getElementById("challengeResult");
  el.classList.remove("hidden");
  if(isPhish){
    el.innerHTML = `<h3>🎉 Correct! You spotted the phish.</h3>
    <p>Warning signs include the suspicious sender domain, urgent language, a request to verify an account, and an unexpected login link.</p>`;
    progress.phish = true; updateProgress();
  } else {
    el.innerHTML = `<h3>⚠️ Not quite.</h3><p>This simulated email contains several phishing warning signs: urgency, an unusual sender domain, and a request to verify account information through a link.</p>`;
  }
}

const quiz = [
  {q:"Which is a common phishing warning sign?", a:["Unexpected urgency","A normal greeting","A company logo","Correct spelling"], c:0},
  {q:"What should you do before clicking an unexpected login link?", a:["Click quickly","Verify the sender and destination independently","Forward it to everyone","Enter your password"], c:1},
  {q:"Which password practice is safer?", a:["Reuse one password","Use short passwords","Use unique strong passwords","Share passwords with friends"], c:2},
  {q:"What does MFA add?", a:["Another verification factor","A public password","A faster internet connection","A shorter username"], c:0},
  {q:"A message unexpectedly asks for sensitive information. What is the safer response?", a:["Send it immediately","Verify the request through a trusted channel","Post it online","Ignore all security warnings"], c:1}
];
let qi=0, score=0;

function renderQuiz(){
  const box=document.getElementById("quizBox");
  if(qi>=quiz.length){
    box.innerHTML=`<h3>🛡️ ${score}/${quiz.length} — ${score>=4?"Cyber Defender!":"Keep Learning!"}</h3><p>You completed the PhishAware quiz.</p><button class="btn primary" onclick="restartQuiz()">Try Again</button>`;
    progress.quiz=true; updateProgress(); return;
  }
  const item=quiz[qi];
  box.innerHTML=`<p>Question ${qi+1} of ${quiz.length}</p><h3>${item.q}</h3>${item.a.map((x,i)=>`<button class="quiz-option" onclick="answerQuiz(${i})">${x}</button>`).join("")}<div id="quizFeedback"></div>`;
}
function answerQuiz(i){
  const item=quiz[qi], f=document.getElementById("quizFeedback");
  if(i===item.c){score++;f.innerHTML="<p>✅ Correct!</p>";} else f.innerHTML=`<p>❌ Not quite. The best answer is: <b>${item.a[item.c]}</b>.</p>`;
  document.querySelectorAll(".quiz-option").forEach(b=>b.disabled=true);
  setTimeout(()=>{qi++;renderQuiz()},850);
}
function restartQuiz(){qi=0;score=0;renderQuiz()}

function calculateRisk(){
  const score=["r1","r2","r3","r4"].reduce((s,id)=>s+Number(document.getElementById(id).value),0);
  const el=document.getElementById("riskResult"); el.classList.remove("hidden");
  if(score<=1) el.innerHTML="<h3>🟢 LOW RISK</h3><p>Few of these warning signs were selected, but always verify unexpected messages before acting.</p>";
  else if(score<=2) el.innerHTML="<h3>🟡 MEDIUM RISK</h3><p>Some phishing indicators are present. Verify the sender and avoid unexpected links.</p>";
  else el.innerHTML="<h3>🔴 HIGH RISK</h3><p>Multiple common phishing indicators are present. Do not provide information or use suspicious links without independent verification.</p>";
  progress.risk=true;updateProgress();
}

function analyzeEmail(){
  const text=document.getElementById("emailInput").value.trim();
  if(!text){alert("Paste an email first.");return}
  const status=document.getElementById("scanStatus"), result=document.getElementById("analysisResult");
  status.classList.remove("hidden");result.classList.add("hidden");
  status.innerHTML="🔍 Analyzing educational warning signs...";
  setTimeout(()=>{
    const lower=text.toLowerCase();
    const checks=[
      ["Urgent or threatening language",/(urgent|immediately|suspend|verify now|act now|final warning|expire)/i.test(text)],
      ["Password or login request",/(password|login|log in|sign in|credential)/i.test(text)],
      ["Personal or financial information request",/(social security|ssn|bank|credit card|payment|personal information)/i.test(text)],
      ["Link-related language",/(click|link|http|www\.|verify account)/i.test(text)],
      ["Unexpected attachment language",/(attachment|attached|download)/i.test(text)],
      ["Reward or payment pressure",/(gift card|prize|winner|wire transfer|invoice|refund)/i.test(text)]
    ];
    const hits=checks.filter(x=>x[1]);
    let risk=Math.min(95,15+hits.length*14);
    let label=risk>=65?"🔴 LIKELY PHISHING":risk>=40?"🟡 SUSPICIOUS":"🟢 FEWER WARNING SIGNS";
    status.classList.add("hidden");result.classList.remove("hidden");
    result.innerHTML=`<h3>${label}</h3><h2>Educational Risk Score: ${risk}%</h2>
      <h4>🚨 Warning Signs Detected</h4>
      ${hits.length?`<ul>${hits.map(x=>`<li>${x[0]}</li>`).join("")}</ul>`:"<p>No listed keyword-based warning signs were detected. That does not prove an email is safe.</p>"}
      <h4>💡 What should I do?</h4>
      <p>Verify the sender independently. Avoid unexpected links or attachments, never provide passwords through email, and use the organization's official website or trusted contact information when unsure.</p>
      <button class="btn secondary" onclick="document.getElementById('emailInput').value='';document.getElementById('analysisResult').classList.add('hidden')">Analyze Another Email</button>`;
    progress.analyzer=true;updateProgress();
  },900);
}

const chatToggle=document.getElementById("chatToggle"), chatBox=document.getElementById("chatBox");
function toggleChat(){chatBox.classList.toggle("hidden")}
chatToggle.onclick=toggleChat;
function addChat(text,cls){const d=document.createElement("div");d.className=cls;d.textContent=text;document.getElementById("chatMessages").appendChild(d);d.scrollIntoView()}
function quickChat(type){
  const replies={
    phishing:"Common phishing signs include urgency, unusual sender addresses, unexpected links or attachments, and requests for passwords or sensitive information.",
    password:"Use long, unique passwords for each account. A password manager can help, and MFA adds another layer of protection.",
    link:"Before opening an unexpected link, inspect the domain and independently visit the organization's official site instead of trusting the message."
  }; addChat(replies[type],"bot");
}
function sendChat(){
  const input=document.getElementById("chatInput"), q=input.value.trim();if(!q)return;
  addChat(q,"user-msg");input.value="";
  const l=q.toLowerCase();
  let r=l.includes("password")?"Use a unique strong password and enable MFA when available.":
    l.includes("link")?"Avoid opening unexpected links. Verify the sender and destination independently.":
    l.includes("phish")||l.includes("email")?"Look for urgency, suspicious domains, requests for credentials, unexpected attachments, and unusual links.":
    "I’m a simple classroom demo assistant. Try asking about phishing, passwords, or suspicious links.";
  setTimeout(()=>addChat(r,"bot"),300);
}
document.getElementById("chatInput").addEventListener("keydown",e=>{if(e.key==="Enter")sendChat()});
document.getElementById("micBtn").onclick=function(){
  this.textContent="🎙️"; addChat("Listening… (voice feature demonstration)","bot");
  setTimeout(()=>this.textContent="🎤",1200);
};
document.getElementById("menuBtn").onclick=()=>document.getElementById("navLinks").classList.toggle("open");
document.querySelectorAll("nav a").forEach(a=>a.onclick=()=>document.getElementById("navLinks").classList.remove("open"));
renderQuiz();

// Interactive teaching scenario: all counts are fictional, never model measurements.
(function(){
 const caught=document.getElementById('caughtSlider'),falseAlarms=document.getElementById('falseSlider');
 if(!caught||!falseAlarms)return;
 function update(){
  const tp=Number(caught.value),fn=40-tp,fp=Number(falseAlarms.value),tn=60-fp;
  const accuracy=(tp+tn)/100,precision=(tp+fp)?tp/(tp+fp):0,recall=tp/40,f1=(precision+recall)?2*precision*recall/(precision+recall):0;
  [['tpVal',tp],['fnVal',fn],['fpVal',fp],['tnVal',tn],['caughtOutput',tp],['falseOutput',fp]].forEach(([id,v])=>document.getElementById(id).textContent=v);
  [['acc',accuracy],['prec',precision],['rec',recall],['f1',f1]].forEach(([id,v])=>{document.getElementById(id+'Text').textContent=(v*100).toFixed(1)+'%';document.getElementById(id+'Bar').style.width=(v*100).toFixed(1)+'%';});
  document.getElementById('metricInsight').textContent=fn+' of 40 phishing emails were missed (false negatives); '+fp+' of 60 legitimate emails triggered false alarms. Lower false negatives increase recall; lower false positives improve precision.';
 }
 caught.addEventListener('input',update);falseAlarms.addEventListener('input',update);
 document.getElementById('resetScenario').addEventListener('click',()=>{caught.value=32;falseAlarms.value=6;update()});update();
})();


// Assignment 4: local educational demos only; NOT secure server authentication.
(function(){
  const $=id=>document.getElementById(id);
  let role='Guest';
  const perms=[['View personal information',['Regular User','Administrator']],['Edit personal profile',['Regular User','Administrator']],['Manage users',['Administrator']],['View security logs',['Administrator']],['Manage website content',['Administrator']]];
  function setRole(next){
    role=next;$('roleStatus').textContent='Active demonstration role: '+role;
    $('rolePermissions').replaceChildren();
    perms.forEach(([name,allowed])=>{let ok=allowed.includes(role);let el=document.createElement('div');el.className='a4-permission '+(ok?'allowed':'denied');el.textContent=(ok?'✓ Allowed: ':'✕ Not allowed: ')+name;$('rolePermissions').append(el)});
    const isUser=role!=='Guest',isAdmin=role==='Administrator';
    $('demoName').disabled=!isUser;$('saveDemoName').disabled=!isUser;
    ['demoUsers','demoLogs','demoContent'].forEach(id=>$(id).disabled=!isAdmin);
    $('profileFeedback').textContent=isUser?'Profile edits are simulated in this browser tab.':'Sign in to a demonstration role to edit.';
    $('adminFeedback').textContent=isAdmin?'Administrator controls enabled in this demo.':'Only the Administrator demonstration role can use these controls.';
  }
  $('roleUser').addEventListener('click',()=>setRole('Regular User'));
  $('roleAdmin').addEventListener('click',()=>setRole('Administrator'));
  $('roleGuest').addEventListener('click',()=>setRole('Guest'));
  $('saveDemoName').addEventListener('click',()=>{$('profileFeedback').textContent='Saved locally for this demo: '+$('demoName').value.slice(0,60)});
  [['demoUsers','Example users: learner, educator (fictional records).'],['demoLogs','Example security log: demonstration role changed (no real logs).'],['demoContent','Content management would require a protected server API. This is a preview only.']].forEach(([id,msg])=>$(id).addEventListener('click',()=>{$('adminFeedback').textContent=msg}));
  setRole('Guest');
  function reply(q){let t=q.toLowerCase();
    if(/phish|fake email|scam|suspicious email/.test(t))return 'Check the sender address carefully, inspect links without opening them, watch for urgent requests, and verify claims through the organization’s official website.';
    if(/password|passphrase/.test(t))return 'Use long, unique passwords for each account. A password manager and multifactor authentication help protect your accounts.';
    if(/mfa|two.factor|authentication|login/.test(t))return 'Authentication proves identity. Multifactor authentication adds a second check, such as an authenticator app or security key.';
    if(/authorization|access|permission|admin/.test(t))return 'Authorization determines what a signed-in person is allowed to do. An administrator may manage users, while a regular user can only manage their own profile.';
    if(/link|url|website/.test(t))return 'Check the full domain name and avoid opening unexpected links. Instead, type the official address yourself.';
    if(/privacy|data|photo/.test(t))return 'Share as little sensitive information as possible. This photo preview stays in your browser; do not upload private photos to unfamiliar websites.';
    if(/hello|hi|hey/.test(t))return 'Hello! I can help with phishing, passwords, MFA, suspicious links, and access control.';
    return 'I can answer common cybersecurity questions about phishing, passwords, MFA, suspicious links, and access control. This demonstration uses predefined guidance, not generative AI.';
  }
  $('a4ChatForm').addEventListener('submit',e=>{e.preventDefault();let q=$('a4ChatQuestion').value.trim();if(!q)return;let history=$('a4ChatHistory');for(let [txt,cls] of [[q,'me'],[reply(q),'bot']]){let d=document.createElement('div');d.className='a4-bubble '+cls;d.textContent=txt;history.append(d)}history.scrollTop=history.scrollHeight;$('a4ChatQuestion').value=''});
  let photoUrl=null;
  $('a4Photo').addEventListener('change',e=>{let file=e.target.files[0];if(!file)return;if(!['image/jpeg','image/png','image/webp'].includes(file.type)||file.size>5*1024*1024){$('a4VoiceStatus').textContent='Choose a JPG, PNG, or WebP under 5 MB.';e.target.value='';return;}if(photoUrl)URL.revokeObjectURL(photoUrl);photoUrl=URL.createObjectURL(file);$('a4AvatarImage').src=photoUrl;$('a4AvatarImage').hidden=false;$('a4AvatarFallback').hidden=true;$('a4VoiceStatus').textContent='Photo preview created locally. You can now ask a question.'});
  $('a4RemovePhoto').addEventListener('click',()=>{if(photoUrl)URL.revokeObjectURL(photoUrl);photoUrl=null;$('a4AvatarImage').removeAttribute('src');$('a4AvatarImage').hidden=true;$('a4AvatarFallback').hidden=false;$('a4Photo').value='';});
  $('a4AvatarForm').addEventListener('submit',e=>{e.preventDefault();let q=$('a4AvatarQuestion').value.trim();if(!q)return;$('a4AvatarAnswer').textContent=reply(q);$('a4AvatarQuestion').value='';speak();});
  function speak(){if(!('speechSynthesis' in window)){$('a4VoiceStatus').textContent='Text-to-speech is not supported in this browser.';return;}window.speechSynthesis.cancel();let u=new SpeechSynthesisUtterance($('a4AvatarAnswer').textContent);u.rate=.95;window.speechSynthesis.speak(u);$('a4VoiceStatus').textContent='Speaking the guide’s answer…'}
  $('a4Speak').addEventListener('click',speak);
  $('a4Stop').addEventListener('click',()=>{if('speechSynthesis'in window)window.speechSynthesis.cancel();$('a4VoiceStatus').textContent='Speech stopped.'});
  $('a4Listen').addEventListener('click',()=>{let Rec=window.SpeechRecognition||window.webkitSpeechRecognition;if(!Rec){$('a4VoiceStatus').textContent='Speech recognition is not available in this browser. Please type your question.';return;}let r=new Rec();r.lang='en-US';r.interimResults=false;r.onresult=e=>{$('a4AvatarQuestion').value=e.results[0][0].transcript;$('a4AvatarForm').requestSubmit()};r.onerror=e=>{$('a4VoiceStatus').textContent='Microphone issue: '+e.error+'. You can still type your question.'};r.start();$('a4VoiceStatus').textContent='Listening for a question…'});
})();

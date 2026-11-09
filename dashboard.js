(() => {
'use strict';
const $ = id => document.getElementById(id);
let config = {id:'', timezone:Intl.DateTimeFormat().resolvedOptions().timeZone || 'Asia/Yekaterinburg'};
try { Object.assign(config, JSON.parse(localStorage.getItem('edulog.calendar.v1') || '{}')); } catch (_) {}
function validZone(zone) { try { new Intl.DateTimeFormat('ru', {timeZone:zone}); return true; } catch (_) { return false; } }
if (!validZone(config.timezone)) config.timezone='Asia/Yekaterinburg';
function dayParts(date) { return new Intl.DateTimeFormat('en-CA',{timeZone:config.timezone,year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).reduce((a,p)=>(a[p.type]=p.value,a),{}); }
function dates() { const p=dayParts(new Date()); const start=new Date(Date.UTC(+p.year,+p.month-1,+p.day));const end=new Date(start);end.setUTCDate(end.getUTCDate()+6);return {start,end,key:start.toISOString().slice(0,10)}; }
function compact(d) { return d.toISOString().slice(0,10).replace(/-/g,''); }
let lastDay='';
function tick() { const now=new Date();$('clock').textContent=new Intl.DateTimeFormat('ru-RU',{timeZone:config.timezone,hour:'2-digit',minute:'2-digit'}).format(now);$('date').textContent=new Intl.DateTimeFormat('ru-RU',{timeZone:config.timezone,weekday:'long',day:'numeric',month:'long'}).format(now);const {start,end,key}=dates();const fmt=new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long',timeZone:'UTC'});$('range').textContent=fmt.format(start)+' — '+fmt.format(end);if(lastDay!==key){lastDay=key;load();} }
function load() { const connected=!!config.id;$('empty').hidden=connected;$('calendarFrame').hidden=!connected;if(!connected){$('calendarFrame').removeAttribute('src');return;}const {start,end}=dates();const params=new URLSearchParams({src:config.id,ctz:config.timezone,mode:'AGENDA',dates:compact(start)+'/'+compact(end),hl:'ru',showTitle:'0',showNav:'0',showDate:'0',showPrint:'0',showTabs:'0',showCalendars:'0',showTz:'0',bgcolor:'#ffffff'});$('calendarFrame').src='https://calendar.google.com/calendar/embed?'+params; }
function open() {$('calendarId').value=config.id;$('timezone').value=config.timezone;$('error').hidden=true;$('dialog').showModal();}
$('settings').onclick=open;$('connect').onclick=open;$('cancel').onclick=()=>$('dialog').close();$('refresh').onclick=load;
$('form').onsubmit=e=>{e.preventDefault();let id=$('calendarId').value.trim();const zone=$('timezone').value.trim();try{if(/<iframe/i.test(id)){const doc=new DOMParser().parseFromString(id,'text/html');id=doc.querySelector('iframe')?.getAttribute('src')||'';}if(/^https?:/i.test(id)){const url=new URL(id);if(url.hostname!=='calendar.google.com')throw Error('Используйте ссылку Google Календаря.');id=url.searchParams.get('src')||'';}if(!id||id.length>512||/[\s<>]/.test(id)||!id.includes('@'))throw Error('Укажите ID календаря, например example@gmail.com.');if(!validZone(zone))throw Error('Проверьте часовой пояс, например Asia/Yekaterinburg.');config={id,timezone:zone};let saved=true;try{localStorage.setItem('edulog.calendar.v1',JSON.stringify(config));}catch(_){saved=false;}tick();load();$('dialog').close();if(!saved)alert('Календарь подключен, но сохранение недоступно. После перезапуска подключите его снова.');}catch(error){$('error').textContent=error.message;$('error').hidden=false;}};
tick();setInterval(tick,30000);setInterval(load,15*60*1000);
})();

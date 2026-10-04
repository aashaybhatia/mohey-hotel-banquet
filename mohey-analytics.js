/* MOHEY WEBSITE ANALYTICS
   Add this script immediately before </body> in the live Mohey HTML.
   Configure the two public Supabase values below.
*/
window.MOHEY_ANALYTICS=(function(){
  var M=window.MOHEY_CONFIG||{};
  var A=M.ANALYTICS||{};
  return {
    SUPABASE_URL:M.SUPABASE_URL||"",
    SUPABASE_ANON_KEY:M.SUPABASE_ANON_KEY||"",
    EVENT_TABLE:A.EVENT_TABLE||((M.TABLES&&M.TABLES.EVENTS)||"site_events"),
    ENABLED:A.ENABLED!==false,
    HEARTBEAT_MS:A.HEARTBEAT_MS||60000
  };
})();

(function(){
  "use strict";
  var C=window.MOHEY_ANALYTICS;
  if(!C.ENABLED || !C.SUPABASE_URL || !C.SUPABASE_ANON_KEY) return;

  var endpoint=C.SUPABASE_URL.replace(/\/$/,"")+"/rest/v1/"+C.EVENT_TABLE;
  var sid=localStorage.getItem("mohey_session_id");
  if(!sid){
    sid=(crypto.randomUUID?crypto.randomUUID():Date.now()+"-"+Math.random().toString(36).slice(2));
    localStorage.setItem("mohey_session_id",sid);
  }

  function query(){
    var p=new URLSearchParams(location.search);
    return {
      source:p.get("utm_source")||"direct",
      medium:p.get("utm_medium")||"",
      campaign:p.get("utm_campaign")||"",
      content:p.get("utm_content")||"",
      term:p.get("utm_term")||""
    };
  }
  function send(name,metadata){
    var q=query();
    var body={
      event_name:name,
      session_id:sid,
      path:location.pathname,
      title:document.title,
      referrer:document.referrer||null,
      source:q.source,
      medium:q.medium||null,
      campaign:q.campaign||null,
      content:q.content||null,
      term:q.term||null,
      metadata:metadata||{},
      created_at:new Date().toISOString()
    };
    fetch(endpoint,{
      method:"POST",
      headers:{
        "Content-Type":"application/json",
        apikey:C.SUPABASE_ANON_KEY,
        Authorization:"Bearer "+C.SUPABASE_ANON_KEY,
        Prefer:"return=minimal"
      },
      body:JSON.stringify(body),
      keepalive:true
    }).catch(function(){});
  }

  send("session_start");
  send("page_view");

  document.addEventListener("click",function(ev){
    var el=ev.target.closest("a,button");
    if(!el)return;
    var text=(el.innerText||el.getAttribute("aria-label")||"").trim().slice(0,100);
    var href=el.getAttribute("href")||"";
    if(el.matches("[data-enquire]")) send("enquiry_start",{label:text,type:el.getAttribute("data-type")||""});
    if(/^tel:/i.test(href)) send("phone_click",{label:text});
    if(/wa\.me|whatsapp/i.test(href)) send("whatsapp_click",{label:text});
    if(el.id==="chat-open") send("chat_open");
  });

  /* Keep these available to the existing website's submit/chat code. */
  window.MoheyTrackEnquiry=function(data){
    send("enquiry_submit",{
      type:data&&data.type||"",
      guests:data&&data.guests?Number(data.guests):null,
      source:data&&data.source||"website"
    });
  };
  window.MoheyTrackChatLead=function(data){
    send("chat_lead_submit",{
      type:data&&data.type||"",
      guests:data&&data.guests?Number(data.guests):null
    });
  };

  /* Heartbeat drives the live visitor counter. */
  setInterval(function(){send("heartbeat")},C.HEARTBEAT_MS);
})();

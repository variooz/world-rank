const SUPABASE_URL="https://hxdxwcwdumuwmupxdsov.supabase.co";

const SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4ZHh3Y3dkdW11d211cHhkc292Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwOTQyNDMsImV4cCI6MjA5ODY3MDI0M30.beuNWaXvqSbuUU6JewZFGhSssZAN3flJrRH128qtoxY";

async function loadLeaderboard(){

const response=await fetch(
`${SUPABASE_URL}/rest/v1/leaderboard?select=player_name,time_seconds&order=time_seconds.asc&limit=100`,
{

headers:{

apikey:SUPABASE_ANON_KEY,

Authorization:`Bearer ${SUPABASE_ANON_KEY}`

}

}

);

const data=await response.json();

const tbody=document.getElementById("leaderboard");

tbody.innerHTML="";

data.forEach((player,index)=>{

let minutes=Math.floor(player.time_seconds/60);

let seconds=(player.time_seconds%60).toFixed(2);

let tr=document.createElement("tr");

let medal=index==0?"🥇":index==1?"🥈":index==2?"🥉":index+1;

tr.innerHTML=`

<td>${medal}</td>

<td>${player.player_name}</td>

<td>${minutes.toString().padStart(2,"0")}:${seconds.padStart(5,"0")}</td>

`;

tbody.appendChild(tr);

});

if(data.length>0){

let champion=data[0];

let minutes=Math.floor(champion.time_seconds/60);

let seconds=(champion.time_seconds%60).toFixed(2);

document.getElementById("championName").innerText=champion.player_name;

document.getElementById("championTime").innerText=`${minutes.toString().padStart(2,"0")}:${seconds.padStart(5,"0")}`;

}

}

loadLeaderboard();

setInterval(loadLeaderboard,15000);

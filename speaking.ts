const nspeak = document.getElementById("nspeak") as HTMLInputElement;
const nlisten = document.getElementById("nlisten") as HTMLInputElement;
const topic = document.getElementById("topic") as HTMLSelectElement;
const proficiency = document.getElementById("proficiency") as HTMLHeadingElement;
const situation = document.getElementById("situation") as HTMLHeadingElement;
const description = document.getElementById("description") as HTMLParagraphElement;
for(const e of document.getElementsByClassName("range-display") as HTMLCollectionOf<HTMLElement>){
    const target = document.getElementById(e.getAttribute("for")!) as HTMLInputElement;
    const dw = e.getAttribute("data-width");
    if(dw!==null){
        e.style.width = `${dw}ch`;
        e.style.display = "inline-block";
        e.style.textAlign = "right";
    }
    function update_field(){
        if(target.value === target.max && e.getAttribute("data-over")==="over"){
            e.textContent = `${target.valueAsNumber-1}+`;
        }else{
            e.textContent = target.value;
        }
    }
    target.addEventListener("input",update_field);
    update_field();
}
function update(){
    const sc = nspeak.valueAsNumber;
    const nc = nlisten.valueAsNumber;
    let value: number;
    if(sc){
        if(nc===0){
            if(sc===1){
                if(topic.value==="casu"){
                    situation.textContent = "One-on-one chit chat";
                    description.textContent = "Less sustainable than fossil fuel.";
                    value = 0.33;
                }else{
                    situation.textContent = "One-on-one discussion";
                    description.textContent = "I can speak pretty well. Sometimes I speak too much, though.";
                    value = 1.0;
                }
            }else if(sc<=8){
                if(topic.value==="casu"){
                    situation.textContent = "Small gathering";
                    description.textContent = "I won't talk much unless asked.";
                    value = 0.3;
                }else{
                    situation.textContent = "Group discussion";
                    description.textContent = "Pretty active participation. No stress.";
                    value = 0.85;
                }
            }else{
                if(topic.value==="casu"){
                    situation.textContent = "Medium-to-large gathering";
                    description.textContent = "Let me just hide in a corner until it's over.";
                    value = 0.1;
                }else{
                    situation.textContent = "Classroom discussion";
                    description.textContent = "Okay participation.";
                    value = 0.85-(sc-8)/110;
                }
            }
        }else{
            if(sc<=10){
                situation.textContent = "Group presentation";
                description.textContent = "Pretty good performance. A bit nervous, though.";
                value = 0.81;
            }else{
                situation.textContent = "Chaotic group presentation";
                description.textContent = "I've never experienced something like this before, and I'm not looking forward to it.";
                value = 0.70;
            }
        }
    }else{
        if(nc===0){
            situation.textContent = "Monologue";
            if(topic.value==="casu"){
                description.textContent = "I don't even remember when was the last time I had a casual monologue, but I guess it won't be too bad... hopefully...";
                value = 0.7;
            }else{
                description.textContent = "Best performance, and feels great. I can go on non-stop for an hour.";
                value = 1.3;
            }
        }else if(nc===1){
            if(topic.value==="casu"){
                situation.textContent = "Sharing my experiences";
                description.textContent = "I can't hold it for more than 20 minutes, probably.";
                value = 0.45;
            }else{
                situation.textContent = "Explaining to someone";
                description.textContent = "Feels good, and I'm almost unstoppable.";
                value = 1.1;
            }
        }else if(nc<=30){
            if(topic.value==="casu"){
                situation.textContent = "Weirdly casual presentation";
                description.textContent = "I would never waste such an opportunity discussing unimportant things.";
                value = NaN;
            }else{
                situation.textContent = "Classroom presentation";
                description.textContent = "I can articulate myself clearly enough, though I sometimes pause and wonder if the audience understood what I said.";
                value = 0.93;
            }
        }else{
            situation.textContent = "Public speech";
            if(topic.value==="casu"){
                description.textContent = "I would never waste a public speech opportunity discussing unimportant things.";
                value = NaN;
            }else{
                description.textContent = "I get way too excited and probably talk faster than I should.";
                value = 1.28;
            }
        }
    }
    proficiency.textContent = `${(100*value).toFixed(2)}%`;
}
nspeak.addEventListener("input",update);
nlisten.addEventListener("input",update);
topic.addEventListener("input",update);
update();

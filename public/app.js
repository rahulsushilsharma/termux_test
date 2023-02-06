const print = console.log;
const select = document.querySelector;
const selectAll = document.querySelectorAll;
const html = String.raw;

let clip = {
  clip_no: "",
  start: "",
  end: "",
};

let clip_data = {
  name: "",
  clips: [clip],
};

function convertStringToHtml(htmlTemplate) {
  return document.createRange().createContextualFragment(htmlTemplate);
}

function appendTohtml(query, template) {
  let html_ = convertStringToHtml(template);
  document.querySelector(query).append(html_);
}

async function post(dir) {
  let data = await fetch("/get-dir", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ dirName: dir }),
  });
  data = await data.json();
  return data;
}

async function saveToDb(data) {
  let res = await fetch("/save-to-db", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ data: data }),
  });
  res = await res.json();
  return res;
}

function processData(data) {
  data.clips.shift();
  for (let i = 0; i < data.clips.length - 1; i++) {
    data.clips[i].end = data.clips[i + 1].start;
  }
  data.clips.pop();
  return data;
}

async function run(dir) {
  let data = {};
  data = await post(dir);
  data = data.data
  print(data);
  let template = html` <h4>Totel entries : ${data.length}</h4>`;
  data.forEach((ele) => {
    template += html`<div class="entry" onclick="openPlayer('${ele.local_path}')">
      <p>${ele.name}</p>
    </div>`;
  });
  appendTohtml("body", template);
}

function openPlayer(path) {
  // let path = event.srcElement.innerText;
  let template = html`
    <div class="viewer">
      <div class="container">
        <div class="controls">
          <button onclick="close_viewer(event)">close</button>
          <button onclick="save_clips()">save</button>
        </div>
        <div class="video_container">
          <video id="${path}" width="320" height="240" controls>
            <source src="${path}" type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
        <div class="controls">
          <input value="clip" type="button" onclick="getTimeStamp('${path}')" />
        </div>
        <div id="clips"></div>
      </div>
    </div>
  `;
  appendTohtml("body", template);
  clip_data.name = path;
}

function close_viewer(event) {
  event.srcElement.offsetParent.remove();
  clip_data = {
    name: "",
    clips: [clip],
  };
  
}
function save_clip() {
  let data = processData(clip_data);
  saveToDb(data);
  clip_data = {
    name: "",
    clips: [clip],
  };
  
}

function getTimeStamp(id) {
  let clip_ = document.getElementById(id).currentTime;
  clip_ = new Date(clip_ * 1000).toISOString().slice(11, 19);
  let template = html`<p>${clip_}</p>`;
  appendTohtml("#clips", template);
  clip.clip_no = clip_data.clips.length;
  clip.start = clip_;
  clip.end = "";
  clip_data.clips.push(clip);
  clip = {
    clip_no: "",
    start: "",
    end: "",
  };
  print(clip_data);
}

run("./video");

console.log("lets Start java script ")

function formatTime(seconds) {
    seconds = Math.floor(seconds);
    let minutes = Math.floor(seconds / 60);
    let remainingSeconds = seconds % 60;
    let minStr = String(minutes).padStart(2, '0');
    let secStr = String(remainingSeconds).padStart(2, '0');

    return `${minStr}:${secStr}`;
}

let currentSong = new Audio();
let songs;

async function getSongs() {
    let a = await fetch("http://127.0.0.1:3000/songsAD/")
    let response = await a.text();
    let div = document.createElement("Div");
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href);
        }
    }
    return songs;
}

const playMusic = (track, pause = false) => {
    currentSong.src = track;
    document.querySelector(".songInfo").innerHTML = decodeURI(track.split("/").pop());

    document.querySelector(".songtime").innerHTML = "00:00/00:00"
    if (!pause) {
        currentSong.play().catch(err => {
            console.error("Failed to play audio:", err);
            play.src = "pause.svg"
        })
    }
}

async function displayAlbumbs() {
    let album = await fetch("http://127.0.0.1:3000/songsALB/")
    let response = await album.text();
    let div = document.createElement("Div");
    div.innerHTML = response;
    let anchor = div.getElementsByTagName('a')
    for (const e of anchor) {
        if (e.href.includes("/songsALB/")) {
            //  console.log(e)
            let folder = e.href.split("/").filter(Boolean).pop()
           // console.log(folder)
            let a = await fetch(`http://127.0.0.1:3000/songsALB/${folder}/info.json`);
            let meta = await a.json();
            let b = await fetch(`http://127.0.0.1:3000/songsALB/${folder}/cover.jpg`);
            let image = await b.blob();
            document.querySelector(".cardContainer").innerHTML += `
               <div class="card">
                  <img class="play" src="play.svg" alt="">
                  <img src="${URL.createObjectURL(image)}"
                     alt="">
                  <h2>${meta.title}</h2>
                  <p>${meta.description}</p>
               </div>
            `;

        }
    }
}
async function main() {
    // display all the albulbms on the page 
    displayAlbumbs()

    let songs = await getSongs()
    playMusic(songs[0], true);

    // console.log(songs)
    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    for (const song of songs) {
        let songName = decodeURIComponent(song.split("/").pop());
        songUL.innerHTML += ` <li>
               <img class ="invert musicSymb" src="music.svg" alt="">
               <div class="info">
                 <div class="songName">${songName}</div>
                  <div class="songArtist"> song Artist</div>
               </div>
               <div class="playNow">
                  <span>play Now</span>
               <img  class="invert musicSymb"src="play.svg" alt="">
               </div>
              </li>`;
    }

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(element => {
        element.addEventListener("click", e => {
            const songName = element.querySelector(".info").firstElementChild.innerHTML.trim();
            const songURL = `http://127.0.0.1:3000/songsAD/${encodeURIComponent(songName)}`;
            console.log("Playing:", songName);
            playMusic(songURL);
        })
    });
    // Attach an event listener to play, next and previous
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play();
            play.src = "pause.svg"

        }
        else {
            currentSong.pause();
            play.src = "playBarPlay.svg"
        }
    })
}
// listen for time update
currentSong.addEventListener("timeupdate", () => {

    console.log(currentSong.currentTime, currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
})
// add and event lister to seek bar 
document.querySelector(".seekBar").addEventListener("click", e => {
    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
    // console.log(e);
    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = currentSong.duration * percent / 100
})
document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
})

document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%"
})
// add an event lisner for previous and next

previous.addEventListener('click', () => {
    //console.log(currentSong.src.split("/").slice(-1)[0]);
    let currentIndex = songs.indexOf(currentSong.src);
    if (currentIndex > 0) {
        playMusic(songs[currentIndex - 1]);
    } else {
        console.log("Already at the first song");
    }
})

next.addEventListener('click', () => {
    let currentIndex = songs.indexOf(currentSong.src);
    if (currentIndex < songs.length - 1) {
        playMusic(songs[currentIndex + 1]);
    } else {
        console.log("Already at the last song");
    }
})

// add an event listener for volume
document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    console.log(e, e.target, e.target.value)
    currentSong.volume = parseInt(e.target.value) / 100
})
// add event lisener to mute track

document.querySelector(".volume>img").addEventListener("click", e => {
    // console.log(e.target)
    if (currentSong.muted) {
        document.querySelector(".range").getElementsByTagName("input")[0].value = currentSong.volume * 100;
        currentSong.muted = false
        e.target.src = "volume.svg"
    }
    else {
        document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        currentSong.muted = true
        e.target.src = "mute.svg"
    }
})
// load the play list when card is clicked
Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {

        songs = await getSongs()
        console.log(songs)
    })
})


main()

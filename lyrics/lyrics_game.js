function WordCloud(text, {
    size = group => group.length, // Given a grouping of words, returns the size factor for that word
    word = d => d, // Given an item of the data array, returns the word
    marginTop = 0, // top margin, in pixels
    marginRight = 0, // right margin, in pixels
    marginBottom = 0, // bottom margin, in pixels
    marginLeft = 0, // left margin, in pixels
    width = 640, // outer width, in pixels
    height = 400, // outer height, in pixels
    maxWords = 250, // maximum number of words to extract from the text
    fontFamily = "sans-serif", // font family
    fontScale = 15, // base font size
    padding = 0, // amount of padding between the words (in pixels)
    rotate = 0, // a constant or function to rotate the words
    invalidation // when this promise resolves, stop the simulation
} = {}) {
    const words = typeof text === "string" ? text.split(/\W+/g) : Array.from(text);

    const data = d3.rollups(words, size, w => w)
        .sort(([, a], [, b]) => d3.descending(a, b))
        .slice(0, maxWords)
        .map(([key, size]) => ({ text: word(key), size }));

    const svg = d3.create("svg")
        .attr("viewBox", [0, 0, width, height])
        .attr("width", width)
        .attr("font-family", fontFamily)
        .attr("text-anchor", "middle")
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;");

    const g = svg.append("g").attr("transform", `translate(${marginLeft},${marginTop})`);

    const cloud = d3.layout.cloud()
        .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
        .words(data)
        .padding(padding)
        .rotate(rotate)
        .font(fontFamily)
        .fontSize(d => Math.sqrt(d.size) * fontScale)
        .on("word", ({ size, x, y, rotate, text }) => {
            g.append("text")
                .attr("font-size", size)
                .attr("transform", `translate(${x},${y}) rotate(${rotate})`)
                .text(text);
        });

    cloud.start();
    invalidation && invalidation.then(() => cloud.stop());
    return svg.node();
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}

let choices
let choice_idx
let streak = 0
let guesses = 0

async function generateWordcloud() {
    // Choose random file
    file_path = "../assets/lyrics/" + getRandomInt(1970, 2020) + "_lyrics.json"
    // Load file
    const response = await fetch(file_path);
    // Parse file
    const songs = await response.json();
    // Take 4 random entries
    choices = songs.sort(() => 0.5 - Math.random()).slice(0, 4);
    // Generate random right choice
    choice_idx = Math.floor(Math.random() * choices.length);
    let song = choices[choice_idx];

    // Reset button styling and add new choice titles
    choice_buttons = document.getElementsByClassName("choice");
    for (let i = 0; i < choice_buttons.length; i++) {
        choice_buttons[i].classList.remove("btn-danger");
        choice_buttons[i].classList.remove("btn-success");
        choice_buttons[i].classList.add("btn-outline-primary");
        choice_buttons[i].innerHTML = "<h5>" + choices[i].name + "</h5><p>" + choices[i].artists[0].name + "</p>";
    }

    // Generate wordcloud
    lyrics = song.lyrics;
    lyrics = lyrics.substring(lyrics.indexOf("Lyrics") + 1);
    stopwords = new Set("1,2,3,4,5,lyrics,verse,refrain,chorus,interlude,i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall".split(","));
    words = lyrics.split(/[\s.]+/g)
        .map(w => w.replace(/^[“‘"\-—()\[\]{}]+/g, ""))
        .map(w_1 => w_1.replace(/[;:.!?()\[\]{},"'’”\-—]+$/g, ""))
        .map(w_2 => w_2.replace(/['’]s$/g, ""))
        .map(w_3 => w_3.substring(0, 30))
        .map(w_4 => w_4.toLowerCase())
        .filter(w_5 => w_5 && !stopwords.has(w_5));
    let wordcloud = WordCloud(words, {
        width: 600,
        height: 400,
        padding: 0.2,
        fontScale: 20
    });
    // Remove old wordcloud
    children = document.getElementById("game-wordcloud").childNodes;
    for (let i_1 = 0; i_1 < children.length; i_1++) {
        children[i_1].innerHTML = "";
    }
    // Add new wordcloud
    d3.select("#game-wordcloud").append(() => wordcloud);
}

generateWordcloud()

function check(idx) {
    let button = document.getElementById("choice" + idx)
    if (idx == choice_idx) {
        if (guesses == 0) {
            streak++
        }
        guesses = 0
        button.classList.remove("btn-outline-primary")
        button.classList.add("btn-success")
        playAudio()

        if (streak % 5 == 0 && streak > 0) {
            alert(STREAK_MESSAGES[streak / 5 - 1], "success")
        } else if (streak > 40) {
            // Special thing happening after streak of 40
            var audio = document.getElementById('audio');
            var source = document.getElementById('audioSource');
            source.src = "https://p.scdn.co/mp3-preview/b4c682084c3fd05538726d0a126b7e14b6e92c83?cid=47ed75c7b2bf45229352c38954ee1c9c"
            audio.load()
            audio.play()
        }
    } else {
        streak = 0
        guesses++
        button.classList.remove("btn-outline-primary")
        button.classList.add("btn-danger")
        removeAlert()
    }
}



function restartGame() {
    document.getElementById('audio').pause()
    generateWordcloud()
}

function playAudio() {
    var audio = document.getElementById('audio');
    audio.volume = 0.1
    var source = document.getElementById('audioSource');
    if (choices[choice_idx].preview_url != null) {

        source.src = choices[choice_idx].preview_url;
        audio.load(); //call this to just preload the audio without playing
        audio.play(); //call this to play the song right away
    }
}

function restartAfterAudio(event) {
    if (event.currentTime >= 15) {
        event.pause()
        restartGame()
    }
}

const streakAlert = document.getElementById('streakAlert')

const alert = (message, type) => {
    const wrapper = document.createElement('div')
    wrapper.innerHTML = [
        `<div class="alert alert-${type} alert-dismissible" role="alert">`,
        `   <h2 class="text-center">${message}</h2>`,
        '   <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>',
        '</div>'
    ].join('')

    removeAlert()
    streakAlert.append(wrapper)
}

function removeAlert() {
    child = streakAlert.firstElementChild
    if (child != null) {
        streakAlert.removeChild(streakAlert.firstElementChild)
    }
}

STREAK_MESSAGES = [
    "Guessing Spree",
    "Guessing Frenzy",
    "Guessing Riot",
    "Rampage",
    "Dreamwonder",
    "Boogeyman",
    "Grim Guesser",
    "Demon"
]
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

let choice_idx

function generateWordcloudString() {
    file_path = "../assets/lyrics/" + getRandomInt(1970, 2020) + "_lyrics.json"
    return fetch(file_path).then((response) => response.json())
        .then((songs) => songs.sort(() => .5 - Math.random()).slice(0, 4))
        .then((choices) => {
            choice_idx = Math.floor(Math.random() * choices.length)
            song = choices[choice_idx]
            console.log(choice_idx)

            choice_buttons = document.getElementsByClassName("choice")
            console.log(choice_buttons)
            for (let i = 0; i < choice_buttons.length; i++) {
                choice_buttons[i].innerHTML = choices[i].name + " - " + choices[i].artists[0].name
            }

            lyrics = song.lyrics
            lyrics = lyrics.substring(lyrics.indexOf("Lyrics") + 1);
            stopwords = new Set("1,2,3,4,5,lyrics,verse,refrain,chorus,interlude,i,me,my,myself,we,us,our,ours,ourselves,you,your,yours,yourself,yourselves,he,him,his,himself,she,her,hers,herself,it,its,itself,they,them,their,theirs,themselves,what,which,who,whom,whose,this,that,these,those,am,is,are,was,were,be,been,being,have,has,had,having,do,does,did,doing,will,would,should,can,could,ought,i'm,you're,he's,she's,it's,we're,they're,i've,you've,we've,they've,i'd,you'd,he'd,she'd,we'd,they'd,i'll,you'll,he'll,she'll,we'll,they'll,isn't,aren't,wasn't,weren't,hasn't,haven't,hadn't,doesn't,don't,didn't,won't,wouldn't,shan't,shouldn't,can't,cannot,couldn't,mustn't,let's,that's,who's,what's,here's,there's,when's,where's,why's,how's,a,an,the,and,but,if,or,because,as,until,while,of,at,by,for,with,about,against,between,into,through,during,before,after,above,below,to,from,up,upon,down,in,out,on,off,over,under,again,further,then,once,here,there,when,where,why,how,all,any,both,each,few,more,most,other,some,such,no,nor,not,only,own,same,so,than,too,very,say,says,said,shall".split(","))
            words = lyrics.split(/[\s.]+/g)
                .map(w => w.replace(/^[“‘"\-—()\[\]{}]+/g, ""))
                .map(w => w.replace(/[;:.!?()\[\]{},"'’”\-—]+$/g, ""))
                .map(w => w.replace(/['’]s$/g, ""))
                .map(w => w.substring(0, 30))
                .map(w => w.toLowerCase())
                .filter(w => w && !stopwords.has(w))

            wordcloud = WordCloud(words, {
                width: 800,
                height: 500,
                padding: 0.1,
                fontScale: 30
            })
            d3.select("#game-wordcloud").append(() => wordcloud)
        })
}

generateWordcloudString()

function check(idx) {
    let button = document.getElementById("choice" + idx)
    if (idx == choice_idx) {
        button.classList.remove("btn-primary")
        button.classList.add("btn-success")
    } else {
        button.classList.remove("btn-primary")
        button.classList.add("btn-danger")
    }
    restartGame(idx)
}

function restartGame(idx) {
    document.getElementById("audio-player").src = choices[idx].preview_url
}
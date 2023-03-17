fetch("./data_example.json")
    .then((response) => response.json())
    .then((data) => {

        document.getElementById("beautified").innerHTML = JSON.stringify(data, null, 2);
    });
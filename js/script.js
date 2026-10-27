// Harjoitus 1: JSONin perusteet

var text = '{ "employees" : [' +
    '{ "firstName":"John" , "lastName":"Doe" },' +
    '{ "firstName":"Anna" , "lastName":"Smith" },' +
    '{ "firstName":"Peter" , "lastName":"Jones" } ]}';

// Näytetään jokaisesta työntekijästä etu- ja sukunimi.
function naytaNimet() {
    const data = JSON.parse(text);
    let html = "";
    for (let i = 0; i < data.employees.length; i++) {
        html += data.employees[i].firstName + " " + data.employees[i].lastName + "<br>";
    }
    document.getElementById("jsondata").innerHTML = html;
}

// Näytetään kaikki kentät kaikista työntekijöistä, avaimet mukaan lukien.
function naytaKaikki() {
    const data = JSON.parse(text);
    let html = "";
    for (let i = 0; i < data.employees.length; i++) {
        const tyontekija = data.employees[i];
        for (const avain in tyontekija) {
            html += avain + ": " + tyontekija[avain] + "<br>";
        }
        html += "<hr>";
    }
    document.getElementById("jsondata").innerHTML = html;
}


// Harjoitus 2: JSONin parsiminen verkosta

const omdbUrl = "https://www.omdbapi.com/?s=star+wars&apikey=cbbc6750";

// Ladataan data XMLHttpRequestilla ja näytetään vastaus sellaisenaan.
function lataaRaakaData() {
    const tulos = document.getElementById("rawdata");
    tulos.textContent = "Ladataan…";

    const xmlhttp = new XMLHttpRequest();
    xmlhttp.open("GET", omdbUrl, true);
    xmlhttp.onload = function () {
        if (xmlhttp.status === 200) {
            tulos.textContent = xmlhttp.responseText;
        } else {
            tulos.textContent = "Lataus epäonnistui. Virhekoodi: " + xmlhttp.status;
        }
    };
    xmlhttp.onerror = function () {
        tulos.textContent = "Verkkovirhe. Katso Console-välilehti (F12).";
    };
    xmlhttp.send();
}

// Ladataan sama data fetchillä, parsitaan se ja näytetään taulukossa kuvien kanssa.
function lataaJaParsi() {
    const tulos = document.getElementById("rawdata");
    tulos.textContent = "Ladataan…";

    fetch(omdbUrl)
        .then(response => response.json())
        .then(data => naytaElokuvat(data))
        .catch(error => {
            console.error("Virhe elokuvien haussa:", error);
            tulos.textContent = "Lataus epäonnistui. Katso Console-välilehti (F12).";
        });
}

function naytaElokuvat(data) {
    let html = `
        <table border="1">
            <tr>
                <th>Juliste</th>
                <th>Nimi</th>
                <th>Vuosi</th>
                <th>Tyyppi</th>
                <th>IMDb-tunnus</th>
            </tr>`;
    for (let i = 0; i < data.Search.length; i++) {
        const elokuva = data.Search[i];
        // OMDb palauttaa "N/A", jos julistetta ei ole.
        const kuva = elokuva.Poster !== "N/A"
            ? `<img src="${elokuva.Poster}" alt="${elokuva.Title}" width="80">`
            : "";
        html += `
            <tr>
                <td>${kuva}</td>
                <td>${elokuva.Title}</td>
                <td>${elokuva.Year}</td>
                <td>${elokuva.Type}</td>
                <td><a href="https://www.imdb.com/title/${elokuva.imdbID}/">${elokuva.imdbID}</a></td>
            </tr>`;
    }
    html += "</table>";
    document.getElementById("rawdata").innerHTML = html;
}


// Harjoitus 3: OpenWeatherMap API

// Vaihda tähän oma API-avaimesi OpenWeatherMapin sivuilta.
const apiKey = "5084930be1abed06f8fa68707b761ab0";

function saaUrl(kaupunki) {
    return "https://api.openweathermap.org/data/2.5/weather" +
        "?q=" + encodeURIComponent(kaupunki) +
        "&units=metric&lang=fi&appid=" + apiKey;
}

// Vaihe 1: haetaan Helsingin sää ja näytetään raakadata.
function haeRaakaSaa() {
    const tulos = document.getElementById("weatherdata");
    tulos.textContent = "Ladataan säätietoja…";

    fetch(saaUrl("Helsinki"))
        .then(response => response.text())
        .then(teksti => {
            tulos.textContent = teksti;
        })
        .catch(error => {
            console.error("Virhe säätietojen haussa:", error);
            tulos.textContent = "Verkkovirhe. Katso Console-välilehti (F12).";
        });
}

// Vaiheet 2–4: haetaan annetun kaupungin sää ja näytetään parsittuna.
function haeSaa(kaupunki) {
    const tulos = document.getElementById("weatherdata");
    kaupunki = kaupunki.trim();

    if (!kaupunki) {
        tulos.textContent = "Kirjoita kaupungin nimi.";
        return;
    }

    tulos.textContent = "Ladataan säätietoja…";

    fetch(saaUrl(kaupunki))
        .then(response => {
            if (response.status === 404) {
                throw new Error("Kaupunkia ei löytynyt.");
            }
            if (response.status === 401) {
                throw new Error("API-avain on virheellinen. Tarkista avain.");
            }
            if (!response.ok) {
                throw new Error("Haku epäonnistui. Virhekoodi: " + response.status);
            }
            return response.json();
        })
        .then(json => naytaSaa(json))
        .catch(error => {
            console.error("Virhe säätietojen haussa:", error);
            tulos.textContent = error.message;
        });
}

function naytaSaa(json) {
    document.getElementById("weatherdata").innerHTML = `
        <table border="1">
            <tr>
                <th>Kaupunki</th>
                <th>Lämpötila</th>
                <th>Pilvisyys</th>
                <th>Ilmankosteus</th>
                <th>Sää</th>
            </tr>
            <tr>
                <td>${json.name}, ${json.sys.country}</td>
                <td>${Math.round(json.main.temp)} °C</td>
                <td>${json.clouds.all} %</td>
                <td>${json.main.humidity} %</td>
                <td>
                    <img src="https://openweathermap.org/img/wn/${json.weather[0].icon}@2x.png"
                        alt="${json.weather[0].description}">
                    <br>${json.weather[0].description}
                </td>
            </tr>
        </table>`;
}

// Hakukenttä: haku käynnistyy painikkeesta tai Enter-näppäimellä.
document.getElementById("search").addEventListener("click", () => {
    haeSaa(document.getElementById("citysearch").value);
});
document.getElementById("citysearch").addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
        haeSaa(event.target.value);
    }
});

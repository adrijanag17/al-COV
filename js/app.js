const country_name_element = document.querySelector(".name");
const total_cases_element = document.querySelector(".total-cases .value");
const new_cases_element = document.querySelector(".total-cases .new-value");
const recovered_element = document.querySelector(".recovered .value");
const new_recovered_element = document.querySelector(".recovered .new-value");
const deaths_element = document.querySelector(".deaths .value");
const new_deaths_element = document.querySelector(".deaths .new-value");

const ctx = document.getElementById("axes-line-chart").getContext("2d");

var user_name, cases_list, recovered_list, deaths_list, dates, formatedDates;

fetch("https://api.ipgeolocation.io/ipgeo?apiKey=773edc00f67b4cb09e17cba1a70e3720")
.then((res) => {
    return res.json();
})
.then((data) => {
    let country_code = data.country_code2;
    country_list.forEach((country) => {
    if (country.code == country_code) {
        user_country = country.name;
    }
    });
    fetchData(user_country);
});

function fetchData(country){
    country_name_element.innerHTML = "Loading...";

    async function api_fetch(country){
        var requestOptions = {
            method: 'GET',
            redirect: 'follow'
        };

        cases_list = [], recovered_list = [], deaths_list = [], dates = [];

        await fetch("https://api.covid19api.com/total/country/"+country+"/status/confirmed",
        requestOptions)
        .then(res =>{
            return res.json();
        })
        .then(data =>{
            data.forEach(entry =>{
                dates.push(entry.Date);
                cases_list.push(entry.Cases);
            });
        });
        await fetch("https://api.covid19api.com/total/country/"+country+"/status/recovered?from=2020-01-22T00:00:00Z&to=2021-08-04T00:00:00Z",
        requestOptions)
        .then(res =>{
            return res.json();
        })
        .then(data =>{
            data.forEach(entry =>{
                recovered_list.push(entry.Cases);
            });
        });
        await fetch("https://api.covid19api.com/total/country/"+country+"/status/deaths",
        requestOptions)
        .then(res =>{
            return res.json();
        })
        .then(data =>{
            data.forEach(entry =>{
                deaths_list.push(entry.Cases);
            });
        });
        updateUI(country);
    }
    api_fetch(country);
}

function updateUI(country){
    updateStats(country);
    axesLinearChart();
}

function updateStats(country){
    const total_cases = cases_list.at(-1);
    const new_cases = total_cases - cases_list[cases_list.length - 2];
    const total_recovered = recovered_list.at(-1);
    const new_recovered = total_recovered - recovered_list[recovered_list.length-2];
    const total_deaths = deaths_list.at(-1);
    const new_deaths = total_deaths - deaths_list.at(-2);

    country_name_element.innerHTML = country;
    total_cases_element.innerHTML = total_cases;
    new_cases_element.innerHTML = `+${new_cases}`;
    recovered_element.innerHTML = total_recovered;
    new_recovered_element.innerHTML = `+${new_recovered}`;
    deaths_element.innerHTML = total_deaths;
    new_deaths_element.innerHTML = `+${new_deaths}`;

    formatedDates = [];
    dates.forEach(date =>{
        formatedDates.push(formatDate(date));
    });
}

function formatDate(date_string){
    months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    var date = new Date(date_string);
    return `${date.getDate()} ${months[date.getMonth()]}`;
}

var graph;
function axesLinearChart(){
    if(graph){
        graph.destroy();
    }

    graph = new Chart(ctx, {
        type: "line",
        data: {
          datasets: [
            {
              label: "Cases",
              data: cases_list,
              fill: false,
              borderColor: "#000",
              backgroundColor: "#FFF",
              borderWidth: 0.5,
            },
            {
              label: "Recovered",
              data: recovered_list,
              fill: false,
              borderColor: "#000",
              backgroundColor: "rgb(5, 126, 5)",
              borderWidth: 0.5,
            },
            {
              label: "Deaths",
              data: deaths_list,
              fill: false,
              borderColor: "000",
              backgroundColor: "rgb(163, 4, 4)",
              borderWidth: 0.5,
            },
          ],
          labels: formatedDates,
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
        }
    });
}
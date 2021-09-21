//Declaring search variables here to work with event listener below
var searchButton = $("#searchButton");
const searchParam = $("#searchParam");
var searchResults = $("#searchResults");
var clearResults = $("#clearSearch");
var recentSearch = $(".recentSearch");

//This will help store and retrieve from local
var storageKey = 0;

//This will get the current date and append it to the element with currentDay ID. 
var currentDay = moment();
const displayDate = moment(currentDay).format("dddd MMMM Do, YYYY");

//API key from https://openweathermap.org/
const apiKey = "51f15739d371e367d2088fc510f7336f";

//This is defined below. If the user returns to the page then they should see their previous search terms.
searchHistoryDisplay();

//This function will call the API and get the current weather results. Then it will post it to the page.
function currentWeatherResults(citySearch) {
    var currentWeatherURL = "https://api.openweathermap.org/data/2.5/weather?q=" + citySearch + "&units=imperial&appid=" + apiKey;

    fetch(currentWeatherURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (response) {
            //console.log(response);
            //Here we get the data back and store it.
            var cityNameResult = response.name;
            var cityTempResult = response.main.temp;
            var cityWindSpeedResult = response.wind.speed;
            var cityHumidityResults = response.main.humidity;
            var cityLatResult = response.coord.lat;
            var cityLonResult = response.coord.lon;

            //Here we are creating our DOM elements that will be added to the page.
            var currentConditionsEl = $(".currentConditions");
            currentConditionsEl.html("");
            var cityNameEl = document.createElement("p");
            var weatherIconEl = document.createElement("img");
            var cityTempEl = document.createElement("p");
            var cityWindSpeedEl = document.createElement("p");
            var cityHumidityEl = document.createElement("p");
            var cityUVEl = document.createElement("p");
            
            //Here we are adding data to our DOM elements.
            cityNameEl.textContent = cityNameResult + " (" + displayDate + ")";
            currentWeatherIcon(cityLatResult, cityLonResult, weatherIconEl);
            cityTempEl.textContent = "Temperature: " + cityTempResult + "°";
            cityWindSpeedEl.textContent = "Wind: " + cityWindSpeedResult + " MPH";
            cityHumidityEl.textContent = "Humidity: " + cityHumidityResults + "%";
            currentUVResults(cityLatResult, cityLonResult, cityUVEl);
            currentConditionsEl.append(cityNameEl);
            currentConditionsEl.append(weatherIconEl);
            currentConditionsEl.append(cityTempEl);
            currentConditionsEl.append(cityWindSpeedEl);
            currentConditionsEl.append(cityHumidityEl);
            currentConditionsEl.append(cityUVEl);

        });

}
//These two functions were made separate to handle the UVI and Weather Icons because they need a Lat/Long.
//Lat/Long was already returned from currentWeatherResults()
function currentUVResults(latt, long, element) {
    var currentUVURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latt + "&lon=" + long + "&appid=" + apiKey;
    return fetch(currentUVURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (response) {
            var cityUVIResult = response.current.uvi;
            element.textContent = "UV Index: " + cityUVIResult;
            if (cityUVIResult >= 8 ) {
                element.setAttribute("class", "badge badge-danger");
            }
            else if (8 > cityUVIResult >= 6) {
                element.setAttribute("class", "badge badge-warning");
            }
            else {
                element.setAttribute("class", "badge badge-success");
            }
        });
}

function currentWeatherIcon(latt, long, element) {
    var currentWeatherIconURL = "https://api.openweathermap.org/data/2.5/onecall?lat=" + latt + "&lon=" + long + "&appid=" + apiKey;
    fetch(currentWeatherIconURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (response) {

            var weatherIconCode = response.current.weather[0].icon;
            var imgURL = "https://openweathermap.org/img/wn/" + weatherIconCode + "@2x.png";
        });
}

function fiveDayResults(citySearch) {
    var fiveDayURL = "https://api.openweathermap.org/data/2.5/forecast?cnt=5&q=" + citySearch + "&units=imperial&appid=" + apiKey;

    fetch(fiveDayURL)
        .then(function (response) {
            return response.json();
        })
        .then(function (response) {
            var fiveDayForcast = $(".fiveDay");
            fiveDayForcast.html("");

            const today = new Date();
            const forecastDay = new Date();

            console.log(forecastDay);

            for (var i = 0; i < 5; i++) {

                forecastDay.setDate(today.getDate() + i);

                fiveDayForcast.append("<div class=dayResult>" +
                    "<p>" + forecastDay.toDateString() + "</p>" +
                    `<img src="https://openweathermap.org/img/wn/${response.list[i].weather[0].icon}@2x.png">` +
                    "<p>" + "Temp: " + response.list[i].main.temp + "°" + " </p>" +
                    "<p>" + "Wind : " + response.list[i].wind.speed + " MPH" + "</p>" +
                    "<p>" + "Humidity: " + response.list[i].main.humidity + "%" + "</p>") +
                    "<div>";
            }

        });
}

searchButton.click(function () {
    var citySearch = searchParam.val();
    fiveDayResults(citySearch);
    currentWeatherResults(citySearch);
    localStorage.setItem(storageKey, citySearch);
    //every new search will have a new storage key id
    storageKey = storageKey + 1;
    searchHistoryDisplay();
})

//This function will return all search results from local and append it to the div with the searchResults class.
function searchHistoryDisplay() {
    searchResults.html("");

    for (var i = localStorage.length - 1; i >= 0; i--) {
        var previousSearch = localStorage.getItem(i);
        searchResults.append("<li class=recentSearch>" + previousSearch + "</li>");
    }
    //I need this line because I want to properly add to my existing list.
    storageKey = localStorage.length;
}

// If the previous searches get too long they can now be cleared.
clearResults.click(function(){
    localStorage.clear();
    storageKey = 0;
    searchHistoryDisplay();
})

/*recentSearch.click(function () {
    var citySearch = recentSearch.val();
    fiveDayResults(citySearch);
    currentWeatherResults(citySearch);
    localStorage.setItem(storageKey, citySearch);
    //every new search will have a new storage key id
    storageKey = storageKey + 1;
    searchHistoryDisplay();
})*/
//empty city array to store cities previously searched for in local storage
let cities = [];

//global variables
let todaysHeader = $("#todaysHeader");

//function to add buttons for cities previously searched for
//function is called in init() and createCitiesArray(input) functions (lines 36 and 160)
function renderCityButtons() {
    let cityContainer = $(".list-group");

    //empties cityContainer so buttons don't get duplicated every time they're created
    cityContainer.empty();

    //creates a button for the last five cities searched for
    cities.forEach(function (city) {
        let cityButton = $("<button>");
        cityButton.text(city);
        cityButton.addClass("cityBtn btn btn-secondary btn-lg btn-block");
        cityButton.attr("type", "button");
        cityButton.attr("data-city", city);
        cityButton.css("border-radius", "5px");
        cityContainer.prepend(cityButton);
    });
};

//function to pull the last five cities searched for from local storage, when the page is opened or refreshed
//function is called at bottom of code (line 222)
function init() {
    let storedCities = JSON.parse(localStorage.getItem("Cities"));
    if (storedCities !== null) {
        cities = storedCities;
        
        //renders buttons for the last five cities searched for, when the page is opened or refreshed
        //function starts at line 9
        renderCityButtons();
    };
};

//function to store the last five cities searched for in local storage
//function is called in the createCitiesArray(input) function (line 157)
function storeCitiesArray() {
    localStorage.setItem("Cities", JSON.stringify(cities));
};

//function to render the name of the city searched for in the section with id="today", 
//city name is pulled from the geocoding api
//function is called in the buildQueryURL(input) function (line 178)
function renderCityName(geoResponse) {
    let cityName = geoResponse[0].name;
    let todaysDate = moment().format("(DD/MM/YYYY)");
    todaysHeader.text(cityName + " " + todaysDate);

};

//function to render today's weather to the section with id="today"
//function is called in the buildQueryURL(input) function (line 193)
function renderTodaysWeather(weatherResponse) {
    console.log(weatherResponse);

    let today = $("#today")
        .css("border", "2px solid black");

    let todaysIconID = weatherResponse.list[0].weather[0].icon;
    let iconURL = "https://openweathermap.org/img/wn/" + todaysIconID + "@2x.png";
    let todaysIcon = $("<img>")
        .attr("src", iconURL);
    todaysHeader.append(todaysIcon);

    let todaysTemp = $("#todaysTemp");
    todaysTemp.text("Temperature: " + parseInt(weatherResponse.list[0].main.temp) + "°C");

    let todaysWind = $("#todaysWind");
    let windSpeed = parseInt((weatherResponse.list[0].wind.speed) * 3.6);
    todaysWind.text("Wind Speed: " + windSpeed + " km/h");

    let todaysHumidity = $("#todaysHumidity");
    todaysHumidity.text("Humidity: " + weatherResponse.list[0].main.humidity + "%");

    //empties the input field once today's weather has been rendered
    cityInput = $("#search-input").val("");
};

//function to render the next five days' weather to the section with id="forecast"
//function is called in the buildQueryURL(input) function (line 196)
function renderForecast(weatherResponse) {
    console.log(weatherResponse);

    //empties the forecast section so only one city's weather displays at a time
    $("#forecastHeaderRow").empty();
    $("#forecastRow").empty();

    let forecastHeader = $("<h3>")
        .attr("id", "forecastHeader")
        .css("padding-left", "20px")
        .text("5 Day Forecast:")
    $("#forecastHeaderRow").append(forecastHeader);

    //creates an array containing the weather for just one timestamp for each of the next five days (24 hours apart)
    forecastArray = [weatherResponse.list[8], weatherResponse.list[16], weatherResponse.list[24], weatherResponse.list[32], weatherResponse.list[39]]
    console.log(forecastArray);

    //loops through the array to display a weather forecast card for each of the next five days
    forecastArray.forEach(function (forecast) {
        let dayCard = $("<div>")
            .addClass("card dayCard");

        let dayIconID = forecast.weather[0].icon;
        let dayIconURL = "https://openweathermap.org/img/wn/" + dayIconID + "@2x.png";
        let dayIcon = $("<img>")
            .addClass("card-img-top dayIcon")
            .attr("src", dayIconURL);

        let dayHeader = $("<h4>")
            .addClass("dayHeader");
        let date = moment(forecast.dt_txt, "YYYY-MM-DD hh:mm:ss").format("DD/MM/YY")
        dayHeader.text(date);


        let dayTemp = $("<p>")
            .addClass("card-text dayPTag")
            .attr("id", "dayTemp");
        let temp = parseInt(forecast.main.temp);
        dayTemp.text("Temp: " + temp + "°C");

        let dayWind = $("<p>")
            .addClass("card-text dayPTag")
            .attr("id", "dayWind");
        let wind = parseInt((forecast.wind.speed) * 3.6);
        dayWind.text("Wind: " + wind + " km/h");

        let dayHumidity = $("<p>")
            .addClass("card-text dayPTag")
            .attr("id", "dayHumidity");
        let humidity = forecast.main.humidity;
        dayHumidity.text("Humidity: " + humidity + "%");

        dayCard.append(dayIcon, dayHeader, dayTemp, dayWind, dayHumidity);

        $("#forecastRow").append(dayCard);
    });
};

//function to create an array of the last five cities searched for
//function called in the buildQueryURL(input) (line 181)
function createCitiesArray(input) {
    if (cities.includes(input)) {
        console.log("Already in search list");;
    } else {
        cities.push(input);
    }
    if (cities.length > 5) {
        cities.shift();
    };

    //stores last five cities searched for in local storage, function starts at line 42
    storeCitiesArray();

    //renders buttons for last five cities searched for, function starts at line 9
    renderCityButtons();
};

//function to get the api URL to pull the weather info
//first pulls longitude and latitude info from geocoding api to use in 5 day forecast api
//function called in both event listeners (lines 208 and 218)
function buildQueryURL(input) {
    let APIKey = "2befb069531c6856f267a412d5ad148c";

    lonLatURL = "https://api.openweathermap.org/geo/1.0/direct?q=" + input + "&appid=" + APIKey;
    console.log("lonLatURL: " + lonLatURL);

    $.ajax({
        url: lonLatURL,
        method: "GET"
    }).then(function (geoResponse) {

        //uses the city name from the geocoding api to render it to the page, function starts at line 49
        renderCityName(geoResponse);

        //pushes the city name from the geocoding api to the array that stores the last five cities searched for, function starts at line 146
        createCitiesArray(geoResponse[0].name)
        let lon = geoResponse[0].lon;
        let lat = geoResponse[0].lat;
        let queryURL = "https://api.openweathermap.org/data/2.5/forecast?lat=" + lat + "&lon=" + lon + "&units=metric&appid=" + APIKey;
        console.log(queryURL);

        $.ajax({
            url: queryURL,
            method: "GET"
        }).then(function (weatherResponse) {

            //uses weather info from the 5 day forecast api to render today's weather to the page, function starts at line 58
            renderTodaysWeather(weatherResponse);

            //uses weather info from the 5 day forecast api to render next five days' weather to the page, function starts at line 86
            renderForecast(weatherResponse);
        });
    });
};

//event listener for the search button
$("#search-button").on("click", function (event) {
    event.preventDefault();
    let cityInput = $("#search-input").val().trim().toUpperCase();
    console.log(cityInput);

    //builds the URL to call the forecast info from the Open Weather apis, function starts at line 166
    buildQueryURL(cityInput);
});

//event listener for each of the buttons for the last five cities searched for
$(".list-group").on("click", function (event) {
    let cityButton = $(event.target);
    let cityInput = cityButton.attr("data-city");
    console.log(cityInput);

    //builds the URL to call the forecast info from the Open Weather apis, function starts at line 166
    buildQueryURL(cityInput);
});

//pulls info from local storage when page is opened or refreshed, function starts on line 29
init();






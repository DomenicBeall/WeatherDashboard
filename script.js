var fiveDayForecastDiv = $("#forecast-cards");
const API_KEY = "be99c505fb2b5702ed4d54b0b89dda7b";

init();

function init() {
    $("#searchButton").click(searchCityWeather);
}

function searchCityWeather() {
    // Assign a variable to the selected city name
    var cityName = $("#cityInput").val();

    // Send an ajax request getting the weather information
    var url = "https://api.openweathermap.org/data/2.5/weather?q=" + cityName + "&appid=" + API_KEY;
    
    
    $.ajax(url).then(function(response) {
        var date = new Date(response.dt * 1000);
        var formattedDate = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();

        $("#cityNameDiv").text(response.name + " (" + formattedDate + ")");
        $("#temperatureDiv").text(response.main.temp + " °F");
        $("#humidityDiv").text(response.main.humidity + "%");
        $("#windSpeedDiv").text(response.wind.speed + " MPH");

        var uvUrl = "http://api.openweathermap.org/data/2.5/uvi?lat=" + response.coord.lat + "&lon=" + response.coord.lon + "&appid=" + API_KEY;

        $.ajax(uvUrl).then(function(response) {
            $("#uvIndexDiv").text(response.value);
        });
    });

    // Five day forecast
    var fiveDayUrl = "https://api.openweathermap.org/data/2.5/forecast?q=" + cityName + "&appid=" + API_KEY;

    $.ajax(fiveDayUrl).then(function(response) {
        var weatherList = response.list;

        for (let i = 0; i < 5; i++) {
            var index = (i * 8) + 4;

            var cardContainer = $("<div class=\"card d-inline-flex\" style=\"width: 15%; margin-right: 10px;\">");
            var cardBody = $("<div class=\"card-body\">");
            var cardDate = $("<h5 class=\"card-title\">" + weatherList[index].dt_txt.split(" ")[0] + "</h5>");
            var cardTemp = $("<p class=\"card-text\">" + weatherList[index].main.temp + " °F</p>");
            var cardHumidity = $("<p class=\"card-text\">" + weatherList[index].main.humidity + "%</p>");


            cardBody.append(cardDate);
            cardBody.append(cardTemp);
            cardBody.append(cardHumidity);

            cardContainer.append(cardBody);
            fiveDayForecastDiv.append(cardContainer);
        }
    });
}
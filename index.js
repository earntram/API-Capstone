'use strict';

const locationKey = 'c4314e461218a7';
const locationURL = 'https://us1.locationiq.com/v1/search.php';

const hikingKey = '200717559-f462eaf442e8833f5009c3606350b9e1';
const hikingURL = 'https://www.hikingproject.com/data/get-trails';

function displayResults(responseJson) {
  $('.results-list').empty();
  for (let i = 0; i < responseJson.trails.length; i++) {
    $('.results-list').append(`
    <li class="item-container">
      <img src="${responseJson.trails[i].imgSmallMed}">
      <div class="description-container">
        <h3><a href="${responseJson.trails[i].url}" target="_blank">${responseJson.trails[i].name}</a></h3>
        <p>${responseJson.trails[i].location}</p>
        <p>Length: ${responseJson.trails[i].length} miles</p>
        <p>Rating: ${responseJson.trails[i].stars}/5</p>
      </div>
    </li>
    `)
  };
  $('.results').removeClass('hidden');
}

function createHikingURL(lat, lon) {
  return `${hikingURL}?lat=${lat}&lon=${lon}&maxResults=30&maxDistance=25&key=${hikingKey}`;
}

function useCoordinates(responseJson) {
  if (responseJson.length > 0) {
    const lat = responseJson[0].lat;
    const lon = responseJson[0].lon;
    const fullHikingURL = createHikingURL(lat, lon);

    fetch(fullHikingURL)
      .then(response => {
        if (response.ok) {
          return response.json();
        }
        throw new Error(response.statusText);
      })
      .then(responseJson => displayResults(responseJson))
      .catch(err => {
        $('.js-error-message').removeClass('hidden').text(`Sorry! We couldn't find any trails matching your request! `);
      });
  }
}

function getCoordinates(queryPostalcode) {
  const locationParams = {
    key: locationKey,
    postalcode: queryPostalcode,
    countrycodes: "us",
    format: "json",
    limit: 1,
  }

  const locationString = formatLocationParams(locationParams);
  const fullLocationURL = locationURL + '?' + locationString;

  fetch(fullLocationURL)
    .then(response => {
      if (response.ok) {
        return response.json();
      }
      throw new Error(response.statusText);
    })
    .then(responseJson => useCoordinates(responseJson))
    .catch(err => {
      $('.js-error-message').removeClass('hidden').text(`Sorry! We couldn't find any trails matching your request!`);
    });
}

function formatLocationParams(locationParams) {
  const queryItems = Object.keys(locationParams)
    .map(key => `${encodeURIComponent(key)}=${encodeURIComponent(locationParams[key])}`)
  return queryItems.join('&');
}

function watchForm() {
  $('form').submit(function (event) {
    event.preventDefault();
    $('.results').addClass('hidden');
    $('.js-error-message').addClass('hidden');
    const inputPostalcode = $('.postalcode').val();
    getCoordinates(inputPostalcode);
  });
}

function ready(fn) {
  if (document.readyState != 'loading') {
    fn();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', fn);
  } else {
    document.attachEvent('onreadystatechange', function() {
      if (document.readyState != 'loading')
        fn();
    });
  }
}

$(function () {
  console.log('App loaded');
  watchForm();
});

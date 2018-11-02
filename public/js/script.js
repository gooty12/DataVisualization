
function initMap() {
    d3.csv("data/dictionary.csv").then(countries => {
        let geocoder = new google.maps.Geocoder;

        for(let i = 0; i < countries.length; i++) {
            geocoder.geocode({'address': countries[i]['Country']}, function(results, status) {
                if (status === 'OK') {
                    countries[i]['location'] = results
                    countries[i]['lat'] = results[0].geometry.location.lat()
                    countries[i]['long'] = results[0].geometry.location.lng()
                    console.log(countries[i])


                } else {
                   // alert('Geocode was not successful for the following reason: ' + status);
                }
            });
        }
    });


}


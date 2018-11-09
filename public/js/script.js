
function init() {
    initMap();
}


function initMap() {
    let olympicsData = {}
    let countryData = {}

    d3.csv("data/dictionary.csv").then(countries => {
        let geocoder = new google.maps.Geocoder;
        countryData = countries
        console.log(countryData)

        d3.csv("data/pop.csv").then(data => {
            //console.log(data)
            let discrepentList = [];

            for(let i = 0; i < countryData.length; i++) {
                let discrepent = true;
                for(let j = 0; j < data.length; j++) {
                    if((countryData[i]['Country'].toLowerCase() === data[j]['country'].toLowerCase()) || (countryData[i]['Code'].toLowerCase() === data[j]['geo'].toLowerCase())) {
                        discrepent = false;
                        countryData[i]['mapId'] = data[j]['geo'];
                        break;
                    }
                }
                if(discrepent) {
                    countryData[i]['mapId'] = 'NA';
                    discrepentList.push(countryData[i])
                }

            }

            console.log(countryData)
            console.log(discrepentList)
        });



        /*for(let i = 0; i < countries.length; i++) {
            geocoder.geocode({'address': countries[i]['Country']}, function(results, status) {
                if (status === 'OK') {
                    countries[i]['location'] = results
                    countries[i]['lat'] = results[0].geometry.location.lat()
                    countries[i]['long'] = results[0].geometry.location.lng()
                    //console.log(countries[i])
                } else {
                   // alert('Geocode was not successful for the following reason: ' + status);
                }
            });



        }*/


        d3.csv("data/summer.csv").then(data => {
            olympicsData = data
           // console.log(data)
            let yearAggregate = aggregate(olympicsData, "Year", 'Country')
            //console.log(yearAggregate)
            let countryAggregate = aggregate(olympicsData, 'Year', 'Country')
            //console.log(countryAggregate)
            let sportAggregate = aggregate(olympicsData, 'Sport', 'Athlete')
            //console.log(sportAggregate)

        });









        // Country wise aggregation




    });

    function aggregate(data, param, groupParam) {
       let aggregatedData = {}
       for(let i = 0; i < data.length; i++) {
           let paramValue = data[i][param]
           let groupParamValue  = groupParam ? data[i][groupParam] : ""


           if((!aggregatedData.hasOwnProperty(paramValue))) {
               aggregatedData[paramValue] = {}
               if(!groupParam) {
                   aggregatedData[paramValue]['medals'] = {}
                   aggregatedData[paramValue]['medals']['gold'] = 0;
                   aggregatedData[paramValue]['medals']['silver'] = 0;
                   aggregatedData[paramValue]['medals']['bronze'] = 0;
               }
               else {
                   if(!aggregatedData[paramValue].hasOwnProperty(groupParamValue)) {
                       aggregatedData[paramValue][groupParamValue] = {}
                   }

                   aggregatedData[paramValue][groupParamValue]['medals'] = {}
                   aggregatedData[paramValue][groupParamValue]['medals']['gold'] = 0;
                   aggregatedData[paramValue][groupParamValue]['medals']['silver'] = 0;
                   aggregatedData[paramValue][groupParamValue]['medals']['bronze'] = 0;
               }
           }

           if(groupParamValue && !aggregatedData[paramValue].hasOwnProperty(groupParamValue)) {
               aggregatedData[paramValue][groupParamValue] = {}
               aggregatedData[paramValue][groupParamValue]['medals'] = {}
               aggregatedData[paramValue][groupParamValue]['medals']['gold'] = 0;
               aggregatedData[paramValue][groupParamValue]['medals']['silver'] = 0;
               aggregatedData[paramValue][groupParamValue]['medals']['bronze'] = 0;
           }


           if(data[i]['Medal'] === 'Gold') {
               if(!groupParamValue) {
                   aggregatedData[paramValue]['medals']['gold']++
               }
               else{
                   aggregatedData[paramValue][groupParamValue]['medals']['gold']++
               }
           }
           else if(data[i]['Medal'] === 'Silver') {
               if(!groupParamValue) {
                   aggregatedData[paramValue]['medals']['silver']++
               }
               else{
                   aggregatedData[paramValue][groupParamValue]['medals']['silver']++
               }
           }
           else if(data[i]['Medal'] === 'Bronze') {
               if(!groupParamValue) {
                   aggregatedData[paramValue]['medals']['bronze']++
               }
               else{
                   aggregatedData[paramValue][groupParamValue]['medals']['bronze']++
               }
           }
       }
       return aggregatedData;
    }





}


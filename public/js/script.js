loadData().then(data => {

    this.activeCountry = null;
    this.activeYear = '2012';
    let self = this;
    let olympicsData = data['olympicsData'];
    let countryData = data['countryData'];
    let pop = data['pop'];

    let mappings =  getMappings(countryData, pop)





    //// Creates the view objects
    //const worldMap = new Map(data, updateCountry);

    d3.json('data/world.json').then(mapData => {
        console.log(mapData)
        let yearAggregate = aggregate(olympicsData, "Year", "Country")
        console.log(yearAggregate)

         //console.log(reverseMappings)
       let map = new WorldMap(yearAggregate, mappings)


       map.drawMap(mapData);

    });







});

function getMappings(countryData, data) {
    let mappings = {}
    let self = this;
        let countryIdMap = {};
        let countryNameMap = {};
        let reverseCountryIdMap = {};
        let reverserCountryNameMap = {};
        let countryIdToName = {};
        for (let i = 0; i < countryData.length; i++) {

            let discrepent = true;
            countryIdToName[countryData[i]['Code']] = countryData[i]['Country']

            for (let j = 0; j < data.length; j++) {
                if ((countryData[i]['Code'] === data[j]['geo'].toUpperCase())) {
                    countryIdMap[countryData[i]['Code']] = data[j]['geo'].toUpperCase();
                    reverseCountryIdMap[data[j]['geo'].toUpperCase()] = countryData[i]['Code'];
                    discrepent = false;
                    break;
                }
                else if ((countryData[i]['Country'].toUpperCase() === data[j]['country'].toUpperCase())) {
                    countryNameMap[countryData[i]['Country']] = data[j]['geo'].toUpperCase()
                    reverserCountryNameMap[data[j]['geo'].toUpperCase()] = countryData[i]['Country'];
                    discrepent = false;
                }
            }

        }
        let val = {
            countryIdMap : countryIdMap,
            countryNameMap: countryNameMap,
            reverseCountryIdMap: reverseCountryIdMap,
            reverserCountryNameMap: reverserCountryNameMap,
            countryIdToName: countryIdToName

        }
        self.mappings = Object.assign({}, val)
    return self.mappings;
}



/*
function init() {
    initMap();
}

function initMap() {
    let countryData = loadFile()
    console.log(olympicsData)
    let yearAggregate = {}
    let self = this






    d3.csv().then(countries => {

        d3.csv().then(data => {
          //  console.log(data)
            olympicsData = data
            countryData = countries
            yearAggregate = aggregate(olympicsData, "Year", 'Country')
            d3.json('data/world.json').then(mapData => {

                setMapIds(countryData, olympicsData)
                //console.log(olympicsData)
                let reverseMappings = {};
                for(let i = 0; i < olympicsData.length; i++) {
                    reverseMappings[olympicsData[i]['mapId']] = olympicsData[i]['Country']
                }
             //  console.log(reverseMappings)
                let map = new Map(yearAggregate, reverseMappings)


                map.drawMap(mapData, "2012");


            });


        });


    });*/










async function loadFile(file) {
    let data = await d3.csv(file).then(d => {
        let mapped = d.map(g => {
            for (let key in g) {
                let numKey = +key;
                if (numKey) {
                    g[key] = +g[key];
                }
            }
            return g;
        });
        return mapped;
    });
    return data;
}

async function loadData() {
    let countryData = await loadFile("data/dictionary.csv");
    let olympicsData = await loadFile("data/summer.csv");
    let pop = await loadFile('data/pop.csv');

    //return [pop, gdp, tfr, cmu, life];
    return {
        'olympicsData': olympicsData,
        'countryData': countryData,
        'pop': pop,

    };
}

function aggregate(data, param, groupParam) {
    let aggregatedData = {}
    for(let i = 0; i < data.length; i++) {
        let paramValue = data[i][param]
        let groupParamValue  = groupParam ? data[i][groupParam] : ""
        if(!groupParamValue) {
            continue;
        }


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
                if(!aggregatedData[paramValue]['medals']) {
                    let x = 0;
                }
                aggregatedData[paramValue]['medals']['gold']++
            }
            else{
                if(!aggregatedData[paramValue]) {
                    let x = 0;
                }
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




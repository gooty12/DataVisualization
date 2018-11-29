loadData().then(data => {
    let self = this;
    let olympicsData = data['olympicsData'];
    let hostList = olympicsData.filter(d => d['Host'])
    let hostObj = {}
    for(let i = 0; i < hostList.length; i++) {
        hostObj[hostList[i]['Year']] = hostList[i]['Host'];
    }
    let countryData = data['countryData'];
    let pop = data['pop'];

    let mappings =  getMappings(countryData, pop)
    d3.json('data/world.json').then(mapData => {
        let yearAggregate = aggregate(olympicsData, "Year", "Country");
        let countryAggregate = aggregate(olympicsData, 'Country', 'Year')
        console.log(countryAggregate)

        let map = new WorldMap(yearAggregate, countryAggregate, mappings, '2012');
        map.drawMap(mapData);
        let sportAggregate = aggregate(olympicsData, "Sport", "Year")
        let aggregateViews = new AggregateViews(yearAggregate, countryAggregate, sportAggregate)
        aggregateViews.drawHeatMap()
        let hostChart = new HostChart(countryAggregate, hostObj, mappings);


    });
});

function getMappings(countryData, data) {
    let mappings = {}
    let self = this;
        let countryIdMap = {};
        let countryNameMap = {};
        let reverseCountryIdMap = {};
        let countryIdToName = {};
        let regionMap = {}
        for (let i = 0; i < countryData.length; i++) {

            let discrepent = true;
            countryIdToName[countryData[i]['Code']] = countryData[i]['Country']

            for (let j = 0; j < data.length; j++) {
                if ((countryData[i]['Code'] === data[j]['geo'].toUpperCase())) {
                    countryIdMap[countryData[i]['Code']] = data[j]['geo'].toUpperCase();
                    reverseCountryIdMap[data[j]['geo'].toUpperCase()] = countryData[i]['Code'];
                    regionMap[countryData[i]['Code']]  = data[j]['region']
                    discrepent = false;
                    break;
                }
                else if ((countryData[i]['Country'].toUpperCase() === data[j]['country'].toUpperCase())) {
                    countryNameMap[countryData[i]['Country']] = data[j]['geo'].toUpperCase()
                    reverseCountryIdMap[data[j]['geo'].toUpperCase()] = countryData[i]['Code'];
                    regionMap[countryData[i]['Code']]  = data[j]['region']
                    discrepent = false;
                }
            }

        }
        return {
            countryIdMap : countryIdMap,
            countryNameMap: countryNameMap,
            reverseCountryIdMap: reverseCountryIdMap,
            countryIdToName: countryIdToName,
            regionMap: regionMap

        }
    }

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

    return {
        'olympicsData': olympicsData,
        'countryData': countryData,
        'pop': pop,
    };
}

function aggregate(data, param, groupParam) {
    let aggregatedData = {}
    let hostList = {}
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
                aggregatedData[paramValue]['medals']['total'] = 0;

            }
            else {
                if(!aggregatedData[paramValue].hasOwnProperty(groupParamValue)) {
                    aggregatedData[paramValue][groupParamValue] = {}
                }

                aggregatedData[paramValue][groupParamValue]['medals'] = {}
                aggregatedData[paramValue][groupParamValue]['medals']['gold'] = 0;
                aggregatedData[paramValue][groupParamValue]['medals']['silver'] = 0;
                aggregatedData[paramValue][groupParamValue]['medals']['bronze'] = 0;
                aggregatedData[paramValue][groupParamValue]['medals']['total'] = 0;

            }
        }
        if(groupParamValue && !aggregatedData[paramValue].hasOwnProperty(groupParamValue)) {
            aggregatedData[paramValue][groupParamValue] = {}
            aggregatedData[paramValue][groupParamValue]['medals'] = {}
            aggregatedData[paramValue][groupParamValue]['medals']['gold'] = 0;
            aggregatedData[paramValue][groupParamValue]['medals']['silver'] = 0;
            aggregatedData[paramValue][groupParamValue]['medals']['bronze'] = 0;
            aggregatedData[paramValue][groupParamValue]['medals']['total'] = 0;

        }
        if(data[i]['Medal'] === 'Gold') {
            if(!groupParamValue) {

                aggregatedData[paramValue]['medals']['gold']++
                aggregatedData[paramValue]['medals']['total']++

            }
            else{
                aggregatedData[paramValue][groupParamValue]['medals']['gold']++
                aggregatedData[paramValue][groupParamValue]['medals']['total']++

            }
        }
        else if(data[i]['Medal'] === 'Silver') {
            if(!groupParamValue) {
                aggregatedData[paramValue]['medals']['silver']++
                aggregatedData[paramValue]['medals']['total']++

            }
            else{
                aggregatedData[paramValue][groupParamValue]['medals']['silver']++
                aggregatedData[paramValue][groupParamValue]['medals']['total']++

            }
        }
        else if(data[i]['Medal'] === 'Bronze') {
            if(!groupParamValue) {
                aggregatedData[paramValue]['medals']['bronze']++
                aggregatedData[paramValue]['medals']['total']++
            }
            else{
                aggregatedData[paramValue][groupParamValue]['medals']['bronze']++
                aggregatedData[paramValue][groupParamValue]['medals']['total']++

            }
        }

        //Year,City,Sport,Discipline,Athlete,Country,Gender,Event,Medal
        if(groupParamValue) {
            aggregatedData[paramValue][groupParamValue]['City'] = data[i]['City']
            aggregatedData[paramValue][groupParamValue]['Sport'] = data[i]['Sport']
            aggregatedData[paramValue][groupParamValue]['Discipline'] = data[i]['Discipline']
            aggregatedData[paramValue][groupParamValue]['Athlete'] = data[i]['Athlete']
            aggregatedData[paramValue][groupParamValue]['Gender'] = data[i]['Gender']
            aggregatedData[paramValue][groupParamValue]['Event'] = data[i]['Event']
            if(data[i]['Gender'] == 'Men') {
                if(!aggregatedData[paramValue][groupParamValue]['Males']) {
                    aggregatedData[paramValue][groupParamValue]['Males'] = 1
                }
                else {
                    aggregatedData[paramValue][groupParamValue]['Males']++;
                }
            }

            else{
                if(!aggregatedData[paramValue][groupParamValue]['Females']) {
                    aggregatedData[paramValue][groupParamValue]['Females'] = 1
                }
                else {
                    aggregatedData[paramValue][groupParamValue]['Females']++;
                }
            }
        }
        else {
            aggregatedData[paramValue]['City'] = data[i]['City']
            aggregatedData[paramValue]['Sport'] = data[i]['Sport']
            aggregatedData[paramValue]['Discipline'] = data[i]['Discipline']
            aggregatedData[paramValue]['Athlete'] = data[i]['Athlete']
            aggregatedData[paramValue]['Gender'] = data[i]['Gender']
            aggregatedData[paramValue]['Event'] = data[i]['Event']
        }
    }
    return aggregatedData;
}




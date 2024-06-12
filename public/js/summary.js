// Função para obter os concelhos visitados do usuário
async function getUserVisitedCities() {
    const token = localStorage.getItem('token');
    const response = await fetch('/api/strava/visited-cities', {
        headers: {
            'x-auth-token': token
        }
    });
    const data = await response.json();
    console.log('Cidades visitadas:', data.myCity);
    return data.myCity;
}

// Função para inicializar o mapa
async function initializeMap() {
    const visitedCities = await getUserVisitedCities();
    
    d3.json('/ContinenteConcelhos.json').then(function(geojson) {
        const width = 960, height = 600;
        const svg = d3.select("#map").append("svg")
            .attr("width", width)
            .attr("height", height);
        
        const projection = d3.geoMercator().fitSize([width, height], geojson);
        const path = d3.geoPath().projection(projection);

        svg.selectAll("path")
            .data(geojson.features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", d => visitedCities.includes(d.properties.NAME_2) ? "visited" : "not-visited")
            .attr("fill", d => visitedCities.includes(d.properties.NAME_2) ? "green" : "#ccc")
            .attr("stroke", "#333")
            .attr("stroke-width", 0.5);
    }).catch(error => {
        console.error('Erro ao carregar o GeoJSON:', error);
    });
}

initializeMap();

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
    const normalizedVisitedCities = visitedCities.map(city => city.toLowerCase());
    
    d3.json('/ContinenteConcelhos.json').then(function(geojson) {
        const width = 960, height = 600;
        const svg = d3.select("#map").append("svg")
            .attr("width", width)
            .attr("height", height);
        
        const projection = d3.geoMercator().fitSize([width, height], geojson);
        const path = d3.geoPath().projection(projection);

        // Adiciona a tooltip
        const tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("position", "absolute")
            .style("visibility", "hidden")
            .style("background", "rgba(0, 0, 0, 0.8)")
            .style("color", "#fff")
            .style("padding", "5px 10px")
            .style("border-radius", "4px")
            .style("font-size", "12px");

        svg.selectAll("path")
            .data(geojson.features)
            .enter().append("path")
            .attr("d", path)
            .attr("class", d => normalizedVisitedCities.includes(d.properties.Concelho.toLowerCase()) ? "visited" : "not-visited")
            .attr("fill", d => normalizedVisitedCities.includes(d.properties.Concelho.toLowerCase()) ? "green" : "#ccc")
            .attr("stroke", "#333")
            .attr("stroke-width", 0.5)
            .on("mouseover", function(event, d) {
                tooltip.text(d.properties.Concelho)
                    .style("visibility", "visible");
            })
            .on("mousemove", function(event) {
                tooltip.style("top", (event.pageY - 10) + "px")
                    .style("left", (event.pageX + 10) + "px");
            })
            .on("mouseout", function() {
                tooltip.style("visibility", "hidden");
            });
    }).catch(error => {
        console.error('Erro ao carregar o GeoJSON:', error);
    });
}

initializeMap();

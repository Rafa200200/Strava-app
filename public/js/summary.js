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

        const g = svg.append("g");

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

        g.selectAll("path")
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

        // Configurações de zoom
        const zoom = d3.zoom()
            .scaleExtent([1, 8])
            .on("zoom", (event) => {
                g.attr("transform", event.transform);
            });

        svg.call(zoom);

        // Função de zoom
        function zoomIn() {
            svg.transition().call(zoom.scaleBy, 1.3);
        }

        function zoomOut() {
            svg.transition().call(zoom.scaleBy, 1 / 1.3);
        }

        // Eventos de clique nos botões de zoom
        d3.select("#zoom-in").on("click", zoomIn);
        d3.select("#zoom-out").on("click", zoomOut);

    }).catch(error => {
        console.error('Erro ao carregar o GeoJSON:', error);
    });
}

initializeMap();

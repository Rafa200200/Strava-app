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
        const width = 700, height = 650;
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

        // Atualiza as estatísticas
        updateStats(visitedCities, geojson);

    }).catch(error => {
        console.error('Erro ao carregar o GeoJSON:', error);
    });
}

// Função para atualizar as estatísticas
function updateStats(visitedCities, geojson) {
    const totalConcelhos = geojson.features.length;
    const visitedConcelhos = visitedCities.length;
    const visitedConcelhosSet = new Set(visitedCities.map(city => city.toLowerCase()));
    const concelhosVisitados = [];
    const concelhosFaltantes = [];

    // Calcula concelhos visitados e faltantes
    geojson.features.forEach(feature => {
        const concelho = feature.properties.Concelho;
        if (visitedConcelhosSet.has(concelho.toLowerCase())) {
            concelhosVisitados.push(concelho);
        } else {
            concelhosFaltantes.push(concelho);
        }
    });

    const visitedPercent = (visitedConcelhos / totalConcelhos * 100).toFixed(2);

    // Exibe porcentagem de concelhos visitados
    document.getElementById('concelhos-percent').textContent = `Percentagem de Concelhos Visitados: ${visitedPercent}%`;

    // Exibe listas de concelhos visitados e faltantes
    displayList('concelhos-visitados', concelhosVisitados);
    displayList('concelhos-faltantes', concelhosFaltantes);

    // Calcula e exibe porcentagem de distritos completos
    const distritoConcelhos = geojson.features.reduce((acc, feature) => {
        const distrito = feature.properties.Distrito;
        if (!acc[distrito]) {
            acc[distrito] = [];
        }
        acc[distrito].push(feature.properties.Concelho);
        return acc;
    }, {});

    const distritosCompletos = [];
    const distritosFaltantes = [];
    let completeDistricts = 0;

    for (const [distrito, concelhos] of Object.entries(distritoConcelhos)) {
        const totalConcelhosDistrito = concelhos.length;
        const visitedConcelhosDistrito = concelhos.filter(concelho => visitedConcelhosSet.has(concelho.toLowerCase())).length;
        if (visitedConcelhosDistrito === totalConcelhosDistrito) {
            distritosCompletos.push(distrito);
            completeDistricts++;
        } else {
            distritosFaltantes.push(distrito);
        }
    }

    const completeDistrictsPercent = (completeDistricts / Object.keys(distritoConcelhos).length * 100).toFixed(2);
    document.getElementById('distritos-percent').textContent = `Percentagem de Distritos Completos: ${completeDistrictsPercent}%`;

    // Exibe listas de distritos completos e faltantes
    displayList('distritos-completos', distritosCompletos);
    displayList('distritos-faltantes', distritosFaltantes);
}

// Função para exibir listas de concelhos e distritos
function displayList(elementId, items) {
    const ul = document.getElementById(elementId);
    ul.innerHTML = '';
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        ul.appendChild(li);
    });
}

initializeMap();

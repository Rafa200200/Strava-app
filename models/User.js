const mongoose = require('mongoose');

// Define o esquema do usuário
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    strava: {
        accessToken: String,
        refreshToken: String,
        athleteId: Number
    },
    activities: { type: mongoose.Schema.Types.Mixed },
    distritosConcelhos: {
        type: Array,
        default: [
            { distrito: "Aveiro", concelhos: ["Águeda", "Albergaria-a-Velha", "Anadia", "Arouca", "Aveiro", "Espinho", "Estarreja", "Ílhavo", "Mealhada", "Murtosa", "Oliveira de Azeméis", "Oliveira do Bairro", "Ovar", "Santa Maria da Feira", "São João da Madeira", "Sever do Vouga", "Vagos", "Vale de Cambra"] },
            { distrito: "Beja", concelhos: ["Aljustrel", "Almodôvar", "Alvito", "Barrancos", "Beja", "Castro Verde", "Cuba", "Ferreira do Alentejo", "Mértola", "Moura", "Odemira", "Ourique", "Serpa", "Vidigueira"] },
            { distrito: "Braga", concelhos: ["Amares", "Barcelos", "Braga", "Cabeceiras de Basto", "Celorico de Basto", "Esposende", "Fafe", "Guimarães", "Póvoa de Lanhoso", "Terras de Bouro", "Vieira do Minho", "Vila Nova de Famalicão", "Vila Verde", "Vizela"] },
            { distrito: "Bragança", concelhos: ["Alfândega da Fé", "Bragança", "Carrazeda de Ansiães", "Freixo de Espada à Cinta", "Macedo de Cavaleiros", "Miranda do Douro", "Mirandela", "Mogadouro", "Torre de Moncorvo", "Vila Flor", "Vimioso", "Vinhais"] },
            { distrito: "Castelo Branco", concelhos: ["Belmonte", "Castelo Branco", "Covilhã", "Fundão", "Idanha-a-Nova", "Oleiros", "Penamacor", "Proença-a-Nova", "Sertã", "Vila de Rei", "Vila Velha de Ródão"] },
            { distrito: "Coimbra", concelhos: ["Arganil", "Cantanhede", "Coimbra", "Condeixa-a-Nova", "Figueira da Foz", "Góis", "Lousã", "Mira", "Miranda do Corvo", "Montemor-o-Velho", "Oliveira do Hospital", "Pampilhosa da Serra", "Penacova", "Penela", "Soure", "Tábua", "Vila Nova de Poiares"] },
            { distrito: "Évora", concelhos: ["Alandroal", "Arraiolos", "Borba", "Estremoz", "Évora", "Montemor-o-Novo", "Mora", "Mourão", "Portel", "Redondo", "Reguengos de Monsaraz", "Vendas Novas", "Viana do Alentejo", "Vila Viçosa"] },
            { distrito: "Faro", concelhos: ["Albufeira", "Alcoutim", "Aljezur", "Castro Marim", "Faro", "Lagoa", "Lagos", "Loulé", "Monchique", "Olhão", "Portimão", "São Brás de Alportel", "Silves", "Tavira", "Vila do Bispo", "Vila Real de Santo António"] },
            { distrito: "Guarda", concelhos: ["Aguiar da Beira", "Almeida", "Celorico da Beira", "Figueira de Castelo Rodrigo", "Fornos de Algodres", "Gouveia", "Guarda", "Manteigas", "Mêda", "Pinhel", "Sabugal", "Seia", "Trancoso", "Vila Nova de Foz Côa"] },
            { distrito: "Leiria", concelhos: ["Alcobaça", "Alvaiázere", "Ansião", "Batalha", "Bombarral", "Caldas da Rainha", "Castanheira de Pera", "Figueiró dos Vinhos", "Leiria", "Marinha Grande", "Nazaré", "Óbidos", "Pedrógão Grande", "Peniche", "Pombal", "Porto de Mós"] },
            { distrito: "Lisboa", concelhos: ["Alenquer", "Amadora", "Arruda dos Vinhos", "Azambuja", "Cadaval", "Cascais", "Lisboa", "Loures", "Lourinhã", "Mafra", "Oeiras", "Sintra", "Sobral de Monte Agraço", "Torres Vedras", "Vila Franca de Xira"] },
            { distrito: "Portalegre", concelhos: ["Alter do Chão", "Arronches", "Avis", "Campo Maior", "Castelo de Vide", "Crato", "Elvas", "Fronteira", "Gavião", "Marvão", "Monforte", "Nisa", "Ponte de Sor", "Portalegre", "Sousel"] },
            { distrito: "Porto", concelhos: ["Amarante", "Baião", "Felgueiras", "Gondomar", "Lousada", "Maia", "Marco de Canaveses", "Matosinhos", "Paços de Ferreira", "Paredes", "Penafiel", "Porto", "Póvoa de Varzim", "Santo Tirso", "Trofa", "Valongo", "Vila do Conde", "Vila Nova de Gaia"] },
            { distrito: "Santarém", concelhos: ["Abrantes", "Alcanena", "Almeirim", "Alpiarça", "Benavente", "Cartaxo", "Chamusca", "Constância", "Coruche", "Entroncamento", "Ferreira do Zêzere", "Golegã", "Mação", "Ourém", "Rio Maior", "Salvaterra de Magos", "Santarém", "Sardoal", "Tomar", "Torres Novas", "Vila Nova da Barquinha"] },
            { distrito: "Setúbal", concelhos: ["Alcácer do Sal", "Alcochete", "Almada", "Barreiro", "Grândola", "Moita", "Montijo", "Palmela", "Santiago do Cacém", "Seixal", "Sesimbra", "Setúbal", "Sines"] },
            { distrito: "Viana do Castelo", concelhos: ["Arcos de Valdevez", "Caminha", "Melgaço", "Monção", "Paredes de Coura", "Ponte da Barca", "Ponte de Lima", "Valença", "Viana do Castelo", "Vila Nova de Cerveira"] },
            { distrito: "Vila Real", concelhos: ["Alijó", "Boticas", "Chaves", "Mesão Frio", "Mondim de Basto", "Montalegre", "Murça", "Peso da Régua", "Ribeira de Pena", "Sabrosa", "Santa Marta de Penaguião", "Valpaços", "Vila Pouca de Aguiar", "Vila Real"] },
            { distrito: "Viseu", concelhos: ["Armamar", "Carregal do Sal", "Castro Daire", "Cinfães", "Lamego", "Mangualde", "Moimenta da Beira", "Mortágua", "Nelas", "Oliveira de Frades", "Penalva do Castelo", "Penedono", "Resende", "Santa Comba Dão", "São João da Pesqueira", "São Pedro do Sul", "Sátão", "Sernancelhe", "Tabuaço", "Tarouca", "Tondela", "Vila Nova de Paiva", "Viseu", "Vouzela"] },
        ]
    },
    myCity: { type: [String], default: [] }
});

// Exporta o modelo User, baseado no esquema UserSchema
module.exports = mongoose.model('User', UserSchema);

// Adiciona um ouvinte de evento ao botão com id 'strava-button'
document.getElementById('strava-button').addEventListener('click', async () => {
    // Obtém o token armazenado no localStorage
    const token = localStorage.getItem('token');
    // Se não houver token, alerta o usuário para fazer login primeiro
    if (!token) return alert('Você precisa fazer login primeiro.');

    // Exibe a mensagem de início do script
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = "Script iniciado, pode demorar algum tempo, aguarde por favor";

    // Redireciona o usuário para a URL de conexão com o Strava, incluindo o token na query string
    window.location.href = `/api/strava/connect?token=${token}`;
});

// Função para verificar se o usuário está conectado ao Strava
async function isConnectedToStrava() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const response = await fetch('/api/strava/activities/data', {
        headers: {
            'x-auth-token': token  // Inclui o token no cabeçalho da requisição
        }
    });

    return response.ok;
}

// Função para carregar atividades e salvar GPX após autenticação
async function loadActivities() {
    // Obtém o token armazenado no localStorage
    const token = localStorage.getItem('token');
    // Se não houver token, alerta o usuário para fazer login primeiro
    if (!token) return alert('Você precisa fazer login primeiro.');

    // Verifica se o usuário está conectado ao Strava
    const isConnected = await isConnectedToStrava();
    if (!isConnected) return alert('Você precisa se conectar ao Strava primeiro.');

    // Exibe a mensagem de início do script
    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = "Script iniciado, pode demorar algum tempo, aguarde por favor";

    try {
        // Faz uma requisição para obter as atividades do Strava
        const response = await fetch('/api/strava/activities', {
            headers: {
                'x-auth-token': token  // Inclui o token no cabeçalho da requisição
            }
        });

        // Se a resposta for bem-sucedida, exibe uma mensagem com os dados
        if (response.ok) {
            const data = await response.json();
            alert(data.message);
        } else {
            // Se houver um erro, exibe uma mensagem de erro
            const errorData = await response.json();
            console.error('Erro ao carregar atividades:', errorData);
            alert(errorData.message);
        }
    } catch (error) {
        console.error('Erro ao carregar atividades:', error);
        alert('Erro ao carregar atividades.');
    } finally {
        // Exibe a mensagem de finalização do script
        statusMessage.textContent = "Script finalizado";
    }
}

// Adiciona um ouvinte de evento ao botão de logout
document.getElementById('logout-button').addEventListener('click', () => {
    // Remove o token do localStorage
    localStorage.removeItem('token');
    // Redireciona para a página index.html
    window.location.href = 'index.html';
});

// Chama a função para carregar atividades ao carregar a página do dashboard, se conectado ao Strava
window.onload = async () => {
    const isConnected = await isConnectedToStrava();
    if (isConnected) {
        loadActivities();
    }
};

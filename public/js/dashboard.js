// Função para verificar se o usuário está conectado ao Strava
async function isConnectedToStrava() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    try {
        const response = await fetch('/api/strava/activities/data', {
            headers: {
                'x-auth-token': token
            }
        });

        if (!response.ok) {
            return false;
        }

        const data = await response.json();
        // Verifique se o retorno de dados faz sentido para um usuário conectado ao Strava
        return Array.isArray(data);
    } catch (error) {
        console.error('Erro ao verificar conexão ao Strava:', error);
        return false;
    }
}

// Função para carregar novas atividades
async function loadNewActivities() {
    const token = localStorage.getItem('token');
    if (!token) return alert('Você precisa fazer login primeiro.');

    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = "Verificando novas atividades, pode demorar algum tempo, aguarde por favor";

    try {
        const response = await fetch('/api/strava/activities', {
            headers: {
                'x-auth-token': token
            }
        });

        if (response.ok) {
            const data = await response.json();
            if (data.message === 'Sem novas atividades') {
                alert('Sem novas atividades');
                statusMessage.textContent = "";
            } else {
                alert(data.message);
                if (data.redirectUrl) {
                    statusMessage.textContent = "Script iniciado, pode demorar algum tempo, aguarde por favor";
                    window.location.href = data.redirectUrl;
                }
            }
        } else {
            const errorData = await response.json();
            console.error('Erro ao carregar atividades:', errorData);
            alert(errorData.message);
            statusMessage.textContent = "";
        }
    } catch (error) {
        console.error('Erro ao carregar atividades:', error);
        alert('Erro ao carregar atividades.');
        statusMessage.textContent = "";
    }
}

// Função para conectar ao Strava
function connectToStrava() {
    const token = localStorage.getItem('token');
    if (!token) return alert('Você precisa fazer login primeiro.');
    window.location.href = `/api/strava/connect?token=${token}`;
}

// Adiciona um ouvinte de evento ao botão de conectar ao Strava
document.getElementById('connect-strava-button').addEventListener('click', connectToStrava);

// Adiciona um ouvinte de evento ao botão de carregar novas atividades
document.getElementById('load-activities-button').addEventListener('click', loadNewActivities);

// Adiciona um ouvinte de evento ao botão de mapa de concelhos
document.getElementById('map-button').addEventListener('click', () => {
    window.location.href = 'summary.html';
});

// Adiciona um ouvinte de evento ao botão de logout
document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

// Exibir mensagem para conectar ao Strava se não estiver conectado
window.onload = async () => {
    if (window.location.search.includes('token')) {
        // Se há um token na URL, o usuário acabou de se conectar
        const token = new URLSearchParams(window.location.search).get('token');
        localStorage.setItem('token', token);
        window.history.replaceState({}, document.title, "/dashboard.html");
    }
    const isConnected = await isConnectedToStrava();
};

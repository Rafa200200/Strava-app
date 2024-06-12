// Adiciona um ouvinte de evento ao botão com id 'strava-button'
document.getElementById('strava-button').addEventListener('click', async () => {
    const token = localStorage.getItem('token');
    if (!token) return alert('Você precisa fazer login primeiro.');

    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = "Script iniciado, pode demorar algum tempo, aguarde por favor";

    window.location.href = `/api/strava/connect?token=${token}`;
});

// Função para verificar se o usuário está conectado ao Strava
async function isConnectedToStrava() {
    const token = localStorage.getItem('token');
    if (!token) return false;

    const response = await fetch('/api/strava/activities/data', {
        headers: {
            'x-auth-token': token
        }
    });

    return response.ok;
}

// Função para carregar atividades e salvar GPX após autenticação
async function loadActivities() {
    const token = localStorage.getItem('token');
    if (!token) return alert('Você precisa fazer login primeiro.');

    const isConnected = await isConnectedToStrava();
    if (!isConnected) return alert('Você precisa se conectar ao Strava primeiro.');

    const statusMessage = document.getElementById('status-message');
    statusMessage.textContent = "Script iniciado, pode demorar algum tempo, aguarde por favor";

    try {
        const response = await fetch('/api/strava/activities', {
            headers: {
                'x-auth-token': token
            }
        });

        if (response.ok) {
            const data = await response.json();
            alert(data.message);
            if (data.redirectUrl) {
                window.location.href = data.redirectUrl;
            }
        } else {
            const errorData = await response.json();
            console.error('Erro ao carregar atividades:', errorData);
            alert(errorData.message);
        }
    } catch (error) {
        console.error('Erro ao carregar atividades:', error);
        alert('Erro ao carregar atividades.');
    } finally {
        statusMessage.textContent = "Script finalizado";
    }
}

document.getElementById('logout-button').addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'index.html';
});

window.onload = async () => {
    const isConnected = await isConnectedToStrava();
    if (isConnected) {
        loadActivities();
    }
};

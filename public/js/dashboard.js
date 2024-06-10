// Adiciona um ouvinte de evento ao botão com id 'strava-button'
document.getElementById('strava-button').addEventListener('click', async () => {
    // Obtém o token armazenado no localStorage
    const token = localStorage.getItem('token');
    // Se não houver token, alerta o usuário para fazer login primeiro
    if (!token) return alert('Você precisa fazer login primeiro.');

    // Redireciona o usuário para a URL de conexão com o Strava, incluindo o token na query string
    window.location.href = `/api/strava/connect?token=${token}`;
});

// Função para carregar atividades e salvar GPX após autenticação
async function loadActivities() {
    // Obtém o token armazenado no localStorage
    const token = localStorage.getItem('token');
    // Se não houver token, alerta o usuário para fazer login primeiro
    if (!token) return alert('Você precisa fazer login primeiro.');

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
}

// Adiciona um ouvinte de evento ao botão de logout
document.getElementById('logout-button').addEventListener('click', () => {
    // Remove o token do localStorage
    localStorage.removeItem('token');
    // Redireciona para a página index.html
    window.location.href = 'index.html';
});

// Chama a função para carregar atividades ao carregar a página do dashboard
window.onload = loadActivities;

// Código para atualizar a barra de progresso periodicamente
document.addEventListener('DOMContentLoaded', () => {
    const progressBarFill = document.getElementById('progress-bar-fill');
    const estimatedTimeElem = document.getElementById('estimated-time');
    const token = localStorage.getItem('token');

    const fetchProgress = async () => {
        try {
            const response = await fetch('/api/progress', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            if (response.ok) {
                progressBarFill.style.width = `${data.progress}%`;
                progressBarFill.textContent = `${data.progress.toFixed(2)}%`;
                estimatedTimeElem.textContent = `Tempo estimado: ${Math.round(data.estimatedTime)} segundos`;
            } else {
                console.error('Erro ao obter progresso:', data);
            }
        } catch (error) {
            console.error('Erro ao obter progresso:', error);
        }
    };

    // Atualiza a barra de progresso a cada 5 segundos
    setInterval(fetchProgress, 5000);
});

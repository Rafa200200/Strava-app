// Importa o módulo jsonwebtoken para manipulação de tokens JWT
const jwt = require('jsonwebtoken');

// Exporta uma função middleware que verifica a presença e validade do token JWT
module.exports = function (req, res, next) {
    // Obtém o token do cabeçalho da requisição
    const token = req.header('x-auth-token');
    // Se não houver token, retorna um erro 401 (Não autorizado)
    if (!token) return res.status(401).send({ message: 'Acesso negado. Nenhum token fornecido.' });

    try {
        // Verifica o token JWT e decodifica seu conteúdo
        const decoded = jwt.verify(token, 'your_jwt_private_key');
        // Adiciona as informações do usuário decodificadas ao objeto req
        req.user = decoded;
        // Chama a próxima função middleware na pilha
        next();
    } catch (ex) {
        // Se o token for inválido, retorna um erro 400 (Requisição inválida)
        res.status(400).send({ message: 'Token inválido.' });
    }
};

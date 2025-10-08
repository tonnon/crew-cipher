# 🚀 CrewCipher - Sistema de Controle de Acesso com Criptografia

Uma aplicação web interativa desenvolvida em Flask que simula um sistema de controle de acesso de uma nave espacial. O sistema utiliza criptografia Fernet, geração de QR codes e uma interface drag-and-drop para validar credenciais de tripulantes.

## 📋 Visão Geral

CrewCipher é um jogo/simulação educacional onde:
- **27 tripulantes** com papéis aleatórios são gerados a cada rodada
- Apenas **1 tripulante** com o papel correto tem acesso autorizado
- Códigos de acesso são **criptografados** usando Fernet (AES-128)
- Cada tripulante possui um **QR code único** com seu token criptografado
- Interface **drag-and-drop** para testar credenciais

## 🎮 Como Funciona

1. **Geração Aleatória**: A cada rodada, nomes e papéis são embaralhados algoritmicamente
2. **Criptografia**: Apenas o tripulante com papel "Materiais Perigosos" recebe o código correto
3. **Validação**: Arraste o crachá até a porta para verificar acesso
4. **QR Code**: Clique em um tripulante para ver seu QR code com token criptografado

### Regras de Acesso
- ✅ **Autorizado**: Apenas tripulante com papel "Materiais Perigosos"
- 🚫 **Negado**: Todos os outros 26 papéis
- 🔐 **Segurança**: Tokens falsos são gerados para tripulantes não autorizados

## 🛠️ Tecnologias Utilizadas

- **Backend**: Flask (Python)
- **Criptografia**: `cryptography` (Fernet + PBKDF2HMAC)
- **QR Codes**: `qrcode` + PIL
- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Deployment**: Render (configurado via `render.yaml`)

## 📦 Instalação e Execução

### 1. Clone o repositório
```bash
git clone <url-do-repositorio>
cd crew-cipher
```

### 2. Instale as dependências
```bash
pip install -r requirements.txt
```

### 3. Configure variáveis de ambiente (opcional)
Crie um arquivo `.env` na raiz do projeto:
```env
DOOR_UNLOCK_CODE=SEU-CODIGO-SECRETO
SECRET_KEY=sua-chave-secreta-flask
FERNET_KEY=sua-chave-fernet-base64
```

**Nota**: Se não configurar, o sistema usa valores padrão em modo desenvolvimento.

### 4. Execute a aplicação
```bash
python app.py
```

### 5. Acesse no navegador
```
http://127.0.0.1:5000/
```

## 🔐 Segurança

### Variáveis de Ambiente Obrigatórias em Produção
- `DOOR_UNLOCK_CODE`: Código secreto de desbloqueio da porta
- `SECRET_KEY`: Chave secreta do Flask para sessões
- `FERNET_KEY`: Chave de criptografia Fernet (base64)

### Modo Desenvolvimento vs Produção
- **Desenvolvimento**: Define `FLASK_ENV=development` ou `FLASK_DEBUG=1`
- **Produção**: Todas as variáveis de ambiente devem estar configuradas

## 🎨 Estrutura do Projeto

```
crew-cipher/
├── app.py                 # Aplicação Flask principal
├── requirements.txt       # Dependências Python
├── render.yaml           # Configuração de deploy (Render)
├── .env                  # Variáveis de ambiente (não versionado)
├── .gitignore            # Arquivos ignorados pelo Git
├── static/
│   ├── img/              # Imagens dos tripulantes
│   ├── main.js           # Lógica JavaScript
│   ├── style.css         # Estilos CSS
│   └── qrious.min.js     # Biblioteca QR code
└── templates/
    ├── index.html        # Template principal
    └── partials/         # Componentes HTML reutilizáveis
```

## 🚀 Deploy

O projeto está configurado para deploy no Render:

1. Faça push para o repositório Git
2. Conecte o repositório no Render
3. Configure as variáveis de ambiente no painel do Render
4. O deploy será automático usando `render.yaml`

## 🎯 Funcionalidades

- ✨ **Geração Algorítmica de Nomes**: Nomes únicos criados por padrões silábicos
- 🔄 **Embaralhamento Completo**: Papéis e posições randomizados a cada rodada
- 🎲 **Sistema de Rodadas**: Botão "Reiniciar" para nova tripulação
- 📱 **QR Codes Dinâmicos**: Gerados em tempo real para cada tripulante
- 🖱️ **Interface Drag & Drop**: Arraste crachás para testar acesso
- 🔒 **Criptografia Real**: Fernet (AES-128) com PBKDF2HMAC
- 🎨 **UI Responsiva**: Design moderno e intuitivo

## 📝 Endpoints da API

- `GET /` - Página principal com tripulação gerada
- `POST /restart` - Reinicia rodada com nova tripulação
- `POST /check_access` - Valida acesso do tripulante
- `GET /get_token/<crew_id>` - Retorna token criptografado e QR code

## 🧪 Exemplo de Uso

1. Acesse a aplicação
2. Observe os 27 tripulantes gerados aleatoriamente
3. Clique em um tripulante para ver seu QR code
4. Arraste o crachá até a porta
5. Veja se o acesso é autorizado ou negado
6. Clique em "Reiniciar Rodada" para nova tripulação

## 📄 Licença

Este projeto é apenas um exemplo didático para demonstração de conceitos de criptografia, autenticação e desenvolvimento web.

---

**Desenvolvido com Flask, Cryptography e ❤️**

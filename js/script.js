// document.addEventListener('click', () => {
//     // quando for clicado..
//     alert("Você clicou na página!")
// })


document.addEventListener('DOMContentLoaded', () =>{
    // o DOMContentLoaded nao espera carregar as paradas
    // a ordem é html, css e javascript carregando, respectivamente, mas pode haver variações..
    
    // o que foi feito com "=>" é arrow function, o normal seria:  
    // function iniciar(){
    //     console.log("Jogo Iniciado");sssss
    // }
    // const iniciar = () => {
    //     console.log("Jogo Iniciado");
    // }
    // a funcao ja vem no const, no de cima (function) precisa passar pra const
    
    const mario = document.querySelector('.mario');
    const pipe = document.querySelector('.pipe');
    const gameBoard = document.getElementById('game-board');
    const hudPlayerName = document.getElementById('hud-player-name');
    const scoreDisplay = document.getElementById('score-display');
    const jumpTip = document.getElementById('jump-tip');
    const startModal = document.getElementById('start-modal');
    const startForm = document.getElementById('start-form');
    const playerInput = document.getElementById('player-input');
    
});
    const startModal = document.getElementById('start-modal');
    // modal = "janelinha"
    const startForm = document.getElementById('start-form');
    const playerInput = document.getElementById('player-input');
    const btnViewRanking = document.getElementById('btn-view-ranking');
    const gameoverModal = document.getElementById('gameover-modal');
    const finalScoreValue = document.getElementById('final-score-value');
    const saveStatusMsg = document.getElementById('ranking-body');
    const btnRestart = document.getElementById('btn-restart');
    const btnChangePlayer = document.getElementById('btn-change-player');

    let currentPlayer = '';
    let score = 0;
    let isPlaying = false;
    let gameLoop = null;
    let scoreLoop = null;

    // RECUPERACAO DO ULTIMO NOME DE USER
    const savedName = localStorage.getItem('mario-jump-player');
    if (savedName && playerInput){
        playerInput.value = savedName;
    }
// fim recuperacao
    function startGame(){
        // limpou loops anteriores caso eles existam
        clearInterval(gameLoop);
        clearInterval(scoreLoop);

        // resetou as posicoes visuais
        resetElements();

        isPlaying = true;
        score = 0;
        scoreDisplay.textContent = '0';
        // aciona a variavel e bota o valor
        hudPlayerName.textContent = currentPlayer || 'Jogador'

        gameBoard.classList.add('running');
        // deixa a classe do gameBoard com a class "running" tbm e ativa as animações

        // vai dar um ponto a cada 0.1s
        scoreLoop = setInterval(() => {
            
            if (isPlaying){
                
                score += 1;
                scoreDisplay.textContent = score;

            }
        }, 100);
        gameLoop = setInterval(checkCollision, 10);
        // checkCollision -> funcao que checa se o objeto encostou em algum outro elemento
    }

    // resetar estilos e posicoes dos elementos
    function resetElements(){
        pipe.style.animation = '';
        pipe.style.left = '';
        // deixa cano sem nd

        mario.src = '../assets/mario.gif';
        // "../" é pra sair da pasta "JS" e o resto é pra entrar na pasta assets    
        mario.style.animation = '';
        mario.style.bottom = '0px';
        mario.style.width = '';
        mario.style.marginLeft = '';
        mario.classList.remove('jump');

        if(jumpTip){
            jumpTip.style.opacity = '1';
        // pra ele aparecer e nao fica invisivel
        }
    }
    function jump(){
        if (!isPlaying) return;
        if (mario.classList.contains('jump')) return;

        mario.classList.add('jump');

        if(jumpTip){
            jumpTip.style.opacity = '0';
        }

        setTimeout(() =>{
            mario.classList.remove('jump');
        }, 500);
        // agenda a remoção da classe sem travar o jogo todo
    }
    // verificar a colisao entre o mario e o obstaculossss
    function checkCollision(){
        if (!isPlaying) return;

        const pipePosition = pipe.offsetLeft;
        const marioPosition = +window.getComputedStyle(mario).bottom.replace('px', '');
        // ta pegando a propriedade css do mario em relação ao chao e tirando o "px"

        if (pipePosition <= 120 && pipePosition > 0 && marioPosition < 80){
            // se obstaculo tiver entre 120 e 0 e mario estiver mais alto que 80
            triggerGameOver(pipePosition, marioPosition);
        }
    }
    // tratar o gameOver
    function triggerGameOver(pipePosition, marioPosition){
        isPlaying = false;
        clearInterval(gameLoop);
        // tem que resetar tudo pra ir la no start tbm
        clearInterval(scoreloop);
        // pq os pontos param tbm

        gameBoard.classList.remove('running');

        pipe.style.animation = 'none';
        pipe.style.left = `${pipePosition}px`;
        // para a animação e deixa o cano parado

        mario.style.animation = 'none';
        mario.style.bottom = `${marioPosition} px`;
        mario.src = '../assets/game-over.png';
        mario.style.width = '75px';
        mario.style.marginLeft = '50px';
    
        // atualizacao do modal do gameover 
        finalScoreValue.textContent = score;
        saveStatusMsg.textContent = 'Salvando pontuação no banco...';
        saveStatusMsg.style.color = '#ffcc00';

        gameoverModal.classList.add('Active');
        
        saveScore(currentPlayer, score)
        // salvando a pontuação no banco com a função "saveScore"
    }
    function saveScore(playerName, finalScore){
        fetch('salvar_ranking.php', {
            method: POST,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                nome: playerName,
                pontos: finalScore
            })
        })
        .then(res => res.json())
        // aguarda a resposta do json
        .then(data => {
            if(data.status === 'success'){
                saveStatusMsg.textContent = 'Pontuação Registrada no banco!';
                saveStatusMsg.style.color = '#10b981';
                if(data.ranking){
                    renderRanking(data.ranking, playerName, finalScore);
                }
            } else{
                    saveStatusMsg.textContent = (data.message || 'Erro ao registrar.');
                    // se nao tiver o data.message, ele vai escrever que deu erro
                    saveStatusMsg.style.color = '#ef4444';
                }
            })
            .catch(err => {
                console.error('Erro na comunicação', err);
                saveStatusMsg.textContent = 'Erro ao conectar ao servidor.';
                saveStatusMsg.style.color = '#ef4444';
        });
    }

    // busca do ranking atualizado no banco
    function fetchRanking(){
        fetch('obter_ranking.php')
        .then(res => res.json())
        .then(data => {
            if (data.status === 'sucess' && data.ranking){
                renderRanking(data.ranking);
            }
        })
        .catch(err => console.error('Erro ao buscar o ranking', err))
    }

    // atualizando a tabela no ranking
    // o usuario precisa estar destacado para que ele nao tenha que procurar
    function renderRanking(list, highlightName = null, highlightScore = null){
        if(!rankingBody) return;
        rankingBody.innerHTML = '';
        // em outras palavras, ele limpa o conteudo

        if(!list || list.length === 0){
            rankingBody.innerHTML = `<tr><td colspan="3" class="loading-cell">Nenhuma pontuação gravada ainda</td></tr>`;
            return;
        }
        let highlightted = false;

        list.forEach((item, index) => {
            const tr = document.createElement('tr');

            if(!highlightted && highlightName && item.nome === highlightName && parseInt(item.pontos, 10) === highlightScore){
                tr.classList.add('highlight-current');
                highlightted = true;
            }

            let medal = `${index + 1}º`;
            if (index === 0) medal = '🥇 1º';
            else if (index === 1) medal = '🥈 2°';
            else if (index === 2) medal = '🥉 3°';

            tr.innerHTML = `
            <td class="ranking-pos">${medal}</td>
            <td><strong>${escapeHtml(item.nome)}</strong></td>
            `;

            rankingBody.appendChild(tr);
        });
    }

    // TRATAMENTO DE STRING
    function escapeHtml(str){
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;')
            // transformando caracteres especiais em codigos html
            // pro html nao aceitar alguns caracteres
            // o "g" é de global, o caractere entre barras é o caractere a ser substituido
            // e o '&..' sao os comandos no paranaue
    }

    // eventos de controle e interface do jogo
    // INICIAR O JOGO (formulario)

    startForm.addEventListener('submit', (e) =>{
        // e = parametro
        e.preventDefault();
        // impede o recarregamento da pagina

        const nameValue = playerInput.value.trim();
        // "trim" tira o espaço que o usuario colocsr antes e depois

        if (!nameValue){
            playerInput.focus();
            return;
        }

        currentPlayer = nameValue;
        localStorage.setItem('mario-jump-player', currentPlayer);
        // fecha a tela e começa o jogo depois de preencher os dados
        startModal.classList.remove('active');
        startGame();

    });

    // botao ver ranking
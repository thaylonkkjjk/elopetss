
NOME DO PROJETO

EloPets - Plataforma web para ONGs de animais.


FINALIDADE

O EloPets e o projeto de Conclusao do Curso Tecnico em Desenvolvimento de Sistemas. Sua finalidade e criar uma ponte digital entre ONGs de protecao animal, adotantes e doadores, centralizando:

- Divulgacao de animais disponiveis para adocao;
- Cadastro e gestao de ONGs parceiras;
- Recebimento de doacoes e voluntariado;
- Conscientizacao sobre posse responsavel.


EQUIPE

Nome: Thaylon 
Nome: Tamires
Nome: Eduardo Souza

FINALIDADE
O EloPets e o Trabalho de Conclusao de Curso (TCC) apresentado a EE Professor Roldao Lopes de Barros como requisito parcial para obtencao do titulo de Tecnico em Desenvolvimento de Sistemas.
A finalidade do projeto e utilizar a tecnologia como ferramenta de apoio social, criando uma plataforma digital que conecte ONGs de protecao animal entre si e com pessoas interessadas em ajudar, facilitando a troca de recursos, doacoes e apoio voluntario.
Orientador: Prof. Josef, Profª Juliette.
Instituicao: EE Professor Roldao Lopes de Barros
Ano: 2026

VISAO GERAL

O projeto surgiu a partir da observacao de que muitas ONGs de protecao animal enfrentam dificuldades relacionadas a falta de recursos, como alimentos, medicamentos e apoio financeiro, alem da escassez de voluntarios. Ao mesmo tempo, existem pessoas e instituicoes dispostas a ajudar, mas que nao sabem como ou onde contribuir.
A plataforma propoe facilitar essa conexao, promovendo colaboracao, solidariedade e melhor distribuicao de recursos entre as ONGs mais necessitadas.

CARACTERISTICAS TECNICAS

Linguagem: Java
Banco de Dados: MySQL
Aplicacao: Plataforma web
Interface: responsiva (adaptavel a dispositivos moveis e desktop)
Seguranca: garantia de seguranca dos dados dos usuarios
Performance: boa performance e tempo de resposta adequado
Design: intuitivo e de facil usabilidade


FUNCIONALIDADES

Atuais (Requisitos Funcionais):
O administrador devera cadastrar e gerenciar usuarios e ONGs.
O usuario devera realizar cadastro na plataforma.
O usuario podera informar suas areas de interesse (doacao, adocao, etc.).
O usuario podera buscar ONGs com base em localizacao, tipo de causa ou necessidade.
O usuario podera visualizar informacoes detalhadas das ONGs.
O usuario podera se candidatar a acoes de voluntariado.
O usuario podera realizar doacoes para ONGs cadastradas.
A ONG devera cadastrar seus projetos, campanhas e necessidades.
A ONG devera atualizar informacoes sobre suas atividades.
Futuras:
Chat em tempo real entre usuarios e ONGs.
Doacoes via PIX / PagSeguro.
Geolocalizacao de ONGs proximas.
App mobile.
Gamificacao para voluntarios.
Relatorios e dashboards analiticos

SITEMAP

EloPets
|
+-- / (Home)
|   +-- Destaques de pets
|   +-- Campanhas ativas
|
+-- /pets
|   +-- /pets/:id (Detalhes)
|   +-- /pets/filtros (Especie, Porte, Idade, Cidade)
|
+-- /ongs
|   +-- /ongs/:id (Perfil da ONG)
|   +-- /ongs/cadastro
|
+-- /adocao
|   +-- /adocao/solicitar/:petId
|   +-- /adocao/status
|
+-- /doacoes
|   +-- /doacoes/pix
|   +-- /doacoes/historico
|
+-- /voluntariado
|
+-- /sobre
|   +-- /sobre/contato
|   +-- /sobre/faq
|
+-- /auth
|   +-- /login
|   +-- /registro
|
+-- /admin (ONG/Admin)
    +-- /admin/dashboard
    +-- /admin/pets
    +-- /admin/adocoes
    +-- /admin/usuarios


DER - DIAGRAMA ENTIDADE-RELACIONAMENTO

Tabela USUARIO
- id 
- nome
- email
- senha_hash
- tipo
- telefone
- created_at

Tabela ONG
- id
- nome
- cnpj
- endereco
- telefone
- email
- usuario_id

Tabela PET
- id
- nome
- especie
- raca
- idade
- porte
- descricao
- status
- ong_id 

Tabela ADOCAO
- id 
- usuario_id 
- pet_id 
- status
- data_solicitacao
- observacoes

Tabela DOACAO
- id 
- usuario_id 
- ong_id 
- valor
- metodo
- data

Tabela FOTO_PET
- id
- pet_id 
- url
- principal

Tabela VOLUNTARIO
- id
- usuario_id 
- ong_id
- funcao
- disponibilidade

Relacionamentos principais:
- USUARIO: ADOCAO - um usuario faz varias solicitacoes
- PET: ADOCAO - um pet pode ter varias solicitacoes (so uma aprovada)
- ONG: PET - uma ONG cadastra varios pets
- ONG: DOACAO - uma ONG recebe varias doacoes
- PET: FOTO PET - cada pet possui varias fotos
- USUARIO: ONG (via VOLUNTARIO) - usuarios voluntarios em ONGs


export interface Animal {
  id: string;
  name: string;
  species: 'cachorro' | 'gato' | 'outro';
  breed: string;
  age: string;
  gender: 'macho' | 'fêmea';
  city: string;
  state: string;
  image: string;
  description: string;
  vaccinated: boolean;
  castrated: boolean;
  ongId: string;
  ongName: string;
  status: 'disponível' | 'em processo' | 'adotado';
  size?: 'pequeno' | 'médio' | 'grande';
}

export interface ONG {
  id: string;
  name: string;
  description: string;
  email: string;
  phone: string;
  city: string;
  state: string;
  animalsCount: number;
  helpRequestsCount: number;
  since: string;
  image?: string;
}

export interface HelpRequest {
  id: string;
  title: string;
  description: string;
  type: 'dinheiro' | 'itens' | 'voluntariado';
  items?: string[];
  ongId: string;
  ongName: string;
  city: string;
  state: string;
  image: string;
  createdAt: string;
  urgent: boolean;
}

export const animals: Animal[] = [
  {
    id: '1',
    name: 'Max',
    species: 'cachorro',
    breed: 'Golden Retriever',
    age: '8 meses',
    gender: 'macho',
    city: 'Florianópolis',
    state: 'SC',
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663509286533/ALSGtEaicPFzf5G3RQ9za7/adoption-dog-max-QJUucU2PMhH8J6rrDvTVZN.webp',
    description: 'Max é um filhote de Golden Retriever cheio de energia e amor! Adora brincar, é muito carinhoso com crianças e se dá bem com outros animais. Está vacinado e vermifugado. Procura uma família que possa dar muito amor e espaço para correr.',
    vaccinated: true,
    castrated: false,
    ongId: '1',
    ongName: 'Patinhas do Sul',
    status: 'disponível',
    size: 'grande',
  },
  {
    id: '2',
    name: 'Luna',
    species: 'gato',
    breed: 'Vira-lata',
    age: '1 ano',
    gender: 'fêmea',
    city: 'Tramandaí',
    state: 'RS',
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663509286533/ALSGtEaicPFzf5G3RQ9za7/adoption-cat-luna-aPyKNnhmGwNvpS3a2GoFSH.webp',
    description: 'Luna é uma gatinha dócil e curiosa. Adora receber carinho e passa horas observando o mundo pela janela. Convive bem com crianças maiores e é muito tranquila. Já está castrada e com todas as vacinas em dia.',
    vaccinated: true,
    castrated: true,
    ongId: '2',
    ongName: 'Amor Felino RS',
    status: 'disponível',
    size: 'pequeno',
  },
  {
    id: '3',
    name: 'Zeus',
    species: 'cachorro',
    breed: 'Labrador',
    age: '3 anos',
    gender: 'macho',
    city: 'Balneário Camboriú',
    state: 'SC',
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663509286533/ALSGtEaicPFzf5G3RQ9za7/adoption-dog-zeus-PThtCVaEv84sJfjyWrBXWR.webp',
    description: 'Zeus é um Labrador Chocolate leal e protetor. Muito inteligente e fácil de treinar. Ama nadar e passear. Ideal para famílias ativas que gostam de atividades ao ar livre. Está vacinado e castrado.',
    vaccinated: true,
    castrated: true,
    ongId: '3',
    ongName: 'ONG Carioca Animal',
    status: 'disponível',
    size: 'grande',
  },
  {
    id: '4',
    name: 'Lili',
    species: 'gato',
    breed: 'Vira-lata',
    age: '6 meses',
    gender: 'fêmea',
    city: 'Rio de Janeiro',
    state: 'RJ',
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663509286533/ALSGtEaicPFzf5G3RQ9za7/adoption-cat-lili-YpLkfMtC22RPnLmmrZLwdz.webp',
    description: 'Lili é uma gatinha preta e branca cheia de personalidade! Brincalhona e curiosa, adora explorar cada cantinho da casa. Muito carinhosa com quem conquista sua confiança. Está vacinada e pronta para um novo lar.',
    vaccinated: true,
    castrated: false,
    ongId: '3',
    ongName: 'ONG Carioca Animal',
    status: 'disponível',
    size: 'pequeno',
  },
  {
    id: '5',
    name: 'Rex',
    species: 'cachorro',
    breed: 'Border Collie',
    age: '2 anos',
    gender: 'macho',
    city: 'Natal',
    state: 'RN',
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663509286533/ALSGtEaicPFzf5G3RQ9za7/adoption-dog-rex-Ngm32Wm58RzMxHUJiVoaRv.webp',
    description: 'Rex é um Border Collie extremamente inteligente e energético. Precisa de exercício diário e estimulação mental. Ótimo para famílias que praticam esportes ou têm espaço amplo. Aprende comandos rapidamente.',
    vaccinated: true,
    castrated: true,
    ongId: '4',
    ongName: 'Resgate Nordeste',
    status: 'disponível',
    size: 'médio',
  },
  {
    id: '6',
    name: 'Mia',
    species: 'gato',
    breed: 'Persa',
    age: '4 anos',
    gender: 'fêmea',
    city: 'São Paulo',
    state: 'SP',
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663509286533/ALSGtEaicPFzf5G3RQ9za7/adoption-cat-mia-PUi5m6hJeBqfEzp88b7dJg.webp',
    description: 'Mia é uma gata Persa majestosa e tranquila. Adora ambientes calmos e é muito carinhosa com seu tutor. Não gosta de muito barulho, ideal para apartamentos. Já está castrada, vacinada e com saúde em dia.',
    vaccinated: true,
    castrated: true,
    ongId: '5',
    ongName: 'Felinos SP',
    status: 'disponível',
    size: 'médio',
  },
  {
    id: '7',
    name: 'Bolinha',
    species: 'cachorro',
    breed: 'Poodle',
    age: '5 anos',
    gender: 'macho',
    city: 'Curitiba',
    state: 'PR',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
    description: 'Bolinha é um Poodle miniatura muito dócil e carinhoso. Adora colo e é perfeito para apartamentos. Se dá bem com crianças e outros pets. Está vacinado e castrado. Busca um lar tranquilo e cheio de amor.',
    vaccinated: true,
    castrated: true,
    ongId: '6',
    ongName: 'Patinhas Curitiba',
    status: 'disponível',
    size: 'pequeno',
  },
  {
    id: '8',
    name: 'Simba',
    species: 'gato',
    breed: 'Maine Coon',
    age: '2 anos',
    gender: 'macho',
    city: 'São Paulo',
    state: 'SP',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop',
    description: 'Simba é um Maine Coon imponente e gentil. Muito sociável, adora companhia humana e até aprende truques! Convive bem com outros gatos. Está vacinado e castrado. Procura uma família que valorize sua personalidade única.',
    vaccinated: true,
    castrated: true,
    ongId: '5',
    ongName: 'Felinos SP',
    status: 'disponível',
    size: 'grande',
  },
  {
    id: '9',
    name: 'Toby',
    species: 'cachorro',
    breed: 'Beagle',
    age: '4 anos',
    gender: 'macho',
    city: 'Natal',
    state: 'RN',
    image: 'https://images.unsplash.com/photo-1633722715463-d30628cbc4c1?w=400&h=300&fit=crop',
    description: 'Toby é um Beagle alegre e cheio de energia. Adora passear e explorar. Precisa de espaço para correr. Vacinado e castrado.',
    vaccinated: true,
    castrated: true,
    ongId: '4',
    ongName: 'Resgate Nordeste',
    status: 'disponível',
    size: 'médio',
  },
  {
    id: '10',
    name: 'Bella',
    species: 'cachorro',
    breed: 'Poodle',
    age: '1 ano',
    gender: 'fêmea',
    city: 'Porto Alegre',
    state: 'RS',
    image: 'https://images.unsplash.com/photo-1537151607828-8661f6b32421?w=400&h=300&fit=crop',
    description: 'Bella é uma poodle pequena, muito dócil e carinhosa. Adora passear e brincar em casa. Perfeita para apartamento e famílias com crianças. Vacinada e castrada.',
    vaccinated: true,
    castrated: true,
    ongId: '2',
    ongName: 'Amor Felino RS',
    status: 'disponível',
    size: 'pequeno',
  },
  {
    id: '11',
    name: 'Dudu',
    species: 'cachorro',
    breed: 'Shih Tzu',
    age: '2 anos',
    gender: 'macho',
    city: 'Curitiba',
    state: 'PR',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
    description: 'Dudu é um Shih Tzu muito amigável e brincalhão. Adora crianças e outros animais. Precisa de banho e tosa regular. Vacinado e castrado.',
    vaccinated: true,
    castrated: true,
    ongId: '6',
    ongName: 'Patinhas Curitiba',
    status: 'disponível',
    size: 'pequeno',
  },
  {
    id: '12',
    name: 'Nala',
    species: 'gato',
    breed: 'Siamês',
    age: '1 ano',
    gender: 'fêmea',
    city: 'Florianópolis',
    state: 'SC',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop',
    description: 'Nala é uma gatinha Siamês muito vocal e sociável. Adora interagir com pessoas e brincar. Precisa de uma casa onde possa ser o centro das atenções. Castrada e vacinada.',
    vaccinated: true,
    castrated: true,
    ongId: '1',
    ongName: 'Patinhas do Sul',
    status: 'disponível',
    size: 'pequeno',
  },
];

export const ongs: ONG[] = [
  {
    id: '1',
    name: 'Patinhas do Sul',
    description: 'Organização dedicada ao resgate, cuidado e adoção responsável de animais em situação de vulnerabilidade no litoral catarinense.',
    email: 'contato@patinhasdosul.org.br',
    phone: '(48) 99123-4567',
    city: 'Florianópolis',
    state: 'SC',
    animalsCount: 45,
    helpRequestsCount: 3,
    since: '2015',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    name: 'Amor Felino RS',
    description: 'Especializada no resgate e cuidado de gatos abandonados no Rio Grande do Sul. Promovemos adoção responsável e castração.',
    email: 'amorfelino@gmail.com',
    phone: '(51) 98765-4321',
    city: 'Porto Alegre',
    state: 'RS',
    animalsCount: 28,
    helpRequestsCount: 2,
    since: '2018',
    image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    name: 'ONG Carioca Animal',
    description: 'Atuamos no resgate de animais em situação de risco no Rio de Janeiro, com foco em reabilitação e adoção consciente.',
    email: 'cariocaanimal@ong.org',
    phone: '(21) 97654-3210',
    city: 'Rio de Janeiro',
    state: 'RJ',
    animalsCount: 62,
    helpRequestsCount: 4,
    since: '2012',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
  },
  {
    id: '4',
    name: 'Resgate Nordeste',
    description: 'Trabalhamos incansavelmente pelo bem-estar animal no Nordeste brasileiro, promovendo adoção e educação sobre posse responsável.',
    email: 'resgatenordeste@org.br',
    phone: '(84) 98888-7777',
    city: 'Natal',
    state: 'RN',
    animalsCount: 38,
    helpRequestsCount: 5,
    since: '2019',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop',
  },
  {
    id: '5',
    name: 'Felinos SP',
    description: 'Dedicados exclusivamente ao cuidado de gatos em São Paulo. Realizamos castração, vacinação e adoção responsável.',
    email: 'felinosp@gmail.com',
    phone: '(11) 97777-6666',
    city: 'São Paulo',
    state: 'SP',
    animalsCount: 89,
    helpRequestsCount: 6,
    since: '2010',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop',
  },
  {
    id: '6',
    name: 'Patinhas Curitiba',
    description: 'ONG curitibana com foco no resgate de cães de pequeno porte e promoção de adoção responsável na região metropolitana.',
    email: 'patinhascuritiba@ong.br',
    phone: '(41) 96666-5555',
    city: 'Curitiba',
    state: 'PR',
    animalsCount: 31,
    helpRequestsCount: 2,
    since: '2017',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
  },
];

export const helpRequests: HelpRequest[] = [
  {
    id: '1',
    title: 'Estamos Sem Ração para Cães!',
    description: 'Nossa ONG está com estoque crítico de ração para os 45 cães que abrigamos. Precisamos urgentemente de doações de ração para cães adultos e filhotes. Qualquer marca é bem-vinda!',
    type: 'itens',
    items: ['Ração para cães adultos', 'Ração para filhotes', 'Petiscos'],
    ongId: '1',
    ongName: 'Patinhas do Sul',
    city: 'Florianópolis',
    state: 'SC',
    image: 'https://d2xsxph8kpxj0f.cloudfront.net/310519663509286533/ALSGtEaicPFzf5G3RQ9za7/help-request-food-8h7H5TQ6dmSAHRdq4Hme4k.webp',
    createdAt: '2024-01-15',
    urgent: true,
  },
  {
    id: '2',
    title: 'Precisamos de Leite para Gatinhos!',
    description: 'Resgatamos uma ninhada de 8 filhotes órfãos com menos de 3 semanas. Precisamos de leite específico para gatos e mamadeiras para alimentá-los. Toda ajuda é fundamental!',
    type: 'itens',
    items: ['Leite KMR para gatos', 'Mamadeiras para filhotes', 'Seringas 5ml'],
    ongId: '2',
    ongName: 'Amor Felino RS',
    city: 'Porto Alegre',
    state: 'RS',
    image: 'https://s2-casaejardim.glbimg.com/7lDq2ggKj0DtWiXca0lAxs8czlI=/0x0:1200x800/984x0/smart/filters:strip_icc()/i.s3.glbimg.com/v1/AUTH_a0b7e59562ef42049f4e191fe476fe7d/internal_photos/bs/2023/l/k/c2B945QbWxrUj61S7VIg/2021-10-08-bebendo-leite.jpeg',
    createdAt: '2024-01-14',
    urgent: true,
  },
  {
    id: '3',
    title: 'Ajuda com Remédios e Vacinas!',
    description: 'Temos vários animais que precisam de medicamentos e vacinas. Arrecadamos fundos para cobrir os custos veterinários. Sua doação faz toda a diferença!',
    type: 'dinheiro',
    ongId: '3',
    ongName: 'ONG Carioca Animal',
    city: 'Rio de Janeiro',
    state: 'RJ',
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQbrsVVAkUJVKaQyzhg1Kl2UkQeiwy-jU-dMg&s',
    createdAt: '2024-01-13',
    urgent: false,
  },
  {
    id: '4',
    title: 'Voluntários para Socialização de Animais',
    description: 'Procuramos voluntários para ajudar na socialização de nossos animais resgatados. Experiência não é necessária, apenas amor pelos animais!',
    type: 'voluntariado',
    ongId: '4',
    ongName: 'Resgate Nordeste',
    city: 'Natal',
    state: 'RN',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop',
    createdAt: '2024-01-12',
    urgent: false,
  },
  {
    id: '5',
    title: 'Doação de Brinquedos para Cães',
    description: 'Nossos cães adoram brinquedos! Estamos recolhendo doações de brinquedos resistentes, bolinhas, cordas e outros itens para enriquecer o ambiente.',
    type: 'itens',
    items: ['Bolinhas de borracha', 'Cordas', 'Brinquedos resistentes', 'Ossos de nylon'],
    ongId: '5',
    ongName: 'Felinos SP',
    city: 'São Paulo',
    state: 'SP',
    image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop',
    createdAt: '2024-01-11',
    urgent: false,
  },
  {
    id: '6',
    title: 'Doação de Alimentos para Gatos',
    description: 'Precisamos urgentemente de alimentos para os gatos abrigados. Qualquer marca de ração é bem-vinda!',
    type: 'itens',
    items: ['Ração para gatos', 'Petiscos felinos', 'Leite para gatos'],
    ongId: '5',
    ongName: 'Felinos SP',
    city: 'São Paulo',
    state: 'SP',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop',
    createdAt: '2024-01-10',
    urgent: true,
  },
  {
    id: '7',
    title: 'Campanha de Castração',
    description: 'Estamos arrecadando fundos para uma campanha de castração em massa. Cada doação ajuda a controlar a população de animais abandonados.',
    type: 'dinheiro',
    ongId: '3',
    ongName: 'ONG Carioca Animal',
    city: 'Rio de Janeiro',
    state: 'RJ',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
    createdAt: '2024-01-09',
    urgent: false,
  },
  {
    id: '8',
    title: 'Doações de Cobertores e Casinhas',
    description: 'Com o inverno chegando, nossos animais precisam de cobertores, casinhas e mantas para se aquecer. Aceitamos doações de qualquer tamanho e estado de conservação.',
    type: 'itens',
    items: ['Cobertores', 'Casinhas de plástico', 'Mantas', 'Roupinhas para cães'],
    ongId: '6',
    ongName: 'Patinhas Curitiba',
    city: 'Curitiba',
    state: 'PR',
    image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop',
    createdAt: '2024-01-08',
    urgent: false,
  },
  {
    id: '9',
    title: 'Ajuda com Medicamentos Urgentes',
    description: 'Temos animais que precisam de medicamentos urgentes. Qualquer contribuição nos ajuda a salvar vidas!',
    type: 'dinheiro',
    ongId: '1',
    ongName: 'Patinhas do Sul',
    city: 'Florianópolis',
    state: 'SC',
    image: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=300&fit=crop',
    createdAt: '2024-01-07',
    urgent: true,
  },
  {
    id: '10',
    title: 'Voluntários para Limpeza e Cuidados',
    description: 'Procuramos voluntários para ajudar com limpeza, alimentação e cuidados gerais dos animais.',
    type: 'voluntariado',
    ongId: '2',
    ongName: 'Amor Felino RS',
    city: 'Porto Alegre',
    state: 'RS',
    image: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?w=400&h=300&fit=crop',
    createdAt: '2024-01-06',
    urgent: false,
  },
];

export const stats = {
  ongs: 127,
  animals: 1843,
  adopted: 4521,
  cities: 89,
};

export const getAnimalById = (id: string) => animals.find(a => a.id === id);
export const getOngById = (id: string) => ongs.find(o => o.id === id);
export const getHelpRequestById = (id: string) => helpRequests.find(h => h.id === id);
export const getAnimalsByOng = (ongId: string) => animals.filter(a => a.ongId === ongId);
export const getHelpRequestsByOng = (ongId: string) => helpRequests.filter(h => h.ongId === ongId);

export const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Ontem';
  if (diff < 7) return `${diff} dias atrás`;
  return date.toLocaleDateString('pt-BR');
};

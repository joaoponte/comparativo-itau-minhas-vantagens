# Comparador de Benefícios: Itaú Uniclass vs. Personnalité

Este projeto é uma aplicação web para comparar os benefícios e "passos" dos programas de relacionamento **Uniclass** e **Personnalité** do Itaú.

A ferramenta permite que o usuário insira os produtos e serviços que possui ou utiliza e, em tempo real, visualize em qual nível de cada programa ele se encontra, além de sugerir caminhos para alcançar o próximo nível.

## ✨ Funcionalidades

- **Inputs Dinâmicos:** Marque os produtos (toggles) e informe valores (R$) para investimentos, gastos no cartão e salário.
- **Cálculo de Passos em Tempo Real:** Os passos são calculados instantaneamente para cada segmento (Uniclass e Personnalité) com base em suas regras específicas.
- **Comparação Lado a Lado:** Visualize seu nível e os benefícios liberados em cada programa simultaneamente.
- **Sugestões "Próximo Nível":** O app sugere quais produtos ativar ou valores aumentar para você chegar ao próximo nível.
- **Persistência de Estado:** Seus dados são salvos automaticamente na URL e no `localStorage`, permitindo compartilhar seu perfil via link.
- **Design Responsivo e Modo Escuro:** A interface se adapta a diferentes tamanhos de tela e ao tema (claro/escuro) do seu sistema operacional.
- **Exportação para PDF:** Botão para imprimir ou salvar a comparação como um arquivo PDF.

## 🛠️ Tecnologias Utilizadas

- **[Svelte 5](https://svelte.dev/):** Framework reativo para a construção da interface.
- **[Vite](https://vitejs.dev/):** Ferramenta de build e servidor de desenvolvimento.
- **[Tailwind CSS v4](https://tailwindcss.com/):** Framework de CSS utilitário para estilização.
- **[TypeScript](https://www.typescriptlang.org/):** Superset do JavaScript com tipagem estática.

## 🚀 Rodando o Projeto Localmente

Siga os passos abaixo para executar a aplicação em sua máquina.

### Pré-requisitos

- [Node.js](https://nodejs.org/en/) (versão 26 ou superior)
- [npm](https://www.npmjs.com/) (geralmente vem com o Node.js)

### Passos

1.  **Clone o repositório:**
    ```bash
    git clone https://github.com/joaoponte/comparativo-itau-minhas-vantagens.git
    cd comparativo-itau-minhas-vantagens```

2. **Instale as dependências:**
    ```bash
    npm install
    ```

3. **Inicie o servidor de desenvolvimento:**
    ```bash
    npm run dev
    ```

4.  Abra o endereço fornecido no terminal (geralmente `http://localhost:5173/comparativo-itau-minhas-vantagens/`) no seu navegador.

## Scripts Disponíveis

No diretório do projeto, você pode executar:

- `npm run dev`: Inicia a aplicação em modo de desenvolvimento.
- `npm run build`: Cria a versão de produção otimizada na pasta `dist`.
- `npm run preview`: Inicia um servidor local para visualizar a build de produção.
- `npm run check`: Executa a verificação de tipos do Svelte e TypeScript.

## Licença

Este projeto está sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes. Resumidamente, você pode baixar, alterar, utilizar e repassar o código sem nenhuma barreira e gratuitamente. Não há garantia nem responsabilidade de nenhum tipo por minha parte.

Dito isso, só peço que cite meu nome como autor dessa versão ou referencie meu repositório, caso meu código seja usado como base para outros projetos. Inclusive, gostaria muito de conhecer projetos derivados desse aqui!
```

---
useFolks: true
title: "project init -y"
language: "pt-br"
translations: ["pt-br"]
date: "2019-10-22T23:59:59.999Z"
description: "O mindset de como iniciar um grande projeto"
---

No último artigo eu falei de estruturas de pastas, mas isso é de longe uma das decisões mais importantes no projeto. Até chegar nesse ponto, você já deve ter tomado várias outras decisões importantes. E é sobre essas decisões que eu quero falar nesse artigo

### O problema do domínio

Acima de qualquer framework, infraestrutura monolítica ou microsserviços, linguagem e qualquer outra tecnologia, nós temos o problema a ser resolvido.

Você e seu time precisam estar alinhados sobre termos comuns naquele domínio, saber dos casos de uso, conhecer o público alvo que será atingido pelo problema que o produto desenvolvido irá resolver.

Como diz Jack (aquele mesmo, o estripador), vamos por partes:

-   Ter uma língua franca no projeto, e não é idioma, mas sim os termos do negócio. O termo correto para esse tópico é DSL (Domain Specific Language). Existem ferramentas super sofisticadas para você controlar a DSL e produzir um dicionário formal para seu problema...mas você não precisa disso se tiver uma boa comunicação com o cliente/equipe sobre o domínio. O alinhamento de todas as partes é crucial para que a língua franca seja entendida por todos. Pra isso, boas issues, boas descrições de problemas e até um dicionário (leia arquivo .txt ou .md) com os termos

-   Após todos estarem iterados da linguagem, é preciso saber os casos de uso. Os casos de uso são fatos que ocorrer no ciclo de vida do seu sistema, tais como "Cadastro de Usuário", "Login", "Adicionar um item no carrinho de compras". Brainstorms são ideais para que sua equipe possa extrair o máximo de informações possíveis. Nesse momento, nenhuma pergunta é inútil, até mesmo "O que é um cadastro?". Perguntas como essa exigem saber quais dados o sistema irá coletar. É bom saber fluxos que desencadeiam múltiplas ações no sistema, e assim saber o que é preciso, o que deve ser extraído e o que precisa ser apresentado.

-   Com todos os fluxos definidos, é hora de saber o público alvo. **Mas pera, se eu souber o meu público alvo antes de definir os casos de uso, eu não terei casos de uso melhores?**. Bastant perspicaz da sua parte pensar isso, mas isso pode engessar o pensamento durante a definição do caso de uso, e conhecendo o público alvo

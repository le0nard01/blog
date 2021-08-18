---
useFolks: true
subjects: ["cryptography","SHA2","python","c++","hash"]
title: "(EM DESENVOLVIMENTO) Security Hash Algorithm 2 - SHA2"
language: "pt-br"
translations: ["pt-br"]
date: "2021-08-18T14:30:00.999Z"
description: "Explicação e programação do algoritmo SHA2, abordando SHA256,SHA512 e também SHA1/SHA3"
---

# Inicio

Neste artigo irei fazer uma extensa explicação e programação deste algoritmo HASH, também uma breve explicação sobre o que é HASH. Estarei escrevendo este algoritmo em Python pois é uma linguagem mais "Human-readable", porém também escrevi em C++ (É menos complexo lidar com grandes números com C++, e sua performance é incomparável). Cheque o meu [repositório do GitHub](https://github.com/le0nard01/Crypto), todos os códigos completos estão lá.

# O que é o algoritmo Hash

O algoritmo Hash é uma criptografia de um único sentido (One-way), aonde não é possível você realizar uma operaçào inversa para descriptografar. No caso do SHA2 e de alguns outros hash's, isso ocorro através de uma função 

Esse sistema é amplamente utilizado para guardar dados aonde não é necessario saber de fato o valor, por exemplo uma senha. Grande parte dos Banco de Dados de senhas, guardam-as em algum Hash, pois assim não expõe o valor, porém a funcionalidade é a mesma.


---
useFolks: true
subjects: ["typescript", "tricks"]
title: "Typescript 101 - [2]"
language: "pt-br"
translations: ["pt-br"]
date: "2020-04-06T23:29:59.999Z"
description: "Não sei criar tipos pra N objetos, e agora?"
---

Fala aí galera, tranquilos? Eu demorei pra lançar esse artigo pois queria construir algo com bastante tipagem complexa para
conseguir fazer um *deep dive* em TS. Sem mais delongas, vamos lá

### Generics - Inferindo os tipos de qualquer lugar

Generics é uma técnica interessante para que possamos trabalhar com um tipo que atenda a uma todos os tipos que satisfação a
sua condição de uso. Os *generics* vão ser por padrão um tipo não estabelecido e não iterável (significa que você precisará informar
quando um tipo genérico for um Array). 

Beleza, mas quando eu vou usar isso?

```typescript
// Vamos criar o tipo para não falhar para garantir a soma do nosso objeto
// ou lista de números
type NumberMaybeObject<T> = T extends number ? number : {
    [key in keyof T]: number|T[key]
}

// primeiro usando função da forma tradicional. O nosso T é
// o tipo genérico
function sum<T>(array: NumberMaybeObject<T>[], key?: keyof NumberMaybeObject<T>) {
    if(key !== undefined) {
        return array.reduce((acc,el) => acc + (el[key] as number),0)
    }
    return array.reduce((acc,el) => acc + (el as number), 0)
}

sum([1, 2, 3, 4, 5, 6, 7, 8]);
sum([ {a:1,b:"c"},{a:1,b:"c"},{a:1,b:"c"},{a:1,b:"c"},{a:1,b:"c"} ], "a");

// também pode ser declarada como 
// const sum = <T>() => {}
// Caso você esteja num arquivo .tsx, você deverá utilizar a primeira forma para evitar conflitos com JSX
```

Não se preocupe se você não entendeu, estou aqui para te explicar

- `type NumberMaybeObject`: Como nossa função pode receber tanto um número quanto um objeto, precisamos criar um tipo que controle o nosso *numerobjeto*. Basicamente esse tipo é lido como `Se meu genérico estender number, retorne number. Se não, retorne um objeto com as chaves do mesmo e valores que possam ser os próprios valores ou um número`

- `function sum`: Essa é uma função normal, exceto pelo `<T>` que informa o genérico. Os genéricos são coletados de acordo com a ordem dos parâmetros passados para a sua função. Nesse caso, recebemos `T` e no parâmetro dizemos que nossa variável `array` será um array de `T`, com o tipo `T[]` (também podemos usar `Array<T>`). 

- `key?: keyof T`: Nesse argumento, usamos o `?` para indicar que ele é opcional. Caso não seja informado, seu valor é `undefined`. Se o '
module.exports = {
    erroUso: new Error('\nnode index api [collection]\nou ' +
    '\nnode index route [collection] --[authenticated|public]\nou ' +
    '\nnode index ui [collection] --[authenticated|public]\n'),
    erroNomeCollection: new Error('\nEh necessario o nome de uma collection para ser criada\n'),
    erroRoute: new Error("\nnode index route [collection] --[authenticated|public]\n"),
    erroSucessao: new Error("\nO parametro -- deve ser sucedido de public ou authenticated\n"),
    erroUI: new Error("\nnode index ui [collection] --[authenticated|public]\n"),
    erroParametrosInvalidos: new Error("\nParametros invalidos\n"),
    erroDefinir: new Error("\nAnalisar\n"),
    erroAll: new Error("\nnode index all [collection] --[authenticated|public]\n")
}

var msg = require('./utilities_Msg'),
    uf = require('./utilities_File.js'),
    error = require('./errors.js'),
    fs = require('fs');

var params = [],
    basePath = 'imports/',
    action = "",
    tmpAction = "",
    template = "",
    collectionName = "",
    permission = "",
    isTemplate = false;

// constantes de acao
var ALL = "all",
    API = "api",
    ROUTE = "route",
    UI = "ui";


// constantes de permissao
var AUTHENTICATED = "authenticated",
    PUBLIC = "public";

// constante de separacao do parametro de permissao
var SEP = "--";

// checar se a chamada possui mais de 2 parametros
process.argv.forEach(function (val, index, array) {
    if (index > 1) { // pega a partir do segundo valor
        params.push(val);
    }
});

// verifica se ha mais de 2 parametros
if (params.length === 0) {
    console.error(error.erroUso);
    return;
}

// obtem a acao (all, api, ui, route),
// o nome da colecao,
// a permissao (public ou authenticated)
tmpAction = params[0].split(":");
action = tmpAction[0];
if (tmpAction.length > 1) {
    template = tmpAction[1];
    isTemplate = true;
}
collectionName = params[1];
permission = params[2];

// verifica se o nome da collection foi passado
if (!collectionName) {
    console.error(error.erroNomeCollection);
    return;
}

// se a acao nao eh 'api', ela precisa do parametro de permissao
if (action !== API) {

    // se a acao nao foi passada como parametro
    if (permission === undefined) {

        if (action === ROUTE) {
            console.error(error.erroRoute);
        }
        else if (action === UI) {
            console.error(error.erroUI);
        }
        else if (action === ALL) {
            console.error(error.erroAll);
        }
        else {
            console.error(error.erroUso);
        }
        return;

    }
    else {

        permission = permission.split(SEP);

        // se a permissao nao foi passada como --[permission]
        if (permission[0] === "") {

            if (permission[1] !== undefined
                && (permission[1] === AUTHENTICATED || permission[1] === PUBLIC)) {
                permission = permission[1];
            }
            else {
                console.error(error.erroSucessao);
                return;
            }
        } else {
            console.error(error.erroUso);
            return;
        }
    }
}

// funcao para criar os arquivos relacionados a API
var createAPI = function () {

    var path = basePath + 'api/' + collectionName,
        server = path + '/server',
        methods = server + '/methods.js',
        collectionJS = path + '/' + collectionName + '.js',
        publications = server + '/publications.js',
        serverAPI = basePath + 'startup/server/api.js',
        serverImports = path + '/server_imports.js';

    msg.inicio(API);

    uf.mkdir(path);

    uf.createFile(serverImports);
    uf.prepend(serverImports, msg.getImport('./server/methods.js'));
    uf.prepend(serverImports, msg.getImport('./server/publications.js'));

    uf.createFile(methods);

    if (isTemplate == true) {
        fs.readFile('./node_modules/synergia-scaffolding/templates/'+template+'-methods.txt', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }

            var tmpData = data.replace(/COLLECTION_VAR/g, msg.toCamelCase(collectionName));
            var result = tmpData.replace(/COLLECTION_NAME/g, collectionName);
            uf.append(methods, result);
            //console.log(result);

        });
    } else {
        uf.append(methods, msg.getImportFrom(collectionName, '../' + collectionName));
    }



    uf.createFile(collectionJS);
    if (isTemplate == true) {
        fs.readFile('./node_modules/synergia-scaffolding/templates/'+template+'-collections.txt', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }

            var tmpData = data.replace(/COLLECTION_VAR/g, msg.toCamelCase(collectionName));
            var result = tmpData.replace(/COLLECTION_NAME/g, collectionName);
            uf.append(collectionJS, result);
            //console.log(result);

        });
    } else {
        uf.append(collectionJS, msg.getMongoImport());
        uf.append(collectionJS, "\n\n");
        uf.append(collectionJS, msg.getCollectionExport(collectionName));
    }



    uf.createFile(publications);
    if (isTemplate == true) {
        fs.readFile('./node_modules/synergia-scaffolding/templates/'+template+'-publications.txt', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }

            var tmpData = data.replace(/COLLECTION_VAR/g, msg.toCamelCase(collectionName));
            var result = tmpData.replace(/COLLECTION_NAME/g, collectionName);
            uf.append(publications, result);
            //console.log(result);

        });
    } else {
        uf.prepend(publications, msg.getImportFrom(collectionName, '../' + collectionName));
    }


    uf.mkdir(path + "/client");

    msg.fim(API);

    msg.inicio("startup/server");

    uf.prepend(serverAPI, msg.getImport('../../api/' + collectionName + '/server_imports.js'));

    msg.fim("startup/server");

}

// funcao para criar os arquivos relacionados a Route
var createRoute = function () {

    var flowRouterName = "",
        flowRouter = "",
        fileImport = "",
        location = "",
        path = "",
        route = "";

    if (permission === AUTHENTICATED) {
        location = '/authenticated.js';
        flowRouterName = "authenticatedRoutes";
    }
    else if (permission === PUBLIC) {
        location = '/public.js';
        flowRouterName = "publicRoutes";
    }
    else {
        console.error(error.erroUso);
    }


    path = basePath + 'startup/client';
    route = path + '/routes' + location;
    fileImport = msg.getImport('../../../ui/' + permission + '/' + collectionName + '/' + collectionName);
    flowRouter = msg.getFlowRouterFunction(flowRouterName, collectionName);

    msg.inicio(ROUTE);

    uf.exists(route);
    uf.prepend(route, fileImport);
    uf.append(route, flowRouter);

    msg.fim(ROUTE);
}

// funcao para criar os arquivos relacionados a UI
var createUI = function () {

    var location = "",
        path = basePath + 'ui/',
        folder = path + permission + '/' + collectionName,
        htmlFile = folder + '/' + collectionName + '.html',
        jsFile = folder + '/' + collectionName + '.js',
        fileImport = msg.getImport('../../../ui/' + permission + '/' + collectionName);

    msg.inicio(UI);

    if (permission !== AUTHENTICATED && permission !== PUBLIC) {
        console.error(error.erroSucessao);
        return;
    }

    path = basePath + 'ui/';
    folder = path + permission + '/' + collectionName;
    htmlFile = folder + '/' + collectionName + '.html';
    jsFile = folder + '/' + collectionName + '.js';
    fileImport = msg.getImport('../../../ui/' + permission + '/' + collectionName);

    uf.mkdir(folder);
    uf.createFile(htmlFile);
    if (isTemplate == true) {
        fs.readFile('./node_modules/synergia-scaffolding/templates/'+template+'-htmlfile.txt', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }

            var tmpData = data.replace(/COLLECTION_VAR/g, msg.toCamelCase(collectionName));
            var result = tmpData.replace(/COLLECTION_NAME/g, collectionName);
            uf.append(htmlFile, result);
            //console.log(result);

        });
    } else {
        uf.prepend(htmlFile, msg.getTemplate(collectionName));
    }
    

    
    
    uf.createFile(jsFile);
    if (isTemplate == true) {
        fs.readFile('./node_modules/synergia-scaffolding/templates/'+template+'-htmlfile.txt', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }

            var tmpData = data.replace(/COLLECTION_VAR/g, msg.toCamelCase(collectionName));
            var result = tmpData.replace(/COLLECTION_NAME/g, collectionName);
            uf.append(jsFile, result);
            //console.log(result);

        });
    } else {
        uf.prepend(jsFile, msg.getImportFrom(collectionName, '../../../api/' + collectionName + '/' + collectionName));
        uf.prepend(jsFile, msg.getTemplateImport());
        uf.append(jsFile, 'import \'./' + collectionName + '.html\';');
    }    


    msg.fim(UI);
}

// CODIGO PRINCIPAL
if (action === ALL) {
    createAPI();
    createRoute();
    createUI();
}
else if (action === API) {
    createAPI();
}
else if (action === ROUTE) {
    createRoute();
}
else if (action === UI) {
    createUI();
}
else {
    console.error(errorr.erroUso);
}

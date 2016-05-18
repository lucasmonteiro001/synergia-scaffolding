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

//CARREGA INFORMAÇÕES DOS CAMPOS
var tagsDetalhesCampos = [];
var listaDeCampos = [];



// obtem a acao (all, api, ui, route),
// o nome da colecao,
// a permissao (public ou authenticated)
tmpAction = params[0].split(":");
action = tmpAction[0];
if (tmpAction.length > 1) {
    template = tmpAction[1];
    isTemplate = true;

    if (template != "" && uf.fileExists('./node_modules/synergia-scaffolding/templates/' + template + '/fields.csv')) {
        tagsDetalhesCampos = uf.getFieldsDescriptionsTAGFromCSV('./node_modules/synergia-scaffolding/templates/' + template + '/fields.csv');
        listaDeCampos = uf.getFieldsFromCSV('./node_modules/synergia-scaffolding/templates/' + template + '/fields.csv');
    }

} else {
    if (template != "" && uf.fileExists('./node_modules/synergia-scaffolding/templates/fields.csv')) {
        tagsDetalhesCampos = uf.getFieldsDescriptionsTAGFromCSV('./node_modules/synergia-scaffolding/templates/fields.csv');
        listaDeCampos = uf.getFieldsFromCSV('./node_modules/synergia-scaffolding/templates/fields.csv');
    }

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
    uf.setTemplateFile(serverImports,'serverImports',template,collectionName, function(err, data){
    });

    uf.createFile(methods);
    uf.setTemplateFile(methods,'methods',template,collectionName, function(err, data){
        getAllCollectionFieldsForCheck(listaDeCampos, function(err, data2){
            uf.updateFileWithOneTag(methods,'COLLECTION_FIELDS_FOR_CHECK',data2);
        });
    });

    uf.createFile(collectionJS);
    uf.setTemplateFile(collectionJS,'collectionJS',template,collectionName, function(err, data){
        getAllSchemaFieldItens(tagsDetalhesCampos,listaDeCampos, function(err, data2) {
            uf.updateFileWithOneTag(collectionJS,'SCHEMA_FIELD_ITENS',data2);
        });
    });


    uf.createFile(publications);
    uf.setTemplateFile(publications,'publications',template,collectionName, function(err, data){
    });


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

    var location = "";


    msg.inicio(UI);

    if (permission !== AUTHENTICATED && permission !== PUBLIC) {
        console.error(error.erroSucessao);
        return;
    }

    var path = basePath + 'ui/';
    var folder = path + permission + '/' + collectionName;
    var uiHTMLFile = folder + '/' + collectionName + '.html';
    var uiJSFile = folder + '/' + collectionName + '.js';
    var fileImport = msg.getImport('../../../ui/' + permission + '/' + collectionName);
    var menuFileAuthenticated = path + 'globals' + '/authenticated-menu.html',
        menuFilePublic = path + 'globals' + '/public-menu.html';

    //Alterar o Menu Principal
    var itemDeMenu = "<li class=\"{{currentRoute '"+collectionName+"'}}\"><a href=\"{{pathFor '"+collectionName+"'}}\"><i class=\"fa fa-diamond\"></i> <span class=\"nav-label\">"+msg.toCamelCase(collectionName)+"</span></a></li>";
    if(permission=='authenticated') {
        uf.insertLineInFileIfNotExists(menuFileAuthenticated,itemDeMenu,'</template>');
    } else if(permission=='public') {
        uf.insertLineInFileIfNotExists(menuFilePublic,itemDeMenu,'</template>');
    }

    uf.mkdir(folder);
    uf.createFile(uiHTMLFile);
    uf.setTemplateFile(uiHTMLFile,'uiHTMLFile',template,collectionName, function(err, data){
        getAllFormItens(tagsDetalhesCampos,listaDeCampos, function(err, data2){
            uf.updateFileWithOneTag(uiHTMLFile,'FORM_STRUTURE',data2);
        });
        setTimeout(function(){
            getFieldsForViewCollections(listaDeCampos, function(err, data3){
                uf.updateFileWithOneTag(uiHTMLFile,'FIELDS_FOR_VIEW_COLLECTIONS',data3);
            });

        }, 2500);



    });


    uf.createFile(uiJSFile);
    uf.setTemplateFile(uiJSFile,'uiJSFile',template,collectionName, function(err, data){
        getAllVarFormItens(listaDeCampos, function(err, data2){
            uf.updateFileWithOneTag(uiJSFile,'COLLECTION_FIELDS_JS',data2);
        });
    });




    msg.fim(UI);
}

getAllFormItens = function(tagsDetalhesCampos,listaDeCampos, callback) {

    var onComplete = function() {
        callback(null, formEstrutura);
    };
    var tasksToGo = listaDeCampos.length;

    var formEstrutura = "";
    for (var i = 0; i < listaDeCampos.length; i++) {

        uf.getFormItemFromTemplateFile(template,listaDeCampos[i],tagsDetalhesCampos,function(err, data){
            formEstrutura = formEstrutura+data;
            if (--tasksToGo === 0) {
                // No tasks left, good to go
                onComplete();
            }
        });

    }

}


getAllVarFormItens = function(listaDeCampos, callback) {
    var allVarFormItens = "";
    var onComplete = function() {
        callback(null, allVarFormItens);
    };
    var tasksToGo = listaDeCampos.length;


    for (var i = 0; i < listaDeCampos.length; i++) {
        var campo = listaDeCampos[i];
        allVarFormItens = allVarFormItens + campo['FIELD_NAME'] + ": template.find('[id=\"" + campo['FIELD_NAME'] + "\"]').value.trim(),\n";
        if (--tasksToGo === 0) {
            // No tasks left, good to go
            onComplete();
        }
    }

}

getFieldsForViewCollections = function(listaDeCampos, callback) {
    var fieldsForViewCollections = "";
    var onComplete = function() {
        callback(null, fieldsForViewCollections);
    };
    var tasksToGo = listaDeCampos.length;


    for (var i = 0; i < listaDeCampos.length; i++) {
        var campo = listaDeCampos[i];
        fieldsForViewCollections = fieldsForViewCollections +"{{"+ campo['FIELD_NAME'] +"}} | ";
        if (--tasksToGo === 0) {
            // No tasks left, good to go
            onComplete();
        }
    }

}

getAllCollectionFieldsForCheck = function(listaDeCampos, callback) {
    var allCollectionFieldsForCheck = "";
    var onComplete = function() {
        callback(null, allCollectionFieldsForCheck);
    };
    var tasksToGo = listaDeCampos.length;


    for (var i = 0; i < listaDeCampos.length; i++) {
        var campo = listaDeCampos[i];
        allCollectionFieldsForCheck = allCollectionFieldsForCheck + campo['FIELD_NAME'] + ": " + campo['COLLECTION_FIELD__TYPE'] + ", ";
        if (--tasksToGo === 0) {
            // No tasks left, good to go
            onComplete();
        }
    }

}

getAllSchemaFieldItens = function(tagsDetalhesCampos,listaDeCampos, callback) {

    var onComplete = function() {
        callback(null, schemaEstrutura);
    };
    var tasksToGo = listaDeCampos.length;

    var schemaEstrutura = "";
    for (var i = 0; i < listaDeCampos.length; i++) {

        uf.getSchemaFieldItemFromTemplateFile(template,listaDeCampos[i],tagsDetalhesCampos,function(err, data){
            schemaEstrutura = schemaEstrutura+data;
            if (--tasksToGo === 0) {
                // No tasks left, good to go
                onComplete();
            }
        });

    }

}


setTimeout(function(){
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

}, 1000);
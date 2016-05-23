var fs = require('fs');

var fileExists = function (filePath) {
    try {
        return fs.statSync(filePath).isFile();
    }
    catch (err) {
        return false;
    }
}

var toCamelCase = function toCamelCase(str){
    return str.split(' ').map(function(word){
        return word.charAt(0).toUpperCase() + word.slice(1);
    }).join('');
}

var getImport = function getImport(filename) {
    return 'import "' + filename.toLowerCase() + '";';
}

var getImportFrom = function getImportFrom(name, filename) {
    return 'import ' + '{ '+ toCamelCase(name) + ' } from "' + filename.toLowerCase() + '";';
}

var getTemplate = function getTemplate(collectionName) {
    return '<template name="' + collectionName
        + '">\n\nAqui vai seu codigo!\n\n</template>';
}

var getTemplateImport = function getTemplateImport() {
    return 'import { Template } from \'meteor/templating\';';
}

var getMongoImport = function getMongoImport() {
    return 'import { Mongo } from \'meteor/mongo\';';
}

var getCollectionExport = function getCollectionExport(collectionName) {
    return 'export const ' + toCamelCase(collectionName)
        + ' = new Mongo.Collection(\'' + collectionName + '\');'
}

var getFlowRouterFunction = function getFlowRouterFunction(flowRouterName, keyTemplate, collectionName,callback) {
    var routers = "";

    var onComplete = function (result) {
        callback(null, result);
    };

    if (keyTemplate != "" && fileExists('./node_modules/synergia-scaffolding/templates/' + keyTemplate + '/uiHTMLFile.txt')) {

        fs.readFile('./node_modules/synergia-scaffolding/templates/' + keyTemplate + '/uiHTMLFile.txt', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }

            routers = "\n" + flowRouterName + '.route( \'/'+ collectionName
                +'\', {\n\tname: \''+ collectionName
                +'\',\n\taction() {\n\t\tBlazeLayout.render( \'default\', { yield: \''
                + collectionName + '\' } );\n\t} \n});';

            if(data.search("COLLECTION_NAMEAdd") != -1) {
                routers = routers + "\n" + flowRouterName + '.route( \'/'+ collectionName+"Add"
                    +'\', {\n\tname: \''+ collectionName+"Add"
                    +'\',\n\taction() {\n\t\tBlazeLayout.render( \'default\', { yield: \''
                    + collectionName+"Add" + '\' } );\n\t} \n});';
            }
            if(data.search("COLLECTION_NAMEEdit") > -1) {
                routers = routers + "\n" + flowRouterName + '.route( \'/'+ collectionName+"Edit/:_id"
                    +'\', {\n\tname: \''+ collectionName+"Edit"
                    +'\',\n\taction() {\n\t\tBlazeLayout.render( \'default\', { yield: \''
                    + collectionName+"Edit" + '\' } );\n\t} \n});';
            }
            if(data.search("COLLECTION_NAMEView") > -1) {
                routers = routers + "\n" + flowRouterName + '.route( \'/'+ collectionName+"View/:_id"
                    +'\', {\n\tname: \''+ collectionName+"View"
                    +'\',\n\taction() {\n\t\tBlazeLayout.render( \'default\', { yield: \''
                    + collectionName+"View" + '\' } );\n\t} \n});';
            }



            setTimeout(function(){
                onComplete(routers);

            }, 1000);

        });
    } else {
        routers = "\n" + flowRouterName + '.route( \'/'+ collectionName
            +'\', {\n\tname: \''+ collectionName
            +'\',\n\taction() {\n\t\tBlazeLayout.render( \'default\', { yield: \''
            + collectionName + '\' } );\n\t} \n});';

        onComplete(routers);
    }


}



var inicio = function inicio(text) {
    console.log("\n#####Inicio:\t" + text);
}

var fim = function fim(text) {
    console.log("#####Fim:\t" + text);
}

module.exports = {
    toCamelCase:toCamelCase,
    getImport:getImport,
    getImportFrom:getImportFrom,
    getTemplate:getTemplate,
    getTemplateImport:getTemplateImport,
    getMongoImport:getMongoImport,
    getCollectionExport:getCollectionExport,
    getFlowRouterFunction:getFlowRouterFunction,
    inicio:inicio,
    fim:fim
}

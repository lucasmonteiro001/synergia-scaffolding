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

var getFlowRouterFunction = function getFlowRouterFunction(flowRouterName, collectionName) {
    return "\n" + flowRouterName + '.route( \'/'+ collectionName
    +'\', {\n\tname: \''+ collectionName
    +'\',\n\taction() {\n\t\tBlazeLayout.render( \'default\', { yield: \''
    + collectionName + '\' } );\n\t} \n});';
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

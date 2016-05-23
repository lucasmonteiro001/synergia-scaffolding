var fs = require('fs');
var prependFile = require('prepend-file');
var fse = require('fs-extra');
var path = require('path');
var msg = require('./utilities_Msg');
var readline = require('readline');


var fileExists = function (filePath) {
    try {
        return fs.statSync(filePath).isFile();
    }
    catch (err) {
        return false;
    }
}


var readFile = function (file) {
    fs.readFile(file, 'utf8', function (err, contents) {
        if (err) console.log(err);
    });
};

var append = function (file, content) {

    try {

        contentExistisIntheFile(file, content, function(err,data) {

                if (data===false) {

                    fs.appendFile(file, content, function (err) {
                        if (err) {
                            console.log(err);
                            return;
                        }
                    });
                } else {
                    console.log(file + ": O conteúdo já foi inserido");
                }
            });


    } catch (e) {
        createFile(file);
        fs.appendFile(file, content, function (err) {
            if (err) {
                console.log(err);
                return;
            }
        });
    }

    console.log("Upd - " + file);
}

var prepend = function (file, content) {
    content = content + "\n";
    // fs.appendFileSync(file, content, encoding='utf8');
    try {
        contentExistisIntheFile(file, content, function(err,data) {

            if (data===false) {

                prependFile.sync(file, content);

            } else {
                console.log(file + ": O conteúdo já foi inserido");
            }
        });

    } catch (e) {
        createFile(file);
        prependFile.sync(file, content);
    }

    console.log("Upd - " + file);
}

var rmDir = function (path) {
    var files = [];
    if (fs.existsSync(path)) {
        files = fs.readdirSync(path);
        files.forEach(function (file, index) {
            var curPath = path + "/" + file;
            if (fs.lstatSync(curPath).isDirectory()) { // recurse
                rmDir(curPath);
            } else { // delete file
                fs.unlinkSync(curPath);
            }
            // console.log("Del - " + curPath);
        });
        fs.rmdirSync(path);
        console.log("Del - " + path);
    }
};

var mkdir = function (folder) {
    try {
        rmDir(folder);
    } catch (e) {

    }
    var r = fse.mkdirsSync(folder);
    if (r) console.log("Crt - " + folder);
}

// deletar arquivo ou pasta
var removeFile = function (el) {
    try {
        fs.unlinkSync(el);
        console.log("Del - " + el);
    } catch (e) {

    }
}

var createFile = function (file) {
    // primeiro remove o arquivo, depois cria
    try {
        removeFile(file);
    } catch (e) {

    }
    fse.createFileSync(file);
    console.log("Crt - " + file);
}

var exists = function (file) {
    fse.ensureFileSync(file);
}

var setTemplateFile = function (filePath, fileName, keyTemplate, collectionName, callback) {

    if (keyTemplate != "" && fileExists('./node_modules/synergia-scaffolding/templates/' + keyTemplate + '/' + fileName + '.txt')) {
        fs.readFile('./node_modules/synergia-scaffolding/templates/' + keyTemplate + '/' + fileName + '.txt', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            var tmpData = data.replace(/COLLECTION_VAR/g, msg.toCamelCase(collectionName));
            var result = tmpData.replace(/COLLECTION_NAME/g, collectionName);
            append(filePath, result);
            setTimeout(function () {
                callback(null, "Complete");
            }, 500);


        });
    } else {

        if (fileExists('./node_modules/synergia-scaffolding/templates/' + fileName + '.txt')) {
            fs.readFile('./node_modules/synergia-scaffolding/templates/' + fileName + '.txt', 'utf8', function (err, data) {
                if (err) {
                    return console.log(err);
                }
                var tmpData = data.replace(/COLLECTION_VAR/g, msg.toCamelCase(collectionName));
                var result = tmpData.replace(/COLLECTION_NAME/g, collectionName);
                append(filePath, result);
                setTimeout(function () {
                    callback(null, "Complete");
                }, 500);
            });

        }


    }

}

var updateFileWithManyTags = function (filePath, Tags, Valores) {

    var onComplete = function (result) {
        fs.truncate(filePath, 0, function () {
            append(filePath, result);
        })

    };
    var tasksToGo = Tags.length;

    var dataTmp = "";
    var result = "";

    if (filePath != "" && fileExists(filePath)) {
        fs.readFile(filePath, 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            dataTmp = data;
            for (var i = 0; i < Tags.length; i++) {
                var regex = new RegExp(Tags[i], 'g');
                dataTmp = dataTmp.replace(regex, Valores[Tags[i]]);
                if (--tasksToGo === 0) {
                    // No tasks left, good to go
                    onComplete(dataTmp);
                }
            }

        });
    }

}

var updateFileWithOneTag = function (filePath, Tag, Valor) {
    var onComplete = function (result) {
        fs.truncate(filePath, 0, function () {
            append(filePath, result);
        })


    };
    var dataTmp = "";
    var result = "";

    if (filePath != "" && fileExists(filePath)) {
        fs.readFile(filePath, 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            dataTmp = data;
            var regex = new RegExp(Tag, 'g');
            dataTmp = dataTmp.replace(regex, Valor);
            onComplete(dataTmp);
        });
    }

}

var getFormItemFromTemplateFile = function (keyTemplate, formItem, formTags, callback) {
    var dataTmp = "";
    var result = "";


    var onComplete = function (result) {
        callback(null, result);
    };
    var tasksToGo = formTags.length;

    var fileName = "itemFormTemplate-" + formItem["ITEM_TYPE"];

    if (keyTemplate != "" && fileExists('./node_modules/synergia-scaffolding/templates/' + keyTemplate + '/' + fileName + '.txt')) {
        fs.readFile('./node_modules/synergia-scaffolding/templates/' + keyTemplate + '/' + fileName + '.txt', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            dataTmp = data;
            for (var i = 0; i < formTags.length; i++) {
                var regex = new RegExp(formTags[i], 'g');
                dataTmp = dataTmp.replace(regex, formItem[formTags[i]]);
                if (--tasksToGo === 0) {
                    // No tasks left, good to go
                    onComplete(dataTmp);
                }
            }


        });
    } else {

        if (fileExists('./node_modules/synergia-scaffolding/templates/' + fileName + '.txt')) {
            fs.readFile('./node_modules/synergia-scaffolding/templates/' + fileName + '.txt', 'utf8', function (err, data) {
                if (err) {
                    return console.log(err);
                }
                dataTmp = data;

                for (var i = 0; i < formTags.length; i++) {
                    var regex = new RegExp(formTags[i], 'g');
                    dataTmp = dataTmp.replace(regex, formItem[formTags[i]]);
                    if (--tasksToGo === 0) {
                        // No tasks left, good to go
                        onComplete(dataTmp);
                    }
                }

            });

        } else {
            onComplete("");
        }


    }
}

var getSpanItemFromTemplateFile = function (keyTemplate, formItem, formTags, callback) {
    var dataTmp = "";
    var result = "";


    var onComplete = function (result) {
        callback(null, result);
    };
    var tasksToGo = formTags.length;

    var fileName = "itemFormTemplate-span";

    if (keyTemplate != "" && fileExists('./node_modules/synergia-scaffolding/templates/' + keyTemplate + '/' + fileName + '.txt')) {
        fs.readFile('./node_modules/synergia-scaffolding/templates/' + keyTemplate + '/' + fileName + '.txt', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            dataTmp = data;
            for (var i = 0; i < formTags.length; i++) {
                var regex = new RegExp(formTags[i], 'g');
                dataTmp = dataTmp.replace(regex, formItem[formTags[i]]);
                if (--tasksToGo === 0) {
                    // No tasks left, good to go
                    onComplete(dataTmp);
                }
            }


        });
    } else {

        if (fileExists('./node_modules/synergia-scaffolding/templates/' + fileName + '.txt')) {
            fs.readFile('./node_modules/synergia-scaffolding/templates/' + fileName + '.txt', 'utf8', function (err, data) {
                if (err) {
                    return console.log(err);
                }
                dataTmp = data;

                for (var i = 0; i < formTags.length; i++) {
                    var regex = new RegExp(formTags[i], 'g');
                    dataTmp = dataTmp.replace(regex, formItem[formTags[i]]);
                    if (--tasksToGo === 0) {
                        // No tasks left, good to go
                        onComplete(dataTmp);
                    }
                }

            });

        } else {
            onComplete("");
        }


    }
}

var getSchemaFieldItemFromTemplateFile = function (keyTemplate, formItem, formTags, callback) {
    var dataTmp = "";
    var result = "";


    var onComplete = function (result) {
        callback(null, result);
    };
    var tasksToGo = formTags.length;

    var fileName = 'collection-SchemaFieldTemplate';

    if (keyTemplate != "" && fileExists('./node_modules/synergia-scaffolding/templates/' + keyTemplate + '/' + fileName + '.txt')) {
        fs.readFile('./node_modules/synergia-scaffolding/templates/' + keyTemplate + '/' + fileName + '.txt', 'utf8', function (err, data) {
            if (err) {
                return console.log(err);
            }
            dataTmp = data;
            for (var i = 0; i < formTags.length; i++) {
                var regex = new RegExp(formTags[i], 'g');
                dataTmp = dataTmp.replace(regex, formItem[formTags[i]]);
                if (--tasksToGo === 0) {
                    // No tasks left, good to go
                    onComplete(dataTmp);
                }
            }


        });
    } else {

        if (fileExists('./node_modules/synergia-scaffolding/templates/' + fileName + '.txt')) {
            fs.readFile('./node_modules/synergia-scaffolding/templates/' + fileName + '.txt', 'utf8', function (err, data) {
                if (err) {
                    return console.log(err);
                }
                dataTmp = data;

                for (var i = 0; i < formTags.length; i++) {
                    var regex = new RegExp(formTags[i], 'g');
                    dataTmp = dataTmp.replace(regex, formItem[formTags[i]]);
                    if (--tasksToGo === 0) {
                        // No tasks left, good to go
                        onComplete(dataTmp);
                    }
                }

            });

        } else {
            onComplete("");
        }


    }
}


var getFieldsFromCSV = function (file) {

    var fileContents = fs.readFileSync(file);
    //var fileContents = fs.readFileSync(file);
    var lines = fileContents.toString().split('\n');
    var contador = 0;
    var listCampos = [];
    var cabecalho = [];


    for (var i = 0; i < lines.length; i++) {

        var campo = {};
        if (contador == 0) {
            cabecalho = lines[i].split(";");
        }
        else {
            var linha = lines[i];

            if (linha != "") {
                var dadosDoCampo = linha.split(";");

                for (j = 0; j < dadosDoCampo.length; j++) {
                    campo[cabecalho[j]] = dadosDoCampo[j];
                }
                listCampos.push(campo);
            }

        }

        contador = contador + 1;
    }
    return listCampos;


}

var getFieldsDescriptionsTAGFromCSV = function (file) {

    var fileContents = fs.readFileSync(file);
    //var fileContents = fs.readFileSync(file);
    var lines = fileContents.toString().split('\n');
    var contador = 0;
    var listCampos = [];
    var cabecalho = [];

    if (lines.length > 0) {
        return lines[0].split(";");
    } else {
        return cabecalho;
    }

}


var insertLineInFileIfNotExists = function (filePath, newLine, beforeOfLine) {

    var newFile = "";
    var existis = false;

    var onComplete = function (result) {
        if (existis == false && newLine != beforeOfLine) {
            fs.truncate(filePath, 0, function () {
                append(filePath, result);
            })
        }


    };


    var rd = readline.createInterface({
        input: fs.createReadStream(filePath),
        output: process.stdout,
        terminal: false
    });

    rd.on('line', function (line) {
        if (beforeOfLine == line) {
            newFile = newFile + newLine + "\n";
            newFile = newFile + line + "\n";
        }
        else {
            if (newLine == line) {
                existis = true;
            } else {
                newFile = newFile + line + "\n";
            }

        }



    }).on('close', () => {
        onComplete(newFile);
    });
    ;


}


var contentExistisIntheFile = function (filePath, newLine,callback) {

    var conteudo = "";
    var onComplete = function () {

        if(conteudo.length > 0 && conteudo.search(newLine) > -1) {
            callback(null,true);
        } else {
            callback(null,false);
        }


    };


    var rd = readline.createInterface({
        input: fs.createReadStream(filePath),
        output: process.stdout,
        terminal: false
    });

    rd.on('line', function (line) {
        conteudo = conteudo + line;

    }).on('close', () => {
        onComplete();
    });
    ;


}

module.exports = {
    createFile: createFile,
    mkdir: mkdir,
    prepend: prepend,
    append: append,
    readFile: readFile,
    exists: exists,
    setTemplateFile: setTemplateFile,
    getFieldsDescriptionsTAGFromCSV: getFieldsDescriptionsTAGFromCSV,
    getFieldsFromCSV: getFieldsFromCSV,
    getFormItemFromTemplateFile: getFormItemFromTemplateFile,
    updateFileWithOneTag: updateFileWithOneTag,
    updateFileWithManyTags: updateFileWithManyTags,
    getSchemaFieldItemFromTemplateFile: getSchemaFieldItemFromTemplateFile,
    fileExists: fileExists,
    insertLineInFileIfNotExists: insertLineInFileIfNotExists,
    contentExistisIntheFile:contentExistisIntheFile,
    getSpanItemFromTemplateFile:getSpanItemFromTemplateFile

}

var fs = require('fs');
var prependFile = require('prepend-file');
var fse = require('fs-extra');

var readFile = function(file) {
    fs.readFile(file, 'utf8', function(err, contents) {
        if(err) console.log(err);
        console.log(contents);
    });
};

var append = function(file, content) {

    try {
        fs.appendFile(file, content, function (err) {
            if(err) {
                console.log(err);
                return;
            }
        });
    } catch (e) {
        createFile(file);
        fs.appendFile(file, content, function (err) {
            if(err) {
                console.log(err);
                return;
            }
        });
    }

    console.log("Upd - " + file);
}

var prepend = function(file, content) {
    content = content + "\n";
    // fs.appendFileSync(file, content, encoding='utf8');
    try {
        prependFile.sync(file, content);
    } catch (e) {
        createFile(file);
        prependFile.sync(file, content);
    }

    console.log("Upd - " + file);
}

var rmDir = function(path) {
    var files = [];
    if( fs.existsSync(path) ) {
        files = fs.readdirSync(path);
        files.forEach(function(file,index){
            var curPath = path + "/" + file;
            if(fs.lstatSync(curPath).isDirectory()) { // recurse
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

var mkdir = function(folder) {
    try {
        rmDir(folder);
    } catch (e) {

    }
    var r = fse.mkdirsSync(folder);
    if(r) console.log("Crt - " + folder);
}

// deletar arquivo ou pasta
var removeFile = function(el) {
    try {
        fs.unlinkSync(el);
        console.log("Del - " + el);
    } catch (e) {

    }
}

var createFile = function(file) {
    // primeiro remove o arquivo, depois cria
    try {
        removeFile(file);
    } catch (e) {

    }
    fse.createFileSync(file);
    console.log("Crt - " + file);
}

var exists = function(file) {
    fse.ensureFileSync(file);
}

module.exports = {
    createFile: createFile,
    mkdir: mkdir,
    prepend: prepend,
    append: append,
    readFile: readFile,
    exists: exists
}